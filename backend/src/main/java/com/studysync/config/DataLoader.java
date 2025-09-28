package com.studysync.config;

import com.studysync.model.User;
import com.studysync.model.enums.StudyStyle;
import com.studysync.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Only load data if database is empty
        if (userRepository.count() == 0) {
            System.out.println("Loading initial data into database...");

            // Create sample users for testing
            createSampleUser("victor@example.com", "Victor", "Smith", "Computer Science", "QUIET",
                    new String[] { "CS101", "CS201", "MATH301" }, new String[] { "Academic Excellence" },
                    new String[] { "Library", "Study Hall" });

            createSampleUser("john@example.com", "John", "Doe", "Engineering", "COLLABORATIVE",
                    new String[] { "ENG101", "MATH301", "PHYS201" }, new String[] { "Career Preparation" },
                    new String[] { "Engineering Building", "Library" });

            createSampleUser("sarah@example.com", "Sarah", "Johnson", "Mathematics", "WHITEBOARD",
                    new String[] { "MATH301", "STAT201", "CS101" }, new String[] { "Skill Development" },
                    new String[] { "Math Lab", "Library" });

            createSampleUser("mike@example.com", "Mike", "Wilson", "Physics", "FLASHCARDS",
                    new String[] { "PHYS201", "MATH301", "ENG101" }, new String[] { "Test Preparation" },
                    new String[] { "Physics Lab", "Study Hall" });

            System.out.println("Initial data loaded successfully!");
        } else {
            System.out.println("Database already contains data, skipping initial data load.");
        }
    }

    private void createSampleUser(String email, String firstName, String lastName, String major,
            String studyStyle, String[] classes, String[] goals, String[] locations) {
        User user = new User();
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setUsername(email.substring(0, email.indexOf("@")));
        user.setPassword(passwordEncoder.encode("password123")); // Default password for testing
        user.setMajor(major);
        user.setStudyYear("Junior");

        try {
            user.setStudyStyle(StudyStyle.valueOf(studyStyle));
        } catch (IllegalArgumentException e) {
            user.setStudyStyle(StudyStyle.QUIET); // Default fallback
        }

        // Set classes
        Set<String> classSet = new HashSet<>();
        for (String cls : classes) {
            classSet.add(cls);
        }
        user.setClasses(classSet);

        // Set goals
        Set<String> goalSet = new HashSet<>();
        for (String goal : goals) {
            goalSet.add(goal);
        }
        user.setGoals(goalSet);

        // Set preferred locations
        Set<String> locationSet = new HashSet<>();
        for (String location : locations) {
            locationSet.add(location);
        }
        user.setPreferredLocations(locationSet);

        // Set some basic coordinates (campus area)
        user.setLatitude(33.4484); // ASU coordinates
        user.setLongitude(-112.0740);
        user.setLocationAddress("Arizona State University");

        userRepository.save(user);
        System.out.println("Created user: " + firstName + " " + lastName + " (" + email + ")");
    }
}