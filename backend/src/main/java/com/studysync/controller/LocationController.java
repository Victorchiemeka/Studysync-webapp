package com.studysync.controller;

import com.studysync.model.User;
import com.studysync.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/location")
@CrossOrigin(origins = "http://localhost:3000")
public class LocationController {

    @Autowired
    private LocationService locationService;

    @PostMapping("/update/{userId}")
    public ResponseEntity<String> updateUserLocation(
            @PathVariable Long userId,
            @RequestBody LocationUpdateRequest request) {

        if (!locationService.isValidLocation(request.getLatitude(), request.getLongitude())) {
            return ResponseEntity.badRequest().body("Invalid location coordinates");
        }

        // In a real app, you'd update the user in the database
        // UserRepository.findById(userId).ifPresent(user -> {
        // user.setLatitude(request.getLatitude());
        // user.setLongitude(request.getLongitude());
        // user.setLocationAddress(request.getAddress());
        // userRepository.save(user);
        // });

        return ResponseEntity.ok("Location updated successfully");
    }

    @GetMapping("/nearby/{userId}")
    public ResponseEntity<List<NearbyUserResponse>> getNearbyUsers(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "10.0") Double radiusKm) {

        // In a real app, you'd fetch the user and other users from database
        User currentUser = new User();
        currentUser.setId(userId);
        // Set coordinates from database

        List<User> allUsers = new ArrayList<>(); // Fetch from UserRepository
        List<User> nearbyUsers = locationService.findUsersWithinRadius(currentUser, allUsers, radiusKm);

        List<NearbyUserResponse> response = nearbyUsers.stream()
                .map(user -> {
                    double distance = locationService.calculateUserDistance(currentUser, user);
                    String distanceDescription = locationService.getDistanceDescription(currentUser, user);
                    return new NearbyUserResponse(user.getId(), user.getName(), distance, distanceDescription);
                })
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/distance/{userId1}/{userId2}")
    public ResponseEntity<DistanceResponse> getDistanceBetweenUsers(
            @PathVariable Long userId1,
            @PathVariable Long userId2) {

        // In a real app, fetch users from database
        User user1 = new User();
        user1.setId(userId1);
        User user2 = new User();
        user2.setId(userId2);

        double distance = locationService.calculateUserDistance(user1, user2);
        String description = locationService.getDistanceDescription(user1, user2);
        boolean areNearby = locationService.areUsersNearby(user1, user2);

        DistanceResponse response = new DistanceResponse(distance, description, areNearby);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/study-locations/{userId}")
    public ResponseEntity<List<StudyLocationSuggestion>> getStudyLocationSuggestions(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "5.0") Double radiusKm) {

        // This would integrate with external APIs (Google Places, etc.) to find study
        // locations
        List<StudyLocationSuggestion> suggestions = List.of(
                new StudyLocationSuggestion("University Library", "123 Campus Dr", 4.8, 0.5, "library"),
                new StudyLocationSuggestion("Coffee Bean Cafe", "456 Main St", 4.2, 1.2, "cafe"),
                new StudyLocationSuggestion("Central Park Study Area", "789 Park Ave", 4.0, 2.1, "outdoor"),
                new StudyLocationSuggestion("Community Center", "321 Oak St", 4.1, 3.5, "community_center"));

        return ResponseEntity.ok(suggestions);
    }

    @PostMapping("/calculate-center")
    public ResponseEntity<CenterPointResponse> calculateCenterPoint(@RequestBody List<Long> userIds) {
        // In a real app, fetch users from database
        List<User> users = new ArrayList<>();
        // Populate users based on userIds

        double[] centerPoint = locationService.getCenterPoint(users);
        CenterPointResponse response = new CenterPointResponse(centerPoint[0], centerPoint[1]);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/geocode")
    public ResponseEntity<GeocodeResponse> geocodeAddress(@RequestParam String address) {
        // This would integrate with geocoding API (Google Maps, etc.)
        // For now, return mock data
        GeocodeResponse response = new GeocodeResponse(
                40.7128, -74.0060, // NYC coordinates as example
                "New York, NY, USA");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/reverse-geocode")
    public ResponseEntity<ReverseGeocodeResponse> reverseGeocode(
            @RequestParam Double latitude,
            @RequestParam Double longitude) {

        if (!locationService.isValidLocation(latitude, longitude)) {
            return ResponseEntity.badRequest().body(null);
        }

        // This would integrate with reverse geocoding API
        ReverseGeocodeResponse response = new ReverseGeocodeResponse(
                "123 Example St, City, State 12345");

        return ResponseEntity.ok(response);
    }

    // DTOs
    public static class LocationUpdateRequest {
        private Double latitude;
        private Double longitude;
        private String address;

        public Double getLatitude() {
            return latitude;
        }

        public void setLatitude(Double latitude) {
            this.latitude = latitude;
        }

        public Double getLongitude() {
            return longitude;
        }

        public void setLongitude(Double longitude) {
            this.longitude = longitude;
        }

        public String getAddress() {
            return address;
        }

        public void setAddress(String address) {
            this.address = address;
        }
    }

    public static class NearbyUserResponse {
        private Long userId;
        private String name;
        private Double distance;
        private String distanceDescription;

        public NearbyUserResponse(Long userId, String name, Double distance, String distanceDescription) {
            this.userId = userId;
            this.name = name;
            this.distance = distance;
            this.distanceDescription = distanceDescription;
        }

        public Long getUserId() {
            return userId;
        }

        public String getName() {
            return name;
        }

        public Double getDistance() {
            return distance;
        }

        public String getDistanceDescription() {
            return distanceDescription;
        }
    }

    public static class DistanceResponse {
        private Double distance;
        private String description;
        private Boolean areNearby;

        public DistanceResponse(Double distance, String description, Boolean areNearby) {
            this.distance = distance;
            this.description = description;
            this.areNearby = areNearby;
        }

        public Double getDistance() {
            return distance;
        }

        public String getDescription() {
            return description;
        }

        public Boolean getAreNearby() {
            return areNearby;
        }
    }

    public static class StudyLocationSuggestion {
        private String name;
        private String address;
        private Double rating;
        private Double distance;
        private String type;

        public StudyLocationSuggestion(String name, String address, Double rating, Double distance, String type) {
            this.name = name;
            this.address = address;
            this.rating = rating;
            this.distance = distance;
            this.type = type;
        }

        public String getName() {
            return name;
        }

        public String getAddress() {
            return address;
        }

        public Double getRating() {
            return rating;
        }

        public Double getDistance() {
            return distance;
        }

        public String getType() {
            return type;
        }
    }

    public static class CenterPointResponse {
        private Double latitude;
        private Double longitude;

        public CenterPointResponse(Double latitude, Double longitude) {
            this.latitude = latitude;
            this.longitude = longitude;
        }

        public Double getLatitude() {
            return latitude;
        }

        public Double getLongitude() {
            return longitude;
        }
    }

    public static class GeocodeResponse {
        private Double latitude;
        private Double longitude;
        private String formattedAddress;

        public GeocodeResponse(Double latitude, Double longitude, String formattedAddress) {
            this.latitude = latitude;
            this.longitude = longitude;
            this.formattedAddress = formattedAddress;
        }

        public Double getLatitude() {
            return latitude;
        }

        public Double getLongitude() {
            return longitude;
        }

        public String getFormattedAddress() {
            return formattedAddress;
        }
    }

    public static class ReverseGeocodeResponse {
        private String address;

        public ReverseGeocodeResponse(String address) {
            this.address = address;
        }

        public String getAddress() {
            return address;
        }
    }
}