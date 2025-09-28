package com.studysync.service;

import com.studysync.model.StudySession;
import com.studysync.model.User;
import com.studysync.repository.StudySessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
public class StudySessionService {

    @Autowired
    private StudySessionRepository studySessionRepository;

    public StudySession createSession(Map<String, Object> sessionData, User organizer) {
        StudySession session = new StudySession();
        session.setCreatedBy(organizer);
        
        if (sessionData.containsKey("course")) {
            session.setCourse((String) sessionData.get("course"));
        }
        
        if (sessionData.containsKey("location")) {
            session.setLocation((String) sessionData.get("location"));
        }
        
        if (sessionData.containsKey("time")) {
            // Parse datetime string
            String timeStr = (String) sessionData.get("time");
            LocalDateTime time = LocalDateTime.parse(timeStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            session.setTime(time);
        }
        
        // Add organizer as first participant
        session.getParticipants().add(organizer.getId());
        
        return studySessionRepository.save(session);
    }

    public List<StudySession> getUserSessions(User user) {
        return studySessionRepository.findByCreatedByOrParticipantsContaining(user, user.getId());
    }

    public boolean joinSession(Long sessionId, User user) {
        StudySession session = studySessionRepository.findById(sessionId).orElse(null);
        if (session == null) {
            return false;
        }
        
        // Check if user is already a participant
        if (!session.getParticipants().contains(user.getId())) {
            session.getParticipants().add(user.getId());
            studySessionRepository.save(session);
        }
        
        return true;
    }

    public List<StudySession> getAvailableSessions(String subject) {
        LocalDateTime now = LocalDateTime.now();
        
        if (subject != null && !subject.isEmpty()) {
            return studySessionRepository.findByCourseContainingIgnoreCaseAndTimeAfter(subject, now);
        } else {
            return studySessionRepository.findByTimeAfter(now);
        }
    }
    
    public StudySession findById(Long sessionId) {
        return studySessionRepository.findById(sessionId).orElse(null);
    }
}