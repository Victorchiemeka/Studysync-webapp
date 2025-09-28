package com.studysync.repository;

import com.studysync.model.AiMatchSuggestion;
import com.studysync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AiMatchSuggestionRepository extends JpaRepository<AiMatchSuggestion, Long> {

    List<AiMatchSuggestion> findByUserOrderByCompatibilityScoreDesc(User user);

    List<AiMatchSuggestion> findByUserAndStatusOrderByCompatibilityScoreDesc(
            User user, AiMatchSuggestion.SuggestionStatus status);

    Optional<AiMatchSuggestion> findByUserAndSuggestedUser(User user, User suggestedUser);

    @Query("SELECT s FROM AiMatchSuggestion s WHERE s.user = :user AND s.status = :status AND s.compatibilityScore >= :minScore ORDER BY s.compatibilityScore DESC")
    List<AiMatchSuggestion> findHighQualityMatches(@Param("user") User user,
            @Param("status") AiMatchSuggestion.SuggestionStatus status,
            @Param("minScore") Double minScore);

    @Query("SELECT s FROM AiMatchSuggestion s WHERE s.user = :user AND s.createdAt >= :since ORDER BY s.createdAt DESC")
    List<AiMatchSuggestion> findRecentSuggestions(@Param("user") User user, @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(s) FROM AiMatchSuggestion s WHERE s.user = :user AND s.status = :status")
    Long countByUserAndStatus(@Param("user") User user, @Param("status") AiMatchSuggestion.SuggestionStatus status);

    @Query("SELECT s FROM AiMatchSuggestion s WHERE s.user = :user AND s.distanceKm <= :maxDistance ORDER BY s.distanceKm ASC")
    List<AiMatchSuggestion> findNearbyMatches(@Param("user") User user, @Param("maxDistance") Double maxDistance);
}