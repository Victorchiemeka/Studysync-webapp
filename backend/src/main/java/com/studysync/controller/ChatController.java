package com.studysync.controller;

import com.studysync.model.ChatMessage;
import com.studysync.model.Match;
import com.studysync.model.User;
import com.studysync.repository.ChatMessageRepository;
import com.studysync.repository.MatchRepository;
import com.studysync.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = { "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001",
        "http://127.0.0.1:3001" }, allowCredentials = "true")
public class ChatController {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping("/{matchId}/messages")
    public ResponseEntity<?> getMessages(@PathVariable Long matchId) {
        try {
            List<ChatMessage> messages = chatMessageRepository.findByMatchIdOrderByTimestampAsc(matchId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", false);
            resp.put("message", "Failed to load messages");
            return ResponseEntity.badRequest().body(resp);
        }
    }

    @PostMapping("/{matchId}/messages")
    public ResponseEntity<?> postMessage(@PathVariable Long matchId, @RequestBody Map<String, String> payload) {
        String senderIdStr = payload.get("senderId");
        String text = payload.get("message");

        if (senderIdStr == null || text == null || text.trim().isEmpty()) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", false);
            resp.put("message", "senderId and message are required");
            return ResponseEntity.badRequest().body(resp);
        }

        try {
            Long senderId = Long.parseLong(senderIdStr);
            User sender = userService.findById(senderId);
            if (sender == null) {
                Map<String, Object> resp = new HashMap<>();
                resp.put("success", false);
                resp.put("message", "Sender not found");
                return ResponseEntity.badRequest().body(resp);
            }

            Match match = matchRepository.findById(matchId).orElse(null);
            if (match == null) {
                Map<String, Object> resp = new HashMap<>();
                resp.put("success", false);
                resp.put("message", "Match not found");
                return ResponseEntity.badRequest().body(resp);
            }

            ChatMessage msg = new ChatMessage(match, sender, text);
            ChatMessage saved = chatMessageRepository.save(msg);

            // Broadcast message to WebSocket subscribers for real-time updates
            messagingTemplate.convertAndSend("/topic/chat/" + matchId, saved);

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", saved);
            return ResponseEntity.ok(resp);
        } catch (NumberFormatException nfe) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", false);
            resp.put("message", "Invalid senderId");
            return ResponseEntity.badRequest().body(resp);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", false);
            resp.put("message", "Failed to post message");
            return ResponseEntity.badRequest().body(resp);
        }
    }

    // WebSocket message handler for real-time chat
    @MessageMapping("/chat/{matchId}/sendMessage")
    @SendTo("/topic/chat/{matchId}")
    public ChatMessage sendMessageViaWebSocket(@Payload Map<String, String> payload,
            @PathVariable Long matchId,
            SimpMessageHeaderAccessor headerAccessor) {
        try {
            String senderIdStr = payload.get("senderId");
            String text = payload.get("message");

            if (senderIdStr == null || text == null || text.trim().isEmpty()) {
                return null; // Invalid message
            }

            Long senderId = Long.parseLong(senderIdStr);
            User sender = userService.findById(senderId);
            Match match = matchRepository.findById(matchId).orElse(null);

            if (sender == null || match == null) {
                return null; // Invalid sender or match
            }

            ChatMessage msg = new ChatMessage(match, sender, text);
            ChatMessage saved = chatMessageRepository.save(msg);

            return saved;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    // WebSocket user join handler
    @MessageMapping("/chat/{matchId}/addUser")
    @SendTo("/topic/chat/{matchId}")
    public Map<String, Object> addUserToChat(@Payload Map<String, String> payload,
            @PathVariable Long matchId,
            SimpMessageHeaderAccessor headerAccessor) {
        try {
            String userId = payload.get("userId");
            String userName = payload.get("userName");

            // Store user info in WebSocket session
            headerAccessor.getSessionAttributes().put("userId", userId);
            headerAccessor.getSessionAttributes().put("userName", userName);
            headerAccessor.getSessionAttributes().put("matchId", matchId.toString());

            Map<String, Object> response = new HashMap<>();
            response.put("type", "USER_JOINED");
            response.put("userId", userId);
            response.put("userName", userName);
            response.put("timestamp", LocalDateTime.now());

            return response;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    // Get active users in chat (for typing indicators, online status)
    @GetMapping("/{matchId}/users")
    public ResponseEntity<?> getActiveUsers(@PathVariable Long matchId) {
        try {
            Match match = matchRepository.findById(matchId).orElse(null);
            if (match == null) {
                Map<String, Object> resp = new HashMap<>();
                resp.put("success", false);
                resp.put("message", "Match not found");
                return ResponseEntity.badRequest().body(resp);
            }

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("users", List.of(match.getUser1(), match.getUser2()));
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", false);
            resp.put("message", "Failed to get active users");
            return ResponseEntity.badRequest().body(resp);
        }
    }
}
