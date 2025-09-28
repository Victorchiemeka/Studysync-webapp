package com.studysync.controller;

import com.studysync.model.User;
import com.studysync.model.enums.StudyStyle;
import com.studysync.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = { "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001",
        "http://127.0.0.1:3001" }, allowCredentials = "true")
public class AuthController {

    @Autowired
    private UserService userService;

    @GetMapping("/success")
    public ResponseEntity<?> loginSuccess(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.badRequest().body("Authentication failed");
        }

        String email = principal.getAttribute("email");
        String name = principal.getAttribute("name");
        String picture = principal.getAttribute("picture");

        // Create or update user
        User user = userService.findOrCreateUser(email, name, picture);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", user);
        response.put("redirect", user.getMajor() == null ? "/setup" : "/dashboard");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/oauth-success")
    public ResponseEntity<Void> oauthSuccess(@AuthenticationPrincipal OAuth2User principal,
            HttpServletRequest request) {
        System.out.println("OAuth success endpoint called");

        HttpHeaders headers = new HttpHeaders();

        if (principal == null) {
            System.out.println("Principal is null - authentication failed");
            headers.set(HttpHeaders.LOCATION, "http://localhost:3001/login?error=no_principal");
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        }

        try {
            System.out.println("Principal attributes: " + principal.getAttributes());

            // Extract user info based on OAuth provider
            String email = extractEmail(principal);
            String name = extractName(principal);
            String picture = extractProfilePicture(principal);

            System.out.println("User details - Email: " + email + ", Name: " + name);

            if (email == null || email.isEmpty()) {
                System.out.println("Email is null or empty");
                headers.set(HttpHeaders.LOCATION, "http://localhost:3001/login?error=no_email");
                return new ResponseEntity<>(headers, HttpStatus.FOUND);
            }

            // Create or update user
            User user = userService.findOrCreateUser(email, name, picture);
            Long userId = user != null ? user.getId() : null;
            System.out.println("User created/found: " + userId);

            // Redirect based on user setup status
            if (user == null || user.getMajor() == null) {
                System.out.println("Redirecting to setup");
                headers.set(HttpHeaders.LOCATION, "http://localhost:3001/setup?success=true");
                return new ResponseEntity<>(headers, HttpStatus.FOUND);
            } else {
                System.out.println("Redirecting to dashboard");
                headers.set(HttpHeaders.LOCATION, "http://localhost:3001/dashboard?success=true");
                return new ResponseEntity<>(headers, HttpStatus.FOUND);
            }
        } catch (Exception e) {
            System.out.println("Exception in oauth-success: " + e.getMessage());
            e.printStackTrace();
            headers.set(HttpHeaders.LOCATION, "http://localhost:3001/login?error=server_error");
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        }
    }

    private String extractEmail(OAuth2User principal) {
        // Try different email attribute names for different providers
        String email = principal.getAttribute("email");
        if (email == null) {
            email = principal.getAttribute("email_verified"); // Some providers
        }
        if (email == null) {
            // For GitHub, email might be in a different format
            List<Map<String, Object>> emails = principal.getAttribute("emails");
            if (emails != null && !emails.isEmpty()) {
                email = (String) emails.get(0).get("email");
            }
        }
        return email;
    }

    private String extractName(OAuth2User principal) {
        String name = principal.getAttribute("name");
        if (name == null) {
            // For GitHub
            name = principal.getAttribute("login");
        }
        if (name == null) {
            // For Apple, construct from given_name and family_name if available
            String givenName = principal.getAttribute("given_name");
            String familyName = principal.getAttribute("family_name");
            if (givenName != null) {
                name = givenName + (familyName != null ? " " + familyName : "");
            }
        }
        return name;
    }

    private String extractProfilePicture(OAuth2User principal) {
        String picture = principal.getAttribute("picture");
        if (picture == null) {
            // For GitHub
            picture = principal.getAttribute("avatar_url");
        }
        return picture;
    }

