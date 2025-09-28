package com.studysync.component;

import com.studysync.service.DataSeedingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements ApplicationRunner {

    @Autowired
    private DataSeedingService dataSeedingService;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        // Seed demo data for hackathon presentation
        dataSeedingService.seedDemoData();
    }
}