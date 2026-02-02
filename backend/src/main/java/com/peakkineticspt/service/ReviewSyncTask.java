package com.peakkineticspt.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReviewSyncTask {

    private final IReviewService reviewService;

    @Scheduled(cron = "0 0 2 * * ?") // Every day at 2 AM
    @Transactional
    public void syncReviews() {
        log.info("Triggering scheduled Google Reviews sync...");
        int newReviews = reviewService.syncGoogleReviews();
        log.info("Scheduled sync finished. {} new reviews found.", newReviews);
    }
}
