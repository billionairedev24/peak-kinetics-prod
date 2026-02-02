package com.peakkineticspt.service;

import com.peakkineticspt.service.IReviewService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewSyncTaskTest {

    @Mock
    private IReviewService reviewService;

    @InjectMocks
    private ReviewSyncTask reviewSyncTask;

    @Test
    void syncReviews_CallsService() {
        when(reviewService.syncGoogleReviews()).thenReturn(5);

        reviewSyncTask.syncReviews();

        verify(reviewService, times(1)).syncGoogleReviews();
    }
}