    @GetMapping("/failure")
    public ResponseEntity<?> loginFailure() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "Authentication failed");
        return ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/user")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal OAuth2User principal, HttpServletRequest request) {
        // First try OAuth2 authentication
        if (principal != null) {
            String email = extractEmail(principal);
            User user = userService.findByEmail(email);
            if (user != null) {
                // Mark profile as completed if user has major
                user.setProfileCompleted(user.getMajor() != null && !user.getMajor().trim().isEmpty());
                return ResponseEntity.ok(user);
            }
        }

        // Then try session-based authentication (for email/password users)
        String sessionEmail = (String) request.getSession().getAttribute("userEmail");
        if (sessionEmail != null) {
            User user = userService.findByEmail(sessionEmail);
            if (user != null) {
                user.setProfileCompleted(user.getMajor() != null && !user.getMajor().trim().isEmpty());
                return ResponseEntity.ok(user);
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
    }

    @PostMapping("/complete-profile")
    public ResponseEntity<?> completeProfile(@RequestBody Map<String, Object> profileData, HttpServletRequest request) {
        try {
            System.out.println("Complete profile called with data: " + profileData);

            String email = (String) profileData.get("email");

            // If no email in request, try to get from session
            if (email == null || email.isEmpty()) {
                email = (String) request.getSession().getAttribute("userEmail");
                System.out.println("Got email from session: " + email);
            }

            if (email == null || email.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "No authenticated user found");
                return ResponseEntity.badRequest().body(response);
            }

            User user = userService.findByEmail(email);
            if (user == null) {
                // Create a new user if one doesn't exist
                System.out.println("User not found, creating new user with email: " + email);
                String firstName = (String) profileData.get("firstName");
                String lastName = (String) profileData.get("lastName");
                String fullName = (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "");
                user = userService.findOrCreateUser(email, fullName.trim(), null);
            }

            // Update user profile with correct field mappings
            if (profileData.containsKey("firstName") && profileData.containsKey("lastName")) {
                String firstName = (String) profileData.get("firstName");
                String lastName = (String) profileData.get("lastName");
                user.setFirstName(firstName);
                user.setLastName(lastName);
            }

            if (profileData.containsKey("major")) {
                user.setMajor((String) profileData.get("major"));
            }

            // Handle studentYear field (frontend sends studentYear, model expects
            // studyYear)
            if (profileData.containsKey("studentYear")) {
                user.setStudyYear(String.valueOf(profileData.get("studentYear")));
            }

            if (profileData.containsKey("classes")) {
                @SuppressWarnings("unchecked")
                List<String> classes = (List<String>) profileData.get("classes");
                user.setClasses(new HashSet<>(classes));
            }

            // Convert availability object to JSON string
            if (profileData.containsKey("availability")) {
                Object availabilityObj = profileData.get("availability");
                if (availabilityObj instanceof Map) {
                    // Convert availability map to JSON string
                    user.setAvailability(availabilityObj.toString());
                } else {
                    user.setAvailability((String) availabilityObj);
                }
            }

            if (profileData.containsKey("studyStyle")) {
                try {
                    user.setStudyStyle(StudyStyle.valueOf((String) profileData.get("studyStyle")));
                } catch (IllegalArgumentException e) {
                    System.out.println("Invalid study style: " + profileData.get("studyStyle"));
                }
            }

            // Handle studyGoal field (frontend sends studyGoal, model expects goals as
            // Set<String>)
            if (profileData.containsKey("studyGoal")) {
                String studyGoal = (String) profileData.get("studyGoal");
                Set<String> goals = new HashSet<>();
                goals.add(studyGoal);
                user.setGoals(goals);
            }

            // Handle group preference
            if (profileData.containsKey("prefersGroups")) {
                user.setPrefersGroups((Boolean) profileData.get("prefersGroups"));
            }

            // Handle bio
            if (profileData.containsKey("bio")) {
                user.setBio((String) profileData.get("bio"));
            }

            if (profileData.containsKey("preferredLocations")) {
                @SuppressWarnings("unchecked")
                List<String> locations = (List<String>) profileData.get("preferredLocations");
                user.setPreferredLocations(new HashSet<>(locations));
            }

            // Handle location field
            if (profileData.containsKey("location")) {
                user.setLocationAddress((String) profileData.get("location"));
            }

            User savedUser = userService.saveUser(user);
            System.out.println("User profile updated successfully: " + savedUser.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", savedUser);
            response.put("redirect", "/dashboard");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error updating profile: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to update profile: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/email-login")
    public ResponseEntity<?> emailLogin(@RequestBody Map<String, String> credentials, HttpServletRequest request) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        if (email == null || password == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Email and password are required");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            User user = userService.authenticateUser(email, password);
            if (user != null) {
                // Set session for authenticated user
                request.getSession().setAttribute("userEmail", email);
                request.getSession().setAttribute("userId", user.getId());

                user.setProfileCompleted(user.getMajor() != null && !user.getMajor().trim().isEmpty());

                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("user", user);
                response.put("redirect", user.getMajor() == null ? "/setup" : "/dashboard");
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Invalid email or password");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Authentication failed");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/email-signup")
    public ResponseEntity<?> emailSignup(@RequestBody Map<String, String> userData, HttpServletRequest request) {
        String email = userData.get("email");
        String password = userData.get("password");
        String name = userData.get("name");

        if (email == null || password == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Email and password are required");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            // Check if user already exists
            if (userService.findByEmail(email) != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "User with this email already exists");
                response.put("userExists", true);
                return ResponseEntity.badRequest().body(response);
            }

            User user = userService.createUserWithPassword(email, name != null ? name : email, password);

            // Set session for new user
            request.getSession().setAttribute("userEmail", email);
            request.getSession().setAttribute("userId", user.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", user);
            response.put("redirect", "/setup");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to create account");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        try {
            // Invalidate the session
            request.getSession().invalidate();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Successfully logged out");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error during logout: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Logout failed"));
        }
    }
}