package com.peakkineticspt.service.impl;

import com.peakkineticspt.entity.Review;
import com.peakkineticspt.service.IGoogleBusinessProfileService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@ConditionalOnProperty(name = "google.business.enabled", havingValue = "false", matchIfMissing = true)
@Slf4j
public class NoOpGoogleBusinessProfileService implements IGoogleBusinessProfileService {

    @PostConstruct
    void announce() {
        log.info("Google Business Profile sync disabled (google.business.enabled=false); review sync will return empty. No google-api-client classes loaded.");
    }

    @Override
    public List<Review> fetchBusinessReviews() {
        log.info("Google Business review fetch skipped (integration disabled).");
        return List.of();
    }
}
