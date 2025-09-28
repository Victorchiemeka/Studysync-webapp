package com.studysync.controller;

import com.studysync.model.CalendarEvent;
import com.studysync.model.User;
import com.studysync.repository.CalendarEventRepository;
import com.studysync.service.CalendarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/calendar")
@CrossOrigin(origins = "http://localhost:3000")
public class CalendarController {

    @Autowired
    private CalendarService calendarService;

    @Autowired
    private CalendarEventRepository calendarEventRepository;

    @PostMapping("/events")
    public ResponseEntity<CalendarEvent> createEvent(@RequestBody CreateEventRequest request) {
        // In a real app, you'd get the user from the security context
        User user = new User(); // This would be injected from authentication
        user.setId(request.getUserId());

        CalendarEvent event = calendarService.createEvent(
                user,
                request.getTitle(),
                request.getDescription(),
                request.getStartTime(),
                request.getEndTime(),
                request.getLocation(),
                request.getEventType());

        CalendarEvent savedEvent = calendarEventRepository.save(event);
        return ResponseEntity.ok(savedEvent);
    }

    @GetMapping("/events/{userId}")
    public ResponseEntity<List<CalendarEvent>> getUserEvents(
            @PathVariable Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        User user = new User();
        user.setId(userId);

        List<CalendarEvent> events;
        if (startDate != null && endDate != null) {
            events = calendarEventRepository.findByUserAndStartTimeBetweenOrderByStartTimeAsc(user, startDate, endDate);
        } else {
            events = calendarEventRepository.findByUserOrderByStartTimeAsc(user);
        }

        return ResponseEntity.ok(events);
    }

    @GetMapping("/availability/{userId}")
    public ResponseEntity<List<String>> getUserAvailability(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        User user = new User();
        user.setId(userId);

        List<CalendarEvent> userEvents = calendarEventRepository.findByUserAndStartTimeBetweenOrderByStartTimeAsc(user,
                startDate, endDate);
        List<String> availableSlots = calendarService.findAvailableTimeSlots(user, userEvents, startDate, endDate);

        return ResponseEntity.ok(availableSlots);
    }

    @GetMapping("/common-availability")
    public ResponseEntity<List<String>> getCommonAvailability(
            @RequestParam Long user1Id,
            @RequestParam Long user2Id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        User user1 = new User();
        user1.setId(user1Id);
        User user2 = new User();
        user2.setId(user2Id);

        List<CalendarEvent> events1 = calendarEventRepository.findByUserAndStartTimeBetweenOrderByStartTimeAsc(user1,
                startDate, endDate);
        List<CalendarEvent> events2 = calendarEventRepository.findByUserAndStartTimeBetweenOrderByStartTimeAsc(user2,
                startDate, endDate);

        List<String> commonSlots = calendarService.findCommonAvailableSlots(user1, events1, user2, events2, startDate,
                endDate);

        return ResponseEntity.ok(commonSlots);
    }

    @GetMapping("/study-suggestions/{userId}")
    public ResponseEntity<List<String>> getStudySuggestions(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        User user = new User();
        user.setId(userId);

        List<CalendarEvent> userEvents = calendarEventRepository.findByUserAndStartTimeBetweenOrderByStartTimeAsc(user,
                startDate, endDate);
        List<String> suggestions = calendarService.suggestStudySessionTimes(user, userEvents, startDate, endDate);

        return ResponseEntity.ok(suggestions);
    }

    @GetMapping("/export/{userId}")
    public ResponseEntity<String> exportCalendar(@PathVariable Long userId) {
        User user = new User();
        user.setId(userId);

        List<CalendarEvent> events = calendarEventRepository.findByUserOrderByStartTimeAsc(user);
        String icsContent = calendarService.generateICSForEvents(events);

        return ResponseEntity.ok()
                .header("Content-Type", "text/calendar")
                .header("Content-Disposition", "attachment; filename=studysync-calendar.ics")
                .body(icsContent);
    }

    @DeleteMapping("/events/{eventId}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long eventId) {
        calendarEventRepository.deleteById(eventId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/events/{eventId}")
    public ResponseEntity<CalendarEvent> updateEvent(
            @PathVariable Long eventId,
            @RequestBody UpdateEventRequest request) {

        return calendarEventRepository.findById(eventId)
                .map(event -> {
                    if (request.getTitle() != null)
                        event.setTitle(request.getTitle());
                    if (request.getDescription() != null)
                        event.setDescription(request.getDescription());
                    if (request.getStartTime() != null)
                        event.setStartTime(request.getStartTime());
                    if (request.getEndTime() != null)
                        event.setEndTime(request.getEndTime());
                    if (request.getLocation() != null)
                        event.setLocation(request.getLocation());
                    if (request.getEventType() != null)
                        event.setEventType(request.getEventType());
                    if (request.getAvailableForMatching() != null)
                        event.setAvailableForMatching(request.getAvailableForMatching());

                    CalendarEvent savedEvent = calendarEventRepository.save(event);
                    return ResponseEntity.ok(savedEvent);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DTOs
    public static class CreateEventRequest {
        private Long userId;
        private String title;
        private String description;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String location;
        private CalendarEvent.EventType eventType;

        // Getters and setters
        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public LocalDateTime getStartTime() {
            return startTime;
        }

        public void setStartTime(LocalDateTime startTime) {
            this.startTime = startTime;
        }

        public LocalDateTime getEndTime() {
            return endTime;
        }

        public void setEndTime(LocalDateTime endTime) {
            this.endTime = endTime;
        }

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }

        public CalendarEvent.EventType getEventType() {
            return eventType;
        }

        public void setEventType(CalendarEvent.EventType eventType) {
            this.eventType = eventType;
        }
    }

    public static class UpdateEventRequest {
        private String title;
        private String description;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String location;
        private CalendarEvent.EventType eventType;
        private Boolean availableForMatching;

        // Getters and setters
        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public LocalDateTime getStartTime() {
            return startTime;
        }

        public void setStartTime(LocalDateTime startTime) {
            this.startTime = startTime;
        }

        public LocalDateTime getEndTime() {
            return endTime;
        }

        public void setEndTime(LocalDateTime endTime) {
            this.endTime = endTime;
        }

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }

        public CalendarEvent.EventType getEventType() {
            return eventType;
        }

        public void setEventType(CalendarEvent.EventType eventType) {
            this.eventType = eventType;
        }

        public Boolean getAvailableForMatching() {
            return availableForMatching;
        }

        public void setAvailableForMatching(Boolean availableForMatching) {
            this.availableForMatching = availableForMatching;
        }
    }
}