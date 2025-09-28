package com.studysync.service;

import com.studysync.model.User;
import com.studysync.model.enums.StudyGoal;
import com.studysync.model.enums.StudyStyle;
import com.studysync.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class DataSeedingService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public void seedDemoData() {
        if (userRepository.count() > 2) {
            System.out.println("Demo data already exists, skipping seeding...");
            return;
        }

        System.out.println("Seeding demo data for hackathon presentation...");

        // Create diverse set of demo users
        createDemoUser("Emma", "Johnson", "emma.johnson@asu.edu", "Computer Science", 3,
                Arrays.asList("CSE 355", "CSE 365", "MAT 343"),
                Arrays.asList("Tempe", "Memorial Union", "Hayden Library"),
                StudyStyle.COLLABORATIVE, Arrays.asList(StudyGoal.ACE_FINAL, StudyGoal.PASS_CLASS),
                "https://images.unsplash.com/photo-1494790108755-2616c9df40db?w=400&h=400&fit=crop&crop=faces");

        createDemoUser("Alex", "Chen", "alex.chen@asu.edu", "Electrical Engineering", 2,
                Arrays.asList("CSE 355", "EEE 202", "MAT 343"),
                Arrays.asList("Tempe", "Engineering Centers", "Noble Library"),
                StudyStyle.QUIET, Arrays.asList(StudyGoal.HOMEWORK_HELP, StudyGoal.ACE_FINAL),
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces");

        createDemoUser("Maria", "Rodriguez", "maria.rodriguez@asu.edu", "Business", 4,
                Arrays.asList("MGT 300", "FIN 300", "MKT 300"),
                Arrays.asList("Tempe", "McCord Hall", "Starbucks"),
                StudyStyle.COLLABORATIVE, Arrays.asList(StudyGoal.PASS_CLASS, StudyGoal.HOMEWORK_HELP),
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces");

        createDemoUser("James", "Wilson", "james.wilson@asu.edu", "Computer Science", 2,
                Arrays.asList("CSE 365", "CSE 230", "MAT 343"),
                Arrays.asList("Tempe", "Hayden Library", "Engineering Centers"),
                StudyStyle.WHITEBOARD, Arrays.asList(StudyGoal.ACE_FINAL, StudyGoal.PASS_CLASS),
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces");

        createDemoUser("Sarah", "Kim", "sarah.kim@asu.edu", "Data Science", 3,
                Arrays.asList("CSE 355", "STP 420", "CSE 412"),
                Arrays.asList("Tempe", "Memorial Union", "Coffee shops"),
                StudyStyle.COLLABORATIVE, Arrays.asList(StudyGoal.PASS_CLASS, StudyGoal.HOMEWORK_HELP),
                "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&crop=faces");

        createDemoUser("David", "Thompson", "david.thompson@asu.edu", "Mathematics", 4,
                Arrays.asList("MAT 343", "MAT 445", "STP 420"),
                Arrays.asList("Tempe", "Physical Sciences Building", "Quiet study areas"),
                StudyStyle.QUIET, Arrays.asList(StudyGoal.ACE_FINAL, StudyGoal.PASS_CLASS),
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces");

        createDemoUser("Lisa", "Brown", "lisa.brown@asu.edu", "Psychology", 2,
                Arrays.asList("PSY 101", "PSY 290", "STP 226"),
                Arrays.asList("Tempe", "Psychology Building", "Memorial Union"),
                StudyStyle.FLASHCARDS, Arrays.asList(StudyGoal.PASS_CLASS, StudyGoal.ACE_FINAL),
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces");

        createDemoUser("Michael", "Davis", "michael.davis@asu.edu", "Mechanical Engineering", 3,
                Arrays.asList("MAE 318", "EEE 202", "MAT 343"),
                Arrays.asList("Tempe", "Engineering Centers", "ISTB4"),
                StudyStyle.COLLABORATIVE, Arrays.asList(StudyGoal.PASS_CLASS, StudyGoal.HOMEWORK_HELP),
                "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=faces");

        createDemoUser("Jessica", "Taylor", "jessica.taylor@asu.edu", "Finance", 3,
                Arrays.asList("FIN 300", "ECN 211", "MGT 300"),
                Arrays.asList("Tempe", "W.P. Carey Building", "McCord Hall"),
                StudyStyle.QUIET, Arrays.asList(StudyGoal.ACE_FINAL, StudyGoal.PASS_CLASS),
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=faces");

        createDemoUser("Ryan", "Martinez", "ryan.martinez@asu.edu", "Information Systems", 4,
                Arrays.asList("CIS 235", "CSE 355", "MGT 300"),
                Arrays.asList("Tempe", "Computing Commons", "Memorial Union"),
                StudyStyle.WHITEBOARD, Arrays.asList(StudyGoal.PASS_CLASS, StudyGoal.HOMEWORK_HELP),
                "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces");

        System.out.println("Demo data seeded successfully! Created 10 diverse users for matching.");
    }

    private void createDemoUser(String firstName, String lastName, String email, String major, int year,
            List<String> classes, List<String> locations, StudyStyle studyStyle,
            List<StudyGoal> goals, String profilePictureUrl) {

        if (userRepository.findByEmail(email).isPresent()) {
            System.out.println("User already exists: " + email);
            return;
        }

        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setUsername(email.split("@")[0]);
        user.setPassword(passwordEncoder.encode("demo123"));
        user.setMajor(major);
        user.setStudyYear(String.valueOf(year));
        user.setClasses(new HashSet<>(classes));
        user.setPreferredLocations(new HashSet<>(locations));
        user.setStudyStyle(studyStyle);
        Set<String> goalStrings = new HashSet<>();
        for (StudyGoal goal : goals) {
            goalStrings.add(goal.name());
        }
        user.setGoals(goalStrings);
        user.setProfilePicture(profilePictureUrl);
        user.setProfileCompleted(true);
        user.setBio(generateBio(firstName, major, studyStyle));

        // Set availability (mock schedule)
        user.setAvailability(generateMockAvailability());

        userRepository.save(user);
        System.out.println("Created demo user: " + firstName + " " + lastName + " (" + major + ")");
    }

    private String generateBio(String firstName, String major, StudyStyle studyStyle) {
        String[] bioTemplates = {
                "Hi! I'm %s, a %s student passionate about learning and collaboration. I work best in %s settings and love tackling challenging problems together.",
                "%s here! Studying %s and always looking for motivated study partners. I prefer %s study sessions and believe we learn better together.",
                "Hey there! I'm %s, majoring in %s. I'm dedicated to academic excellence and enjoy %s study approaches. Let's achieve our goals together!",
                "Hello! %s studying %s. I believe in the power of collaborative learning and prefer %s study environments. Looking forward to connecting!"
        };

        String template = bioTemplates[new Random().nextInt(bioTemplates.length)];
        String styleDescription = studyStyle == StudyStyle.COLLABORATIVE ? "group"
                : studyStyle == StudyStyle.QUIET ? "focused individual" : "flexible";

        return String.format(template, firstName, major, styleDescription);
    }

    private String generateMockAvailability() {
        // Generate a realistic weekly schedule in JSON format
        Map<String, List<String>> schedule = new HashMap<>();

        schedule.put("Monday", Arrays.asList("09:00-11:00", "14:00-16:00", "18:00-20:00"));
        schedule.put("Tuesday", Arrays.asList("10:00-12:00", "15:00-17:00"));
        schedule.put("Wednesday", Arrays.asList("09:00-11:00", "13:00-15:00", "19:00-21:00"));
        schedule.put("Thursday", Arrays.asList("11:00-13:00", "16:00-18:00"));
        schedule.put("Friday", Arrays.asList("10:00-12:00", "14:00-16:00"));
        schedule.put("Saturday", Arrays.asList("10:00-14:00", "16:00-18:00"));
        schedule.put("Sunday", Arrays.asList("13:00-17:00", "19:00-21:00"));

        // Convert to JSON string
        StringBuilder json = new StringBuilder("{");
        int dayCount = 0;
        for (Map.Entry<String, List<String>> entry : schedule.entrySet()) {
            if (dayCount > 0)
                json.append(",");
            json.append("\"").append(entry.getKey()).append("\":[");
            for (int i = 0; i < entry.getValue().size(); i++) {
                if (i > 0)
                    json.append(",");
                json.append("\"").append(entry.getValue().get(i)).append("\"");
            }
            json.append("]");
            dayCount++;
        }
        json.append("}");

        return json.toString();
    }
}