package com.studysync.service;

import com.studysync.model.ChatMessage;
import com.studysync.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ChatService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    public List<ChatMessage> getChatHistory(String chatId, Long userId) {
        try {
            Long matchId = Long.parseLong(chatId);
            return chatMessageRepository.findByMatchIdOrderByTimestampAsc(matchId);
        } catch (NumberFormatException e) {
            return new ArrayList<>();
        }
    }

    public ChatMessage saveMessage(ChatMessage message) {
        return chatMessageRepository.save(message);
    }

    public List<String> getUserChatRooms(Long userId) {
        // Get all matches for the user and return their IDs as chat room IDs
        List<String> chatRooms = new ArrayList<>();
        // This would typically query the Match repository to find all matches for the
        // user
        // For now, returning empty list - this can be implemented based on your Match
        // entity structure
        return chatRooms;
    }

    public void joinChatRoom(String roomId, Long userId) {
        // Implementation for joining a chat room
        // This could involve creating a ChatRoom entity or updating user's active rooms
    }

    public void leaveChatRoom(String roomId, Long userId) {
        // Implementation for leaving a chat room
        // This could involve removing user from active rooms
    }
}