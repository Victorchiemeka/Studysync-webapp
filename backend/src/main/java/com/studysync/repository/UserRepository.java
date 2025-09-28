package com.studysync.repository;

import com.studysync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    // Field-based access in the JPA entity uses 'studyYear' as the attribute name
    // so the derived query must reference that property.
    List<User> findByMajorAndStudyYear(String major, String studyYear);

    List<User> findByLatitudeBetweenAndLongitudeBetween(double minLat, double maxLat, double minLng, double maxLng);
}