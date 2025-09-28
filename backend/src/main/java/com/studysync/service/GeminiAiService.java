package com.studysync.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.studysync.model.AiMatchSuggestion;
import com.studysync.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiAiService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent}")
    private String geminiApiUrl;

    public GeminiAiService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    /**
     * Generate AI-powered match suggestions using Gemini AI
     */
    public Mono<AiMatchSuggestion> generateMatchSuggestion(User currentUser, User potentialMatch) {
        String prompt = buildMatchingPrompt(currentUser, potentialMatch);

        return callGeminiApi(prompt)
                .map(response -> parseMatchResponse(response, currentUser, potentialMatch))
                .onErrorReturn(createFallbackSuggestion(currentUser, potentialMatch));
    }

    /**
     * Generate study recommendations based on user profile and calendar
     */
    public Mono<String> generateStudyRecommendations(User user, List<String> availableTimeSlots) {
        String prompt = buildStudyRecommendationPrompt(user, availableTimeSlots);

        return callGeminiApi(prompt)
                .map(this::extractTextFromResponse)
                .onErrorReturn("Unable to generate personalized recommendations at this time. Please try again later.");
    }

    /**
     * Analyze study session compatibility
     */
    public Mono<Double> calculateStudyCompatibility(User user1, User user2) {
        String prompt = buildCompatibilityPrompt(user1, user2);

        return callGeminiApi(prompt)
                .map(this::parseCompatibilityScore)
                .onErrorReturn(0.5); // Default neutral score
    }

    private Mono<String> callGeminiApi(String prompt) {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            return Mono.error(new RuntimeException("Gemini API key not configured"));
        }

        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(Map.of("text", prompt)));
        requestBody.put("contents", List.of(content));

        return webClient.post()
                .uri(geminiApiUrl + "?key=" + geminiApiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class);
    }

    private String buildMatchingPrompt(User currentUser, User potentialMatch) {
        return String.format(
                "Analyze the compatibility between two students for study partnerships.\n\n" +
                        "Student 1:\n" +
                        "- Name: %s\n" +
                        "- Major: %s\n" +
                        "- Year: %s\n" +
                        "- Classes: %s\n" +
                        "- Study Style: %s\n" +
                        "- Goals: %s\n" +
                        "- Availability: %s\n\n" +
                        "Student 2:\n" +
                        "- Name: %s\n" +
                        "- Major: %s\n" +
                        "- Year: %s\n" +
                        "- Classes: %s\n" +
                        "- Study Style: %s\n" +
                        "- Goals: %s\n" +
                        "- Availability: %s\n\n" +
                        "Please provide a compatibility score (0.0 to 1.0) and a brief explanation " +
                        "of why they would be good study partners. Focus on shared classes, " +
                        "complementary study styles, and schedule compatibility.\n\n" +
                        "Format your response as JSON:\n" +
                        "{\n" +
                        "  \"compatibilityScore\": 0.0-1.0,\n" +
                        "  \"reasoning\": \"explanation\",\n" +
                        "  \"sharedInterests\": [\"shared classes or interests\"]\n" +
                        "}",
                currentUser.getName(), currentUser.getMajor(), currentUser.getStudyYear(),
                currentUser.getClasses(), currentUser.getStudyStyle(), currentUser.getGoals(),
                currentUser.getAvailability(),
                potentialMatch.getName(), potentialMatch.getMajor(), potentialMatch.getStudyYear(),
                potentialMatch.getClasses(), potentialMatch.getStudyStyle(), potentialMatch.getGoals(),
                potentialMatch.getAvailability());
    }

    private String buildStudyRecommendationPrompt(User user, List<String> availableTimeSlots) {
        return String.format(
                "Generate personalized study recommendations for a student.\n\n" +
                        "Student Profile:\n" +
                        "- Major: %s\n" +
                        "- Year: %s\n" +
                        "- Classes: %s\n" +
                        "- Study Style: %s\n" +
                        "- Goals: %s\n" +
                        "- Available Time Slots: %s\n\n" +
                        "Please provide specific, actionable study recommendations including:\n" +
                        "1. Optimal study schedule based on their available time\n" +
                        "2. Study techniques that match their learning style\n" +
                        "3. Subject prioritization based on their classes\n" +
                        "4. Collaboration opportunities\n\n" +
                        "Keep the response concise and practical.",
                user.getMajor(), user.getStudyYear(), user.getClasses(),
                user.getStudyStyle(), user.getGoals(), availableTimeSlots);
    }

    private String buildCompatibilityPrompt(User user1, User user2) {
        return String.format(
                "Rate the study compatibility between these two students on a scale of 0.0 to 1.0.\n\n" +
                        "Student 1: Major=%s, Year=%s, Style=%s, Goals=%s, Classes=%s\n" +
                        "Student 2: Major=%s, Year=%s, Style=%s, Goals=%s, Classes=%s\n\n" +
                        "Consider shared classes, complementary skills, and study style compatibility. " +
                        "Respond with only the numerical score (e.g., 0.85).",
                user1.getMajor(), user1.getStudyYear(), user1.getStudyStyle(), user1.getGoals(), user1.getClasses(),
                user2.getMajor(), user2.getStudyYear(), user2.getStudyStyle(), user2.getGoals(), user2.getClasses());
    }

    private AiMatchSuggestion parseMatchResponse(String response, User currentUser, User potentialMatch) {
        try {
            JsonNode jsonResponse = objectMapper.readTree(response);
            JsonNode candidates = jsonResponse.get("candidates");

            if (candidates != null && candidates.isArray() && candidates.size() > 0) {
                String content = candidates.get(0).get("content").get("parts").get(0).get("text").asText();

                // Try to parse as JSON
                JsonNode matchData = objectMapper.readTree(content);

                AiMatchSuggestion suggestion = new AiMatchSuggestion(currentUser, potentialMatch,
                        matchData.get("compatibilityScore").asDouble(),
                        matchData.get("reasoning").asText());

                if (matchData.has("sharedInterests")) {
                    suggestion.setSharedInterests(matchData.get("sharedInterests").toString());
                }

                return suggestion;
            }
        } catch (Exception e) {
            // Log error and return fallback
            System.err.println("Error parsing AI response: " + e.getMessage());
        }

        return createFallbackSuggestion(currentUser, potentialMatch);
    }

    private String extractTextFromResponse(String response) {
        try {
            JsonNode jsonResponse = objectMapper.readTree(response);
            JsonNode candidates = jsonResponse.get("candidates");

            if (candidates != null && candidates.isArray() && candidates.size() > 0) {
                return candidates.get(0).get("content").get("parts").get(0).get("text").asText();
            }
        } catch (Exception e) {
            System.err.println("Error extracting text from AI response: " + e.getMessage());
        }

        return "Unable to generate recommendations at this time.";
    }

    private Double parseCompatibilityScore(String response) {
        try {
            String text = extractTextFromResponse(response);
            // Try to extract a number from the response
            String[] parts = text.split("\\s+");
            for (String part : parts) {
                try {
                    double score = Double.parseDouble(part.trim());
                    if (score >= 0.0 && score <= 1.0) {
                        return score;
                    }
                } catch (NumberFormatException ignored) {
                }
            }
        } catch (Exception e) {
            System.err.println("Error parsing compatibility score: " + e.getMessage());
        }

        return 0.5; // Default neutral score
    }

    private AiMatchSuggestion createFallbackSuggestion(User currentUser, User potentialMatch) {
        // Calculate basic compatibility based on shared classes
        double score = calculateBasicCompatibility(currentUser, potentialMatch);

        AiMatchSuggestion suggestion = new AiMatchSuggestion(currentUser, potentialMatch, score,
                "Basic compatibility calculated based on shared interests and study preferences.");

        return suggestion;
    }

    private double calculateBasicCompatibility(User user1, User user2) {
        double score = 0.0;

        // Check for shared classes
        long sharedClasses = user1.getClasses().stream()
                .filter(cls -> user2.getClasses().contains(cls))
                .count();

        if (sharedClasses > 0) {
            score += 0.4 * Math.min(1.0, sharedClasses / 3.0); // Up to 40% for shared classes
        }

        // Check for compatible study styles
        if (user1.getStudyStyle() == user2.getStudyStyle()) {
            score += 0.3;
        }

        // Check for similar goals
        if (user1.getGoals() == user2.getGoals()) {
            score += 0.2;
        }

        // Base score for any potential match
        score += 0.1;

        return Math.min(1.0, score);
    }
}