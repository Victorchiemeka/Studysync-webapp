package com.studysync.model;

import com.studysync.model.enums.MatchStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "matches")
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user1_id", nullable = false)
    private User user1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user2_id", nullable = false)
    private User user2;

    @Column(nullable = false)
    private Integer compatibilityScore; // 0-100

    @ElementCollection
    @CollectionTable(name = "match_shared_classes", joinColumns = @JoinColumn(name = "match_id"))
    @Column(name = "class_code")
    private List<String> sharedClasses = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String sharedAvailability; // JSON structure for time slots

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MatchStatus status = MatchStatus.PENDING;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "matched_at")
    private LocalDateTime matchedAt;

    // Constructors
    public Match() {
        this.createdAt = LocalDateTime.now();
    }

    public Match(User user1, User user2, Integer compatibilityScore) {
        this.user1 = user1;
        this.user2 = user2;
        this.compatibilityScore = compatibilityScore;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser1() {
        return user1;
    }

    public void setUser1(User user1) {
        this.user1 = user1;
    }

    public User getUser2() {
        return user2;
    }

    public void setUser2(User user2) {
        this.user2 = user2;
    }

    public Integer getCompatibilityScore() {
        return compatibilityScore;
    }

    public void setCompatibilityScore(Integer compatibilityScore) {
        this.compatibilityScore = compatibilityScore;
    }

    public List<String> getSharedClasses() {
        return sharedClasses;
    }

    public void setSharedClasses(List<String> sharedClasses) {
        this.sharedClasses = sharedClasses;
    }

    public String getSharedAvailability() {
        return sharedAvailability;
    }

    public void setSharedAvailability(String sharedAvailability) {
        this.sharedAvailability = sharedAvailability;
    }

    public MatchStatus getStatus() {
        return status;
    }

    public void setStatus(MatchStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getMatchedAt() {
        return matchedAt;
    }

    public void setMatchedAt(LocalDateTime matchedAt) {
        this.matchedAt = matchedAt;
    }
}
