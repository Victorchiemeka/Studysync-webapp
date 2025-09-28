package com.studysync.service;

import com.studysync.dto.CompleteProfileRequest;
import com.studysync.dto.RegisterRequest;
import com.studysync.model.User;
import com.studysync.model.enums.StudyGoal;
import com.studysync.model.enums.StudyStyle;
import com.studysync.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;

@Service
@Transactional
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(RegisterRequest registerRequest) {
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setCreatedAt(LocalDateTime.now());
        user.setActive(true);

        // Set default values if not provided
        user.setStudyYear(registerRequest.getStudyYear() != null ? registerRequest.getStudyYear() : "Freshman");
        user.setMajor(registerRequest.getMajor() != null ? registerRequest.getMajor() : "Undeclared");

        // Set study style and goals
        if (registerRequest.getStudyStyle() != null) {
            try {
                user.setStudyStyle(StudyStyle.valueOf(registerRequest.getStudyStyle().toUpperCase()));
            } catch (IllegalArgumentException e) {
                user.setStudyStyle(StudyStyle.COLLABORATIVE);
            }
        } else {
            user.setStudyStyle(StudyStyle.COLLABORATIVE);
        }

        if (registerRequest.getGoals() != null && !registerRequest.getGoals().isEmpty()) {
            user.setGoals(new HashSet<>(registerRequest.getGoals()));
        } else {
            user.setGoals(new HashSet<>(Arrays.asList("Improve Grades", "Learn New Concepts")));
        }

        // Initialize empty collections
        user.setClasses(new HashSet<>());
        user.setPreferredLocations(new HashSet<>());

        return userRepository.save(user);
    }

    public User completeUserProfile(String email, CompleteProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update profile information
        if (request.getStudyYear() != null) {
            user.setStudyYear(request.getStudyYear());
        }
        if (request.getMajor() != null) {
            user.setMajor(request.getMajor());
        }
        if (request.getStudyStyle() != null) {
            try {
                user.setStudyStyle(StudyStyle.valueOf(request.getStudyStyle().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Keep existing style if invalid
            }
        }
        if (request.getGoals() != null && !request.getGoals().isEmpty()) {
            user.setGoals(new HashSet<>(request.getGoals()));
        }
        if (request.getClasses() != null && !request.getClasses().isEmpty()) {
            user.setClasses(new HashSet<>(request.getClasses()));
        }
        if (request.getPreferredLocations() != null && !request.getPreferredLocations().isEmpty()) {
            user.setPreferredLocations(new HashSet<>(request.getPreferredLocations()));
        }

        user.setProfileCompleted(true);
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }
}