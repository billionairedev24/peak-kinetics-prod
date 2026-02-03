package com.peakkineticspt.service.impl;

import com.peakkineticspt.dto.ReviewDTOs;
import com.peakkineticspt.entity.Review;
import com.peakkineticspt.repository.ReviewRepository;
import java.util.List;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.SpanBuilder;
import io.opentelemetry.api.trace.Tracer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceImplTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private Tracer tracer;

    @Mock
    private SpanBuilder spanBuilder;

    @Mock
    private Span span;

    @Mock
    private GoogleBusinessProfileService googleBusinessProfileService;

    @InjectMocks
    private ReviewServiceImpl reviewService;

    @BeforeEach
    void setUp() {
        lenient().when(tracer.spanBuilder(anyString())).thenReturn(spanBuilder);
        lenient().when(spanBuilder.startSpan()).thenReturn(span);
    }

    @Test
    void createReview_Success() {
        ReviewDTOs.CreateReviewRequest request = ReviewDTOs.CreateReviewRequest.builder()
                .name("John Doe")
                .rating(5)
                .text("This is a great service and I highly recommend it!")
                .build();

        Review savedReview = Review.builder()
                .id(1L)
                .name("John Doe")
                .rating(5)
                .text("This is a great service and I highly recommend it!")
                .published(false)
                .createdAt(java.time.LocalDateTime.now())
                .build();

        when(reviewRepository.save(any(Review.class))).thenReturn(savedReview);

        ReviewDTOs.ReviewResponse response = reviewService.createReview(request);

        assertNotNull(response);
        assertEquals("John", response.getName()); // toResponse splits "John Doe"
        assertEquals(1L, response.getId());
        verify(reviewRepository).save(any(Review.class));
    }

    @Test
    void createReview_SpamRatingTooLow() {
        ReviewDTOs.CreateReviewRequest request = ReviewDTOs.CreateReviewRequest.builder()
                .name("Spammer")
                .rating(0)
                .text("Valid length but invalid rating.")
                .build();

        assertThrows(RuntimeException.class, () -> reviewService.createReview(request));
        verify(reviewRepository, never()).save(any());
    }

    @Test
    void createReview_SpamContentTooShort() {
        ReviewDTOs.CreateReviewRequest request = ReviewDTOs.CreateReviewRequest.builder()
                .name("Spammer")
                .rating(5)
                .text("Too short")
                .build();

        assertThrows(RuntimeException.class, () -> reviewService.createReview(request));
        verify(reviewRepository, never()).save(any());
    }

    @Test
    void syncGoogleReviews_SavesNewReviewsOnly() {
        Review existingReview = Review.builder().googleReviewId("old-id").build();
        Review newReview = Review.builder().googleReviewId("new-id").build();

        when(googleBusinessProfileService.fetchBusinessReviews()).thenReturn(List.of(existingReview, newReview));
        when(reviewRepository.existsByGoogleReviewId("old-id")).thenReturn(true);
        when(reviewRepository.existsByGoogleReviewId("new-id")).thenReturn(false);

        int importedCount = reviewService.syncGoogleReviews();

        assertEquals(1, importedCount);
        verify(reviewRepository, times(1)).save(newReview);
        verify(reviewRepository, never()).save(existingReview);
    }
}
