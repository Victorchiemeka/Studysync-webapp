package com.studysync.dto;

import com.studysync.model.enums.StudyStyle;

import java.util.Set;

public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String studyYear;
    private String major;
    private StudyStyle studyStyle;
    private Set<String> goals;

    // Constructors
    public UserResponse() {
    }

    public UserResponse(Long id, String username, String email, String firstName,
            String lastName, String studyYear, String major,
            StudyStyle studyStyle, Set<String> goals) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.studyYear = studyYear;
        this.major = major;
        this.studyStyle = studyStyle;
        this.goals = goals;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public String getStudyYear() {
        return studyYear;
    }

    public void setStudyYear(String studyYear) {
        this.studyYear = studyYear;
    }

    public String getMajor() {
        return major;
    }

    public void setMajor(String major) {
        this.major = major;
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
}