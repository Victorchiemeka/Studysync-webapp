package com.studysync;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class StudySyncApplication {

    public static void main(String[] args) {
        System.out.println("Starting StudySync Application...");
        System.out.println("Backend will be available at: http://localhost:8081");
        System.out.println("H2 Console will be available at: http://localhost:8081/h2-console");
        SpringApplication.run(StudySyncApplication.class, args);
        System.out.println("StudySync Application started successfully!");
    }

}
