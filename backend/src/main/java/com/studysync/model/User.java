package com.studysync.model;

import com.studysync.model.enums.StudyStyle;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Email
    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = true) // Allow null for OAuth users
    private String password;

    private String major;

    @Column(name = "study_year")
    private String studyYear;

    @ElementCollection
    @CollectionTable(name = "user_classes", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "class_code")
    private Set<String> classes = new HashSet<>();

    @Column(columnDefinition = "TEXT")
    private String availability; // JSON structure: {day, start, end}

    @ElementCollection
    @CollectionTable(name = "user_preferred_locations", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "location")
    private Set<String> preferredLocations = new HashSet<>();

    // Group formation preference - true for groups, false for partners
    @Column(name = "prefers_groups")
    private Boolean prefersGroups = false;

    // Bio for profile enrichment
    @Column(columnDefinition = "TEXT")
    private String bio;

    // Location coordinates for map functionality
    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "location_address")
    private String locationAddress;

    // AI matching score (updated by Gemini AI)
    @Column(name = "ai_compatibility_score")
    private Double aiCompatibilityScore;

    @Enumerated(EnumType.STRING)
    private StudyStyle studyStyle;

    @ElementCollection
    @CollectionTable(name = "user_goals", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "goal")
    private Set<String> goals = new HashSet<>();

    private String profilePictureUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "last_active")
    private LocalDateTime lastActive;

    @Column(name = "is_active")
    private boolean active = true;

    @Column(name = "profile_completed")
    private boolean profileCompleted = false;

    // Constructors
    public User() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.lastActive = LocalDateTime.now();
    }

    public User(String username, String email, String password) {
        this();
        this.username = username;
        this.email = email;
        this.password = password;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.lastActive = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getMajor() {
        return major;
    }

    public void setMajor(String major) {
        this.major = major;
    }

    public String getStudyYear() {
        return studyYear;
    }

    public void setStudyYear(String studyYear) {
        this.studyYear = studyYear;
    }

    public Set<String> getClasses() {
        return classes;
    }

    public void setClasses(Set<String> classes) {
        this.classes = classes;
    }

    public String getAvailability() {
        return availability;
    }

    public void setAvailability(String availability) {
        this.availability = availability;
    }

    public Set<String> getPreferredLocations() {
        return preferredLocations;
    }

    public void setPreferredLocations(Set<String> preferredLocations) {
        this.preferredLocations = preferredLocations;
    }

    public StudyStyle getStudyStyle() {
        return studyStyle;
    }

    public void setStudyStyle(StudyStyle studyStyle) {
        this.studyStyle = studyStyle;
    }

    public Set<String> getGoals() {
        return goals;
    }

    public void setGoals(Set<String> goals) {
        this.goals = goals;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getLocationAddress() {
        return locationAddress;
    }

    public void setLocationAddress(String locationAddress) {
        this.locationAddress = locationAddress;
    }

    public Double getAiCompatibilityScore() {
        return aiCompatibilityScore;
    }

    public void setAiCompatibilityScore(Double aiCompatibilityScore) {
        this.aiCompatibilityScore = aiCompatibilityScore;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getLastActive() {
        return lastActive;
    }

    public void setLastActive(LocalDateTime lastActive) {
        this.lastActive = lastActive;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public boolean isProfileCompleted() {
        return profileCompleted;
    }

    public void setProfileCompleted(boolean profileCompleted) {
        this.profileCompleted = profileCompleted;
    }

    public Boolean getPrefersGroups() {
        return prefersGroups;
    }

    public void setPrefersGroups(Boolean prefersGroups) {
        this.prefersGroups = prefersGroups;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    // Helper methods for Spring Security UserDetailsService compatibility
    public String getName() {
        return firstName + " " + lastName;
    }

    // Helper methods for profile picture (compatibility with existing service)
    public String getProfilePicture() {
        return profilePictureUrl;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePictureUrl = profilePicture;
    }
}
