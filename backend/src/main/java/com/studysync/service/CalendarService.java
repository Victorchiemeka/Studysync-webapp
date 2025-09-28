package com.studysync.service;

import com.studysync.model.CalendarEvent;
import com.studysync.model.User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CalendarService {

    /**
     * Find available time slots for a user based on their calendar events
     */
    public List<String> findAvailableTimeSlots(User user, List<CalendarEvent> userEvents,
            LocalDateTime startDate, LocalDateTime endDate) {
        List<String> availableSlots = new ArrayList<>();

        // Generate potential time slots (e.g., every hour from 8 AM to 10 PM)
        LocalDateTime current = startDate.withHour(8).withMinute(0).withSecond(0);
        LocalDateTime dailyEnd = startDate.withHour(22).withMinute(0).withSecond(0);

        while (current.isBefore(endDate)) {
            if (current.isAfter(dailyEnd)) {
                // Move to next day at 8 AM
                current = current.plusDays(1).withHour(8).withMinute(0).withSecond(0);
                dailyEnd = current.withHour(22).withMinute(0).withSecond(0);
                continue;
            }

            LocalDateTime slotEnd = current.plusHours(2); // 2-hour study slots

            // Check if this slot conflicts with any existing events
            final LocalDateTime finalCurrent = current;
            final LocalDateTime finalSlotEnd = slotEnd;
            boolean isAvailable = userEvents.stream()
                    .noneMatch(event -> isTimeSlotConflicting(finalCurrent, finalSlotEnd, event));

            if (isAvailable) {
                String slotDescription = formatTimeSlot(current, slotEnd);
                availableSlots.add(slotDescription);
            }

            current = current.plusHours(1); // Check every hour
        }

        return availableSlots;
    }

    /**
     * Find common available time slots between two users
     */
    public List<String> findCommonAvailableSlots(User user1, List<CalendarEvent> events1,
            User user2, List<CalendarEvent> events2,
            LocalDateTime startDate, LocalDateTime endDate) {
        List<String> user1Available = findAvailableTimeSlots(user1, events1, startDate, endDate);
        List<String> user2Available = findAvailableTimeSlots(user2, events2, startDate, endDate);

        return user1Available.stream()
                .filter(user2Available::contains)
                .collect(Collectors.toList());
    }

    /**
     * Suggest optimal study session times based on user preferences and
     * availability
     */
    public List<String> suggestStudySessionTimes(User user, List<CalendarEvent> userEvents,
            LocalDateTime startDate, LocalDateTime endDate) {
        List<String> availableSlots = findAvailableTimeSlots(user, userEvents, startDate, endDate);

        // Filter and prioritize based on user's study preferences
        return availableSlots.stream()
                .filter(slot -> isPreferredStudyTime(slot, user))
                .limit(10) // Return top 10 suggestions
                .collect(Collectors.toList());
    }

    /**
     * Create a new calendar event
     */
    public CalendarEvent createEvent(User user, String title, String description,
            LocalDateTime startTime, LocalDateTime endTime,
            String location, CalendarEvent.EventType eventType) {
        CalendarEvent event = new CalendarEvent(user, title, startTime, endTime, location, eventType);
        event.setDescription(description);
        return event;
    }

    /**
     * Check if a proposed time slot conflicts with existing events
     */
    public boolean hasTimeConflict(List<CalendarEvent> events, LocalDateTime startTime, LocalDateTime endTime) {
        return events.stream()
                .anyMatch(event -> isTimeSlotConflicting(startTime, endTime, event));
    }

    /**
     * Get events for a specific date range
     */
    public List<CalendarEvent> getEventsInDateRange(List<CalendarEvent> allEvents,
            LocalDateTime startDate, LocalDateTime endDate) {
        return allEvents.stream()
                .filter(event -> {
                    LocalDateTime eventStart = event.getStartTime();
                    LocalDateTime eventEnd = event.getEndTime();

                    // Event overlaps with the date range
                    return eventStart.isBefore(endDate) && eventEnd.isAfter(startDate);
                })
                .collect(Collectors.toList());
    }

    /**
     * Generate ICS (iCalendar) format for events
     */
    public String generateICSForEvents(List<CalendarEvent> events) {
        StringBuilder ics = new StringBuilder();
        ics.append("BEGIN:VCALENDAR\n");
        ics.append("VERSION:2.0\n");
        ics.append("PRODID:-//StudySync//StudySync Calendar//EN\n");

        for (CalendarEvent event : events) {
            ics.append("BEGIN:VEVENT\n");
            ics.append("UID:").append(event.getId()).append("@studysync.com\n");
            ics.append("DTSTART:").append(formatDateTimeForICS(event.getStartTime())).append("\n");
            ics.append("DTEND:").append(formatDateTimeForICS(event.getEndTime())).append("\n");
            ics.append("SUMMARY:").append(event.getTitle()).append("\n");
            if (event.getDescription() != null) {
                ics.append("DESCRIPTION:").append(event.getDescription()).append("\n");
            }
            ics.append("LOCATION:").append(event.getLocation()).append("\n");
            ics.append("END:VEVENT\n");
        }

        ics.append("END:VCALENDAR\n");
        return ics.toString();
    }

    private boolean isTimeSlotConflicting(LocalDateTime slotStart, LocalDateTime slotEnd, CalendarEvent event) {
        LocalDateTime eventStart = event.getStartTime();
        LocalDateTime eventEnd = event.getEndTime();

        // Check if the time slot overlaps with the event
        return slotStart.isBefore(eventEnd) && slotEnd.isAfter(eventStart);
    }

    private String formatTimeSlot(LocalDateTime start, LocalDateTime end) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm");
        return start.format(formatter) + " - " + end.format(DateTimeFormatter.ofPattern("HH:mm"));
    }

    private boolean isPreferredStudyTime(String timeSlot, User user) {
        // This could be enhanced based on user's study style preferences
        // For now, prioritize afternoon and evening slots
        return timeSlot.contains("14:") || timeSlot.contains("15:") ||
                timeSlot.contains("16:") || timeSlot.contains("19:") || timeSlot.contains("20:");
    }

    private String formatDateTimeForICS(LocalDateTime dateTime) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss");
        return dateTime.format(formatter);
    }

    /**
     * Parse availability string from user profile and convert to time slots
     */
    public List<String> parseUserAvailability(String availabilityJson) {
        List<String> slots = new ArrayList<>();

        // This is a simplified parser - in a real app you'd use proper JSON parsing
        if (availabilityJson != null && !availabilityJson.isEmpty()) {
            // Example: Parse JSON like {"Monday": ["09:00-12:00", "14:00-17:00"]}
            // For now, return some default slots
            slots.add("Monday 14:00 - 16:00");
            slots.add("Tuesday 10:00 - 12:00");
            slots.add("Wednesday 15:00 - 17:00");
            slots.add("Thursday 13:00 - 15:00");
            slots.add("Friday 11:00 - 13:00");
        }

        return slots;
    }
}