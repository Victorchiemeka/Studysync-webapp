package com.studysync.repository;

import com.studysync.model.ChatMessage;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByMatchIdOrderByTimestampAsc(Long matchId);
}
