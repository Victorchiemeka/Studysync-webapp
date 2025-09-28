package com.studysync.repository;

import com.studysync.model.CalendarEvent;
import com.studysync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {

    List<CalendarEvent> findByUserOrderByStartTimeAsc(User user);

    List<CalendarEvent> findByUserAndStartTimeBetweenOrderByStartTimeAsc(
            User user, LocalDateTime startTime, LocalDateTime endTime);

    @Query("SELECT e FROM CalendarEvent e WHERE e.user = :user AND e.endTime > :now AND e.availableForMatching = true")
    List<CalendarEvent> findUpcomingAvailableEvents(@Param("user") User user, @Param("now") LocalDateTime now);

    @Query("SELECT e FROM CalendarEvent e WHERE e.user = :user AND e.startTime >= :startTime AND e.endTime <= :endTime")
    List<CalendarEvent> findEventsInDateRange(@Param("user") User user,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    @Query("SELECT e FROM CalendarEvent e WHERE e.user = :user AND " +
            "((e.startTime <= :startTime AND e.endTime > :startTime) OR " +
            "(e.startTime < :endTime AND e.endTime >= :endTime) OR " +
            "(e.startTime >= :startTime AND e.endTime <= :endTime))")
    List<CalendarEvent> findConflictingEvents(@Param("user") User user,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    @Query("SELECT e FROM CalendarEvent e WHERE e.eventType = :eventType AND e.startTime >= :fromTime")
    List<CalendarEvent> findByEventTypeAndStartTimeAfter(
            @Param("eventType") CalendarEvent.EventType eventType,
            @Param("fromTime") LocalDateTime fromTime);
}