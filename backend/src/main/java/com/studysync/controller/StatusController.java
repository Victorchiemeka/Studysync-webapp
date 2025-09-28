package com.studysync.controller;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/status")
@CrossOrigin(origins = { "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001",
        "http://127.0.0.1:3001" }, allowCredentials = "true")
public class StatusController {

    @GetMapping("/health")
    public Map<String, Object> healthCheck() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "UP");
        status.put("timestamp", System.currentTimeMillis());
        status.put("message", "StudySync backend is running successfully");
        status.put("features", Map.of(
                "smartProfiles", "✅ Complete with classes, availability, location, study style, goals",
                "aiMatching", "✅ Gemini AI-powered compatibility scoring with hard filters",
                "inAppChat", "✅ Secure messaging with session scheduling",
                "calendarIntegration", "✅ Google Calendar integration with availability matching",
                "groupFormation", "✅ Partner vs Group preference toggle",
                "sessionScheduler", "✅ In-chat scheduling with shared availability"));
        return status;
    }
}