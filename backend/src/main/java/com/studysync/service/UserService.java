package com.studysync.service;

import com.studysync.model.User;
import com.studysync.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User findOrCreateUser(String email, String name, String profilePicture) {
        System.out.println("UserService.findOrCreateUser called with email: " + email + ", name: " + name);

        try {
            Optional<User> existingUser = userRepository.findByEmail(email);

            if (existingUser.isPresent()) {
                System.out.println("Found existing user: " + existingUser.get().getId());
                User user = existingUser.get();
                // Update profile picture if changed
                if (profilePicture != null && !profilePicture.equals(user.getProfilePicture())) {
                    user.setProfilePicture(profilePicture);
                    return userRepository.save(user);
                }
                return user;
            } else {
                System.out.println("Creating new user");
                // Create new user
                User newUser = new User();

                // Validate inputs
                if (name == null || name.trim().isEmpty()) {
                    System.out.println("Name is null or empty, using email as name");
                    name = email; // Fallback to email if name is not provided
                }

                // Parse full name into first and last name
                String[] nameParts = name.split(" ", 2);
                newUser.setFirstName(nameParts[0]);
                if (nameParts.length > 1) {
                    newUser.setLastName(nameParts[1]);
                } else {
                    newUser.setLastName("");
                }

                // Generate unique username from email (before @ symbol)
                String baseUsername = email.substring(0, email.indexOf("@"));
                String username = baseUsername;
                int counter = 1;

                // Ensure username is unique
                while (userRepository.findByUsername(username).isPresent()) {
                    username = baseUsername + counter;
                    counter++;
                }
                newUser.setUsername(username);

                newUser.setEmail(email);
                newUser.setProfilePicture(profilePicture);

                System.out.println("About to save new user");
                User savedUser = userRepository.save(newUser);
                System.out.println("Successfully saved new user with ID: " + savedUser.getId());
                return savedUser;
            }
        } catch (Exception e) {
            System.out.println("Exception in findOrCreateUser: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public List<User> findUsersByMajorAndYear(String major, Integer year) {
        // Delegate to repository method that maps to the entity attribute 'studyYear'
        return userRepository.findByMajorAndStudyYear(major, year.toString());
    }

    public List<User> findUsersInArea(double centerLat, double centerLng, double radiusKm) {
        // Simple bounding box calculation (more accurate than full distance calculation
        // for all users)
        double latDelta = radiusKm / 111.0; // Approximately 111 km per degree latitude
        double lngDelta = radiusKm / (111.0 * Math.cos(Math.toRadians(centerLat)));

        double minLat = centerLat - latDelta;
        double maxLat = centerLat + latDelta;
        double minLng = centerLng - lngDelta;
        double maxLng = centerLng + lngDelta;

        return userRepository.findByLatitudeBetweenAndLongitudeBetween(minLat, maxLat, minLng, maxLng);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User authenticateUser(String email, String password) {
        System.out.println("Authenticating user with email: " + email);

        try {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (user.getPassword() != null && passwordEncoder.matches(password, user.getPassword())) {
                    System.out.println("User authenticated successfully");
                    return user;
                }
            }
            System.out.println("Authentication failed - invalid credentials");
            return null;
        } catch (Exception e) {
            System.out.println("Exception during authentication: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    public User createUserWithPassword(String email, String name, String password) {
        System.out.println("Creating user with email and password: " + email);

        try {
            User newUser = new User();
            newUser.setEmail(email);

            // Parse full name into first and last name
            String[] nameParts = name.split(" ", 2);
            newUser.setFirstName(nameParts[0]);
            if (nameParts.length > 1) {
                newUser.setLastName(nameParts[1]);
            } else {
                newUser.setLastName("");
            }

            // Generate unique username from email (before @ symbol)
            String baseUsername = email.substring(0, email.indexOf("@"));
            String username = baseUsername;
            int counter = 1;

            // Ensure username is unique
            while (userRepository.findByUsername(username).isPresent()) {
                username = baseUsername + counter;
                counter++;
            }
            newUser.setUsername(username);

            newUser.setPassword(passwordEncoder.encode(password));

            User savedUser = userRepository.save(newUser);
            System.out.println("Successfully created user with ID: " + savedUser.getId());
            return savedUser;
        } catch (Exception e) {
            System.out.println("Exception creating user: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}