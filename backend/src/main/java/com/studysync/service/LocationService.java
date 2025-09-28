package com.studysync.service;

import com.studysync.model.User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LocationService {

    private static final double EARTH_RADIUS_KM = 6371.0;

    /**
     * Calculate distance between two points using Haversine formula
     */
    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c;
    }

    /**
     * Calculate distance between two users
     */
    public double calculateUserDistance(User user1, User user2) {
        if (user1.getLatitude() == null || user1.getLongitude() == null ||
                user2.getLatitude() == null || user2.getLongitude() == null) {
            return Double.MAX_VALUE; // Return max value if location is not available
        }

        return calculateDistance(
                user1.getLatitude(), user1.getLongitude(),
                user2.getLatitude(), user2.getLongitude());
    }

    /**
     * Find users within a specified radius
     */
    public List<User> findUsersWithinRadius(User centerUser, List<User> allUsers, double radiusKm) {
        if (centerUser.getLatitude() == null || centerUser.getLongitude() == null) {
            return List.of(); // Return empty list if center user has no location
        }

        return allUsers.stream()
                .filter(user -> !user.getId().equals(centerUser.getId())) // Exclude the center user
                .filter(user -> user.getLatitude() != null && user.getLongitude() != null)
                .filter(user -> calculateUserDistance(centerUser, user) <= radiusKm)
                .collect(Collectors.toList());
    }

    /**
     * Get users sorted by distance from a center point
     */
    public List<User> getUsersSortedByDistance(User centerUser, List<User> allUsers) {
        if (centerUser.getLatitude() == null || centerUser.getLongitude() == null) {
            return allUsers.stream()
                    .filter(user -> !user.getId().equals(centerUser.getId()))
                    .collect(Collectors.toList());
        }

        return allUsers.stream()
                .filter(user -> !user.getId().equals(centerUser.getId()))
                .filter(user -> user.getLatitude() != null && user.getLongitude() != null)
                .sorted((u1, u2) -> {
                    double dist1 = calculateUserDistance(centerUser, u1);
                    double dist2 = calculateUserDistance(centerUser, u2);
                    return Double.compare(dist1, dist2);
                })
                .collect(Collectors.toList());
    }

    /**
     * Determine if two users are in the same general area (within 5km)
     */
    public boolean areUsersNearby(User user1, User user2) {
        return areUsersNearby(user1, user2, 5.0);
    }

    /**
     * Determine if two users are within a specified distance
     */
    public boolean areUsersNearby(User user1, User user2, double maxDistanceKm) {
        double distance = calculateUserDistance(user1, user2);
        return distance != Double.MAX_VALUE && distance <= maxDistanceKm;
    }

    /**
     * Get a textual description of the distance between users
     */
    public String getDistanceDescription(User user1, User user2) {
        double distance = calculateUserDistance(user1, user2);

        if (distance == Double.MAX_VALUE) {
            return "Location not available";
        }

        if (distance < 0.5) {
            return "Very close (less than 0.5 km)";
        } else if (distance < 1.0) {
            return String.format("%.1f km away", distance);
        } else if (distance < 10.0) {
            return String.format("%.1f km away", distance);
        } else {
            return String.format("%.0f km away", distance);
        }
    }

    /**
     * Validate latitude and longitude values
     */
    public boolean isValidLocation(Double latitude, Double longitude) {
        return latitude != null && longitude != null &&
                latitude >= -90.0 && latitude <= 90.0 &&
                longitude >= -180.0 && longitude <= 180.0;
    }

    /**
     * Get the center point (average) of multiple locations
     */
    public double[] getCenterPoint(List<User> users) {
        List<User> usersWithLocation = users.stream()
                .filter(user -> user.getLatitude() != null && user.getLongitude() != null)
                .collect(Collectors.toList());

        if (usersWithLocation.isEmpty()) {
            return new double[] { 0.0, 0.0 }; // Default to equator/prime meridian
        }

        double avgLat = usersWithLocation.stream()
                .mapToDouble(User::getLatitude)
                .average()
                .orElse(0.0);

        double avgLon = usersWithLocation.stream()
                .mapToDouble(User::getLongitude)
                .average()
                .orElse(0.0);

        return new double[] { avgLat, avgLon };
    }
}