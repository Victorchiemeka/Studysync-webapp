package com.studysync.controller;

import com.studysync.model.AiMatchSuggestion;
import com.studysync.model.User;
import com.studysync.repository.AiMatchSuggestionRepository;
import com.studysync.service.GeminiAiService;
import com.studysync.service.LocationService;
import com.studysync.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = { "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001",
        "http://127.0.0.1:3001" }, allowCredentials = "true")
public class AiController {

    @Autowired
    private GeminiAiService geminiAiService;

    @Autowired
    private LocationService locationService;

    @Autowired
    private AiMatchSuggestionRepository aiMatchSuggestionRepository;

    @Autowired
    private UserService userService;

    @PostMapping("/generate-match/{userId}/{targetUserId}")
    public ResponseEntity<Mono<AiMatchSuggestion>> generateMatchSuggestion(
            @PathVariable Long userId,
            @PathVariable Long targetUserId) {

        User currentUser = userService.findById(userId);
        User targetUser = userService.findById(targetUserId);

        if (currentUser == null || targetUser == null) {
            return ResponseEntity.notFound().build();
        }

        Mono<AiMatchSuggestion> suggestionMono = geminiAiService.generateMatchSuggestion(currentUser, targetUser)
                .map(suggestion -> {
                    if (currentUser.getLatitude() != null && targetUser.getLatitude() != null) {
                        double distance = locationService.calculateUserDistance(currentUser, targetUser);
                        suggestion.setDistanceKm(distance);
                    }
                    return aiMatchSuggestionRepository.save(suggestion);
                });

        return ResponseEntity.ok(suggestionMono);
    }

    @GetMapping("/matches/{userId}")
    public ResponseEntity<List<AiMatchSuggestion>> getUserMatches(@PathVariable Long userId) {
        User user = userService.findById(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        List<AiMatchSuggestion> matches = aiMatchSuggestionRepository.findByUserOrderByCompatibilityScoreDesc(user);
        return ResponseEntity.ok(matches);
    }

    @GetMapping("/matches/{userId}/pending")
    public ResponseEntity<List<AiMatchSuggestion>> getPendingMatches(@PathVariable Long userId) {
        User user = userService.findById(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        List<AiMatchSuggestion> pendingMatches = aiMatchSuggestionRepository
                .findByUserAndStatusOrderByCompatibilityScoreDesc(user, AiMatchSuggestion.SuggestionStatus.PENDING);

        return ResponseEntity.ok(pendingMatches);
    }

    @GetMapping("/matches/{userId}/high-quality")
    public ResponseEntity<List<AiMatchSuggestion>> getHighQualityMatches(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0.7") Double minScore) {

        User user = userService.findById(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        List<AiMatchSuggestion> highQualityMatches = aiMatchSuggestionRepository
                .findHighQualityMatches(user, AiMatchSuggestion.SuggestionStatus.PENDING, minScore);

        return ResponseEntity.ok(highQualityMatches);
    }

    @PostMapping("/matches/{matchId}/view")
    public ResponseEntity<AiMatchSuggestion> markAsViewed(@PathVariable Long matchId) {
        return aiMatchSuggestionRepository.findById(matchId)
                .map(match -> {
                    match.setStatus(AiMatchSuggestion.SuggestionStatus.VIEWED);
                    return ResponseEntity.ok(aiMatchSuggestionRepository.save(match));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/matches/{matchId}/like")
    public ResponseEntity<AiMatchSuggestion> likeMatch(@PathVariable Long matchId) {
        return aiMatchSuggestionRepository.findById(matchId)
                .map(match -> {
                    match.setStatus(AiMatchSuggestion.SuggestionStatus.LIKED);
                    return ResponseEntity.ok(aiMatchSuggestionRepository.save(match));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/matches/{matchId}/reject")
    public ResponseEntity<AiMatchSuggestion> rejectMatch(@PathVariable Long matchId) {
        return aiMatchSuggestionRepository.findById(matchId)
                .map(match -> {
                    match.setStatus(AiMatchSuggestion.SuggestionStatus.REJECTED);
                    return ResponseEntity.ok(aiMatchSuggestionRepository.save(match));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/study-recommendations/{userId}")
    public ResponseEntity<Mono<String>> getStudyRecommendations(
            @PathVariable Long userId,
            @RequestBody StudyRecommendationRequest request) {

        User user = userService.findById(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        Mono<String> recommendations = geminiAiService.generateStudyRecommendations(user,
                request.getAvailableTimeSlots());
        return ResponseEntity.ok(recommendations);
    }

    @PostMapping("/compatibility/{userId1}/{userId2}")
    public ResponseEntity<Mono<Double>> calculateCompatibility(
            @PathVariable Long userId1,
            @PathVariable Long userId2) {

        User user1 = userService.findById(userId1);
        User user2 = userService.findById(userId2);

        if (user1 == null || user2 == null) {
            return ResponseEntity.notFound().build();
        }

        Mono<Double> compatibility = geminiAiService.calculateStudyCompatibility(user1, user2);
        return ResponseEntity.ok(compatibility);
    }

    @GetMapping("/matches/{userId}/nearby")
    public ResponseEntity<List<AiMatchSuggestion>> getNearbyMatches(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "10.0") Double maxDistanceKm) {

        User user = userService.findById(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        List<AiMatchSuggestion> nearbyMatches = aiMatchSuggestionRepository.findNearbyMatches(user, maxDistanceKm);
        return ResponseEntity.ok(nearbyMatches);
    }

    @GetMapping("/matches/{userId}/recent")
    public ResponseEntity<List<AiMatchSuggestion>> getRecentMatches(@PathVariable Long userId) {
        User user = userService.findById(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        LocalDateTime oneWeekAgo = LocalDateTime.now().minusWeeks(1);
        List<AiMatchSuggestion> recentMatches = aiMatchSuggestionRepository.findRecentSuggestions(user, oneWeekAgo);

        return ResponseEntity.ok(recentMatches);
    }

    @GetMapping("/stats/{userId}")
    public ResponseEntity<MatchStats> getMatchStats(@PathVariable Long userId) {
        User user = userService.findById(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        Long pendingCount = aiMatchSuggestionRepository.countByUserAndStatus(user,
                AiMatchSuggestion.SuggestionStatus.PENDING);
        Long viewedCount = aiMatchSuggestionRepository.countByUserAndStatus(user,
                AiMatchSuggestion.SuggestionStatus.VIEWED);
        Long likedCount = aiMatchSuggestionRepository.countByUserAndStatus(user,
                AiMatchSuggestion.SuggestionStatus.LIKED);
        Long matchedCount = aiMatchSuggestionRepository.countByUserAndStatus(user,
                AiMatchSuggestion.SuggestionStatus.MATCHED);

        MatchStats stats = new MatchStats(pendingCount, viewedCount, likedCount, matchedCount);
        return ResponseEntity.ok(stats);
    }

    // DTOs
    public static class StudyRecommendationRequest {
        private List<String> availableTimeSlots;

        public List<String> getAvailableTimeSlots() {
            return availableTimeSlots;
        }

        public void setAvailableTimeSlots(List<String> availableTimeSlots) {
            this.availableTimeSlots = availableTimeSlots;
        }
    }

    public static class MatchStats {
        private Long pendingMatches;
        private Long viewedMatches;
        private Long likedMatches;
        private Long totalMatches;

        public MatchStats(Long pendingMatches, Long viewedMatches, Long likedMatches, Long totalMatches) {
            this.pendingMatches = pendingMatches;
            this.viewedMatches = viewedMatches;
            this.likedMatches = likedMatches;
            this.totalMatches = totalMatches;
        }

        public Long getPendingMatches() {
            return pendingMatches;
        }

        public Long getViewedMatches() {
            return viewedMatches;
        }

        public Long getLikedMatches() {
            return likedMatches;
        }

        public Long getTotalMatches() {
            return totalMatches;
        }
    }
}