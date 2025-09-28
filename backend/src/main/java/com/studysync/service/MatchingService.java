package com.studysync.service;

import com.studysync.dto.MatchCandidateDto;
import com.studysync.dto.MatchSummaryDto;
import com.studysync.model.AiMatchSuggestion;
import com.studysync.model.Match;
import com.studysync.model.User;
import com.studysync.model.enums.MatchStatus;
import com.studysync.repository.ChatMessageRepository;
import com.studysync.repository.MatchRepository;
import com.studysync.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class MatchingService {

    private static final Logger LOGGER = LoggerFactory.getLogger(MatchingService.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final MatchRepository matchRepository;
    private final UserRepository userRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final GeminiAiService geminiAiService;
    private final LocationService locationService;

    public MatchingService(MatchRepository matchRepository,
            UserRepository userRepository,
            ChatMessageRepository chatMessageRepository,
            GeminiAiService geminiAiService,
            LocationService locationService) {
        this.matchRepository = matchRepository;
        this.userRepository = userRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.geminiAiService = geminiAiService;
        this.locationService = locationService;
    }

    @Transactional(readOnly = true)
    public List<MatchCandidateDto> findPotentialMatches(User currentUser) {
        if (currentUser == null || currentUser.getId() == null) {
            return List.of();
        }

        List<User> allUsers = userRepository.findAll();
        List<MatchCandidateDto> candidates = new ArrayList<>();

        for (User candidate : allUsers) {
            if (candidate.getId().equals(currentUser.getId())) {
                continue;
            }
            if (!candidate.isProfileCompleted()) {
                continue;
            }

            MatchCandidateDto dto = buildCandidateDto(currentUser, candidate);
            if (dto != null) {
                candidates.add(dto);
            }
        }

        return candidates.stream()
                .sorted((a, b) -> Integer.compare(b.getCompatibilityScore(), a.getCompatibilityScore()))
                .limit(12)
                .collect(Collectors.toList());
    }

    @Transactional
    public Match processSwipe(User currentUser, User targetUser, boolean liked) {
        if (currentUser == null || targetUser == null) {
            return null;
        }

        User refreshedCurrent = userRepository.findById(currentUser.getId()).orElse(null);
        User refreshedTarget = userRepository.findById(targetUser.getId()).orElse(null);

        if (refreshedCurrent == null || refreshedTarget == null) {
            return null;
        }

        Match existingMatch = matchRepository.findByUsers(refreshedCurrent, refreshedTarget);

        if (existingMatch != null) {
            if (liked && existingMatch.getStatus() == MatchStatus.PENDING) {
                existingMatch.setStatus(MatchStatus.MATCHED);
                existingMatch.setMatchedAt(java.time.LocalDateTime.now());
                return matchRepository.save(existingMatch);
            }
            if (!liked) {
                existingMatch.setStatus(MatchStatus.REJECTED);
                return matchRepository.save(existingMatch);
            }
            return existingMatch;
        }

        Match newMatch = new Match();
        newMatch.setUser1(refreshedCurrent);
        newMatch.setUser2(refreshedTarget);

        Set<String> sharedClasses = computeSharedClasses(refreshedCurrent, refreshedTarget);
        newMatch.setSharedClasses(new ArrayList<>(sharedClasses));

        int compatibilityScore = (int) Math.round(
                calculateCompatibilityScore(refreshedCurrent, refreshedTarget, new ArrayList<>(sharedClasses)) * 100);
        newMatch.setCompatibilityScore(compatibilityScore);

        if (liked) {
            newMatch.setStatus(MatchStatus.PENDING);
        } else {
            newMatch.setStatus(MatchStatus.REJECTED);
        }

        return matchRepository.save(newMatch);
    }

    @Transactional(readOnly = true)
    public List<MatchSummaryDto> getUserMatches(User currentUser) {
        if (currentUser == null || currentUser.getId() == null) {
            return List.of();
        }

        User refreshedCurrent = userRepository.findById(currentUser.getId()).orElse(null);
        if (refreshedCurrent == null) {
            return List.of();
        }

        List<Match> matches = matchRepository.findByUser1OrUser2(refreshedCurrent, refreshedCurrent);

        return matches.stream()
                .map(match -> mapToSummary(refreshedCurrent, match))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Match getMatchById(Long matchId) {
        return matchRepository.findById(matchId).orElse(null);
    }

    private MatchCandidateDto buildCandidateDto(User currentUser, User candidate) {
        Set<String> sharedClasses = computeSharedClasses(currentUser, candidate);
        if (sharedClasses.isEmpty()) {
            return null;
        }

        List<String> sharedGoals = computeSharedGoals(currentUser, candidate);

        double baseCompatibility = calculateCompatibilityScore(currentUser, candidate, new ArrayList<>(sharedClasses));
        int compatibilityPercent = (int) Math.round(baseCompatibility * 100);

        Double aiCompatibilityPercent = null;
        String aiSummary = null;

        try {
            Mono<AiMatchSuggestion> suggestionMono = geminiAiService.generateMatchSuggestion(currentUser, candidate);
            AiMatchSuggestion suggestion = suggestionMono.block(Duration.ofSeconds(6));
            if (suggestion != null) {
                if (suggestion.getCompatibilityScore() != null) {
                    aiCompatibilityPercent = suggestion.getCompatibilityScore() * 100.0;
                    if (aiCompatibilityPercent > 100) {
                        aiCompatibilityPercent = 100.0;
                    }
                }
                aiSummary = suggestion.getAiReasoning();
            }
        } catch (Exception ex) {
            LOGGER.warn("Gemini AI suggestion failed: {}", ex.getMessage());
        }

        if (aiSummary == null || aiSummary.isBlank()) {
            aiSummary = buildFallbackSummary(candidate, sharedClasses, sharedGoals);
        }

        String distance = locationService.getDistanceDescription(currentUser, candidate);
        String studyStyle = candidate.getStudyStyle() != null ? candidate.getStudyStyle().name() : null;

        return new MatchCandidateDto(
                candidate.getId(),
                candidate.getFirstName(),
                candidate.getLastName(),
                candidate.getMajor(),
                candidate.getStudyYear(),
                studyStyle,
                candidate.getProfilePicture(),
                sharedClasses,
                sharedGoals,
                compatibilityPercent,
                aiCompatibilityPercent,
                aiSummary,
                distance);
    }

    private Set<String> computeSharedClasses(User currentUser, User candidate) {
        Set<String> shared = new HashSet<>(currentUser.getClasses());
        shared.retainAll(candidate.getClasses());
        return shared;
    }

    private List<String> computeSharedGoals(User currentUser, User candidate) {
        if (currentUser.getGoals() == null || candidate.getGoals() == null) {
            return List.of();
        }
        return currentUser.getGoals().stream()
                .filter(goal -> goal != null && candidate.getGoals().contains(goal))
                .collect(Collectors.toList());
    }

    private String buildFallbackSummary(User candidate, Set<String> sharedClasses, List<String> sharedGoals) {
        StringBuilder summary = new StringBuilder();
        summary.append("You both share ");
        summary.append(sharedClasses.size());
        summary.append(sharedClasses.size() == 1 ? " class" : " classes");

        if (!sharedGoals.isEmpty()) {
            summary.append(" and have similar goals like ");
            summary.append(sharedGoals.get(0));
            if (sharedGoals.size() > 1) {
                summary.append(" and more");
            }
            summary.append(".");
        } else {
            summary.append(", making collaboration easier.");
        }
        if (candidate.getStudyStyle() != null) {
            summary.append(" Their preferred study style is ")
                    .append(candidate.getStudyStyle().name().toLowerCase().replace("_", " "))
                    .append(".");
        }
        return summary.toString();
    }

    private MatchSummaryDto mapToSummary(User currentUser, Match match) {
        User partner = match.getUser1().getId().equals(currentUser.getId()) ? match.getUser2() : match.getUser1();

        if (partner == null) {
            return null;
        }

        String partnerName = (partner.getFirstName() != null ? partner.getFirstName() : "")
                + (partner.getLastName() != null ? " " + partner.getLastName() : "");
        partnerName = partnerName.trim().isEmpty() ? partner.getUsername() : partnerName.trim();

        String lastMessage = null;
        String lastMessageTime = null;
        var messages = chatMessageRepository.findByMatchIdOrderByTimestampAsc(match.getId());
        if (!messages.isEmpty()) {
            var latest = messages.get(messages.size() - 1);
            lastMessage = latest.getMessage();
            lastMessageTime = latest.getTimestamp() != null ? latest.getTimestamp().format(DATE_FORMATTER) : null;
        }

        return new MatchSummaryDto(
                match.getId(),
                partner.getId(),
                partnerName,
                partner.getMajor(),
                partner.getStudyYear(),
                partner.getStudyStyle() != null ? partner.getStudyStyle().name() : null,
                partner.getProfilePicture(),
                match.getStatus(),
                match.getCompatibilityScore() != null ? match.getCompatibilityScore() : 0,
                lastMessage,
                lastMessageTime);
    }

    private double calculateCompatibilityScore(User user1, User user2, List<String> sharedClasses) {
        double score = 0.0;

        if (sharedClasses != null && !sharedClasses.isEmpty()) {
            double classScore = (double) sharedClasses.size()
                    / Math.max(user1.getClasses().size(), user2.getClasses().size());
            score += classScore * 0.4;
        }

        if (user1.getStudyStyle() != null && user2.getStudyStyle() != null) {
            if (user1.getStudyStyle() == user2.getStudyStyle()) {
                score += 0.3;
            } else {
                score += 0.15;
            }
        }

        if (user1.getGoals() != null && user2.getGoals() != null) {
            boolean hasSharedGoal = user1.getGoals().stream()
                    .anyMatch(goal -> goal != null && user2.getGoals().contains(goal));
            if (hasSharedGoal) {
                score += 0.2;
            } else {
                score += 0.1;
            }
        }

        if (locationService.areUsersNearby(user1, user2, 10.0)) {
            score += 0.1;
        }

        return Math.min(1.0, score);
    }
}