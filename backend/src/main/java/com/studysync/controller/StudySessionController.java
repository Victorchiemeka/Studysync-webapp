package com.studysync.controller;

import com.studysync.model.StudySession;
import com.studysync.model.User;
import com.studysync.service.StudySessionService;
import com.studysync.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = { "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001",
        "http://127.0.0.1:3001" }, allowCredentials = "true")
public class StudySessionController {

    @Autowired
    private StudySessionService studySessionService;

    @Autowired
    private UserService userService;

    @PostMapping("/create")
    public ResponseEntity<?> createSession(@RequestBody Map<String, Object> sessionData) {
        try {
            Long organizerId = Long.parseLong(sessionData.get("organizerId").toString());
            User organizer = userService.findById(organizerId);

            if (organizer == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Organizer not found");
                return ResponseEntity.badRequest().body(response);
            }

            StudySession session = studySessionService.createSession(sessionData, organizer);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("session", session);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to create session");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserSessions(@PathVariable Long userId) {
        try {
            User user = userService.findById(userId);
            if (user == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.badRequest().body(response);
            }

            List<StudySession> sessions = studySessionService.getUserSessions(user);
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to get sessions");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/{sessionId}/join")
    public ResponseEntity<?> joinSession(@PathVariable Long sessionId, @RequestBody Map<String, Object> requestData) {
        try {
            Long userId = Long.parseLong(requestData.get("userId").toString());
            User user = userService.findById(userId);

            if (user == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.badRequest().body(response);
            }

            boolean joined = studySessionService.joinSession(sessionId, user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", joined);
            response.put("message", joined ? "Successfully joined session" : "Failed to join session");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to join session");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/available")
    public ResponseEntity<?> getAvailableSessions(@RequestParam(required = false) String subject) {
        try {
            List<StudySession> sessions = studySessionService.getAvailableSessions(subject);
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to get available sessions");
            return ResponseEntity.badRequest().body(response);
        }
    }
}