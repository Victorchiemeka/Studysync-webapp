package com.studysync.repository;

import com.studysync.model.Match;
import com.studysync.model.User;
import com.studysync.model.enums.MatchStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {
    Optional<Match> findByUser1AndUser2(User user1, User user2);

    @EntityGraph(attributePaths = { "user1", "user2" })
    List<Match> findByUser1AndStatus(User user1, MatchStatus status);

    @EntityGraph(attributePaths = { "user1", "user2" })
    List<Match> findByUser2AndStatus(User user2, MatchStatus status);

    @EntityGraph(attributePaths = { "user1", "user2" })
    List<Match> findByUser1OrUser2(User user1, User user2);

    @EntityGraph(attributePaths = { "user1", "user2" })
    List<Match> findByUser1OrUser2AndStatus(User user1, User user2, MatchStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT m FROM Match m JOIN FETCH m.user1 JOIN FETCH m.user2 WHERE ((m.user1 = ?1 AND m.user2 = ?2) OR (m.user1 = ?2 AND m.user2 = ?1))")
    Match findByUsers(User user1, User user2);
}
