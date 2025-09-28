package com.studysync.controller;

import com.studysync.dto.MatchCandidateDto;
import com.studysync.dto.MatchSummaryDto;
import com.studysync.model.Match;
import com.studysync.model.User;
import com.studysync.service.MatchingService;
import com.studysync.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/matching")
@CrossOrigin(origins = { "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001",
        "http://127.0.0.1:3001" }, allowCredentials = "true")
public class MatchingController {

    @Autowired
    private MatchingService matchingService;

    @Autowired
    private UserService userService;

    @GetMapping("/potential-matches/{userId}")
    public ResponseEntity<?> getPotentialMatches(@PathVariable Long userId) {
        try {
            User user = userService.findById(userId);
            if (user == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.badRequest().body(response);
            }

            List<MatchCandidateDto> potentialMatches = matchingService.findPotentialMatches(user);
            return ResponseEntity.ok(potentialMatches);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to find matches");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/potential")
    public ResponseEntity<?> getPotentialMatchesSession(HttpServletRequest request) {
        try {
            Long userId = (Long) request.getSession().getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }

            User currentUser = userService.findById(userId);
            if (currentUser == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            List<MatchCandidateDto> potentialMatches = matchingService.findPotentialMatches(currentUser);
            return ResponseEntity.ok(potentialMatches);

        } catch (Exception e) {
            System.err.println("Error getting potential matches: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error"));
        }
    }

    @PostMapping("/swipe")
    public ResponseEntity<?> swipe(@RequestBody Map<String, Object> swipeData) {
        try {
            Long userId = Long.parseLong(swipeData.get("userId").toString());
            Long targetUserId = Long.parseLong(swipeData.get("targetUserId").toString());
            boolean liked = (Boolean) swipeData.get("liked");

            User user = userService.findById(userId);
            User targetUser = userService.findById(targetUserId);

            if (user == null || targetUser == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.badRequest().body(response);
            }

            Match matchResult = matchingService.processSwipe(user, targetUser, liked);

            boolean isMatch = matchResult != null && matchResult.getStatus().toString().equals("MATCHED");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("isMatch", isMatch);

            if (isMatch && matchResult != null) {
                response.put("message", "It's a match! You can now chat.");
                response.put("matchId", matchResult.getId());
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to process swipe");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/matches/{userId}")
    public ResponseEntity<?> getUserMatches(@PathVariable Long userId) {
        try {
            User user = userService.findById(userId);
            if (user == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.badRequest().body(response);
            }

            List<MatchSummaryDto> matches = matchingService.getUserMatches(user);
            return ResponseEntity.ok(matches);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to get matches");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/matches")
    public ResponseEntity<?> getUserMatchesSession(HttpServletRequest request) {
        try {
            Long userId = (Long) request.getSession().getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }

            User currentUser = userService.findById(userId);
            if (currentUser == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            List<MatchSummaryDto> matches = matchingService.getUserMatches(currentUser);
            return ResponseEntity.ok(matches);

        } catch (Exception e) {
            System.err.println("Error getting user matches: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error"));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getUserStats(HttpServletRequest request) {
        try {
            Long userId = (Long) request.getSession().getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }

            User currentUser = userService.findById(userId);
            if (currentUser == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            Map<String, Object> stats = new HashMap<>();
            List<MatchSummaryDto> matches = matchingService.getUserMatches(currentUser);

            stats.put("totalMatches", matches.size());
            stats.put("activeChats", (int) matches.stream()
                    .filter(match -> match.getStatus() == com.studysync.model.enums.MatchStatus.MATCHED)
                    .count());
            stats.put("studyHours", Math.max(1, matches.size() * 2));
            stats.put("profileViews", Math.max(10, matches.size() * 5));

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            System.err.println("Error getting user stats: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error"));
        }
    }

    @GetMapping("/match/{matchId}")
    public ResponseEntity<?> getMatchById(@PathVariable Long matchId) {
        try {
            Match match = matchingService.getMatchById(matchId);
            if (match == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Match not found");
                return ResponseEntity.badRequest().body(response);
            }
            return ResponseEntity.ok(match);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to get match");
            return ResponseEntity.badRequest().body(response);
        }
    }
}