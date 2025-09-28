package com.studysync.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_match_suggestions")
public class AiMatchSuggestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "suggested_user_id", nullable = false)
    private User suggestedUser;

    @Column(nullable = false)
    private Double compatibilityScore; // 0.0 to 1.0

    @Column(columnDefinition = "TEXT")
    private String aiReasoning; // Gemini AI's explanation for the match

    @Column(columnDefinition = "TEXT")
    private String sharedInterests; // JSON array of shared classes/interests

    @Column(name = "distance_km")
    private Double distanceKm; // Distance between users in kilometers

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SuggestionStatus status = SuggestionStatus.PENDING;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public enum SuggestionStatus {
        PENDING,
        VIEWED,
        LIKED,
        REJECTED,
        MATCHED
    }

    // Constructors
    public AiMatchSuggestion() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public AiMatchSuggestion(User user, User suggestedUser, Double compatibilityScore, String aiReasoning) {
        this.user = user;
        this.suggestedUser = suggestedUser;
        this.compatibilityScore = compatibilityScore;
        this.aiReasoning = aiReasoning;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public User getSuggestedUser() {
        return suggestedUser;
    }

    public void setSuggestedUser(User suggestedUser) {
        this.suggestedUser = suggestedUser;
    }

    public Double getCompatibilityScore() {
        return compatibilityScore;
    }

    public void setCompatibilityScore(Double compatibilityScore) {
        this.compatibilityScore = compatibilityScore;
    }

    public String getAiReasoning() {
        return aiReasoning;
    }

    public void setAiReasoning(String aiReasoning) {
        this.aiReasoning = aiReasoning;
    }

    public String getSharedInterests() {
        return sharedInterests;
    }

    public void setSharedInterests(String sharedInterests) {
        this.sharedInterests = sharedInterests;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public SuggestionStatus getStatus() {
        return status;
    }

    public void setStatus(SuggestionStatus status) {
        this.status = status;
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

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}