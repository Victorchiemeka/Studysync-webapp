package com.studysync.repository;

import com.studysync.model.StudySession;
import com.studysync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StudySessionRepository extends JpaRepository<StudySession, Long> {
    List<StudySession> findByCreatedByOrParticipantsContaining(User createdBy, Long participantId);
    List<StudySession> findByCourseContainingIgnoreCaseAndTimeAfter(String course, LocalDateTime time);
    List<StudySession> findByTimeAfter(LocalDateTime time);
    List<StudySession> findByCreatedBy(User createdBy);
}