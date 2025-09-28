package com.studysync.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "StudySync Backend is running!");
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }

    @GetMapping("/")
    public Map<String, Object> root() {
        Map<String, Object> response = new HashMap<>();
        response.put("application", "StudySync");
        response.put("message", "Welcome to StudySync API");
        response.put("documentation", "/swagger-ui.html");
        return response;
    }
}