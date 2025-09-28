package com.studysync.dto;

import java.util.List;
import java.util.Set;

public class MatchCandidateDto {
    private Long userId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String major;
    private String studyYear;
    private String studyStyle;
    private String profilePictureUrl;
    private Set<String> sharedClasses;
    private List<String> sharedGoals;
    private int compatibilityScore;
    private Double aiCompatibilityScore;
    private String aiSummary;
    private String distanceDescription;

    public MatchCandidateDto() {
    }

    public MatchCandidateDto(Long userId, String firstName, String lastName, String major, String studyYear,
            String studyStyle, String profilePictureUrl, Set<String> sharedClasses, List<String> sharedGoals,
            int compatibilityScore, Double aiCompatibilityScore, String aiSummary, String distanceDescription) {
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.fullName = buildFullName(firstName, lastName);
        this.major = major;
        this.studyYear = studyYear;
        this.studyStyle = studyStyle;
        this.profilePictureUrl = profilePictureUrl;
        this.sharedClasses = sharedClasses;
        this.sharedGoals = sharedGoals;
        this.compatibilityScore = compatibilityScore;
        this.aiCompatibilityScore = aiCompatibilityScore;
        this.aiSummary = aiSummary;
        this.distanceDescription = distanceDescription;
    }

    private String buildFullName(String firstName, String lastName) {
        StringBuilder sb = new StringBuilder();
        if (firstName != null) {
            sb.append(firstName.trim());
        }
        if (lastName != null && !lastName.trim().isEmpty()) {
            if (sb.length() > 0) {
                sb.append(" ");
            }
            sb.append(lastName.trim());
        }
        return sb.toString();
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
        this.fullName = buildFullName(firstName, this.lastName);
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
        this.fullName = buildFullName(this.firstName, lastName);
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
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

    public String getStudyStyle() {
        return studyStyle;
    }

    public void setStudyStyle(String studyStyle) {
        this.studyStyle = studyStyle;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public Set<String> getSharedClasses() {
        return sharedClasses;
    }

    public void setSharedClasses(Set<String> sharedClasses) {
        this.sharedClasses = sharedClasses;
    }

    public List<String> getSharedGoals() {
        return sharedGoals;
    }

    public void setSharedGoals(List<String> sharedGoals) {
        this.sharedGoals = sharedGoals;
    }

    public int getCompatibilityScore() {
        return compatibilityScore;
    }

    public void setCompatibilityScore(int compatibilityScore) {
        this.compatibilityScore = compatibilityScore;
    }

    public Double getAiCompatibilityScore() {
        return aiCompatibilityScore;
    }

    public void setAiCompatibilityScore(Double aiCompatibilityScore) {
        this.aiCompatibilityScore = aiCompatibilityScore;
    }

    public String getAiSummary() {
        return aiSummary;
    }

    public void setAiSummary(String aiSummary) {
        this.aiSummary = aiSummary;
    }

    public String getDistanceDescription() {
        return distanceDescription;
    }

    public void setDistanceDescription(String distanceDescription) {
        this.distanceDescription = distanceDescription;
    }
}
