package com.peakkineticspt.service.impl;

import com.peakkineticspt.entity.Review;
import com.peakkineticspt.entity.ReviewSource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GooglePlacesServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private GooglePlacesService googlePlacesService;

    @BeforeEach
    void setUp() {
        // Reflection or setter could be used if @Value is not handled by InjectMocks,
        // but for unit test we can rely on Mocking the behavior.
        // GooglePlacesService uses @Value which Mockito doesn't populate.
        // However, the logic we are testing is the parsing of the response.
    }

    @Test
    @SuppressWarnings("unchecked")
    void fetchGoogleReviews_Success() {
        // Mock response
        Map<String, Object> responseBody = new HashMap<>();
        Map<String, Object> reviewData = new HashMap<>();
        reviewData.put("name", "places/123/reviews/456");
        reviewData.put("rating", 5);

        Map<String, Object> textMap = new HashMap<>();
        textMap.put("text", "Great service!");
        reviewData.put("text", textMap);

        reviewData.put("publishTime", "2026-01-18T20:00:00Z");

        Map<String, Object> authorMap = new HashMap<>();
        authorMap.put("displayName", "Jane Doe");
        authorMap.put("uri", "http://google.com/profile");
        authorMap.put("photoUri", "http://google.com/photo.jpg");
        reviewData.put("authorAttribution", authorMap);

        responseBody.put("reviews", List.of(reviewData));

        ResponseEntity<Map> responseEntity = ResponseEntity.ok(responseBody);

        when(restTemplate.getForEntity(
                anyString(),
                eq(Map.class))).thenReturn(responseEntity);

        List<Review> result = googlePlacesService.fetchGoogleReviews();

        assertEquals(1, result.size());
        Review review = result.get(0);
        assertEquals("Jane Doe", review.getName());
        assertEquals("Great service!", review.getText());
        assertEquals(5, review.getRating());
        assertEquals(ReviewSource.GOOGLE, review.getSource());
        assertEquals("places/123/reviews/456", review.getGoogleReviewId());
        assertEquals("http://google.com/profile", review.getAuthorUrl());
        assertEquals("http://google.com/photo.jpg", review.getAuthorPhotoUrl());
    }

    @Test
    @SuppressWarnings("unchecked")
    void fetchGoogleReviews_EmptyResponse() {
        Map<String, Object> responseBody = new HashMap<>();
        // No "reviews" key

        ResponseEntity<Map> responseEntity = ResponseEntity.ok(responseBody);

        when(restTemplate.getForEntity(
                anyString(),
                eq(Map.class))).thenReturn(responseEntity);

        List<Review> result = googlePlacesService.fetchGoogleReviews();

        assertTrue(result.isEmpty());
    }
}
