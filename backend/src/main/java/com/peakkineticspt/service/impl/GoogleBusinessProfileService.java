package com.peakkineticspt.service.impl;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpRequest;
import com.google.api.client.http.HttpRequestFactory;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.UserCredentials;
import com.peakkineticspt.entity.Review;
import com.peakkineticspt.entity.ReviewSource;
import com.peakkineticspt.service.IGoogleBusinessProfileService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@ConditionalOnProperty(name = "google.business.enabled", havingValue = "true")
@Slf4j
public class GoogleBusinessProfileService implements IGoogleBusinessProfileService {

    @Value("${google.oauth.client-id}")
    private String clientId;

    @Value("${google.oauth.client-secret}")
    private String clientSecret;

    @Value("${google.oauth.refresh-token}")
    private String refreshToken;

    @Value("${google.business.account-ref}")
    private String accountRef;

    @Value("${google.business.location-ref}")
    private String locationRef;

    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    @Override
    public List<Review> fetchBusinessReviews() {
        try {
            HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();

            UserCredentials credentials = UserCredentials.newBuilder()
                    .setClientId(clientId)
                    .setClientSecret(clientSecret)
                    .setRefreshToken(refreshToken)
                    .build();

            HttpRequestFactory requestFactory = httpTransport
                    .createRequestFactory(new HttpCredentialsAdapter(credentials));

            // URL for reviews:
            // https://mybusinessreviews.googleapis.com/v1/{parent=accounts/*/locations/*}/reviews
            // If the refs are configured properly, they should look like "accounts/123" and
            // "locations/456"
            String url = String.format("https://mybusinessreviews.googleapis.com/v1/%s/%s/reviews", accountRef,
                    locationRef);

            log.info("Fetching reviews from Google Business Profile API: {}", url);

            HttpRequest request = requestFactory.buildGetRequest(new com.google.api.client.http.GenericUrl(url));
            com.google.api.client.http.HttpResponse response = request.execute();

            @SuppressWarnings("unchecked")
            Map<String, Object> body = (Map<String, Object>) JSON_FACTORY.fromString(response.parseAsString(),
                    Map.class);

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> reviewsList = (List<Map<String, Object>>) body.get("reviews");

            if (reviewsList == null) {
                log.info("No reviews found for location: {}", locationRef);
                return new ArrayList<>();
            }

            return reviewsList.stream()
                    .map(this::mapToEntity)
                    .toList();

        } catch (IOException | GeneralSecurityException e) {
            log.error("Error fetching Google Business reviews", e);
            return new ArrayList<>();
        }
    }

    private Review mapToEntity(Map<String, Object> googleReview) {
        // Map fields according to Google Business Profile API v1 Review structure
        // https://developers.google.com/my-business/reference/rest/v1/accounts.locations.reviews

        @SuppressWarnings("unchecked")
        Map<String, Object> reviewer = (Map<String, Object>) googleReview.get("reviewer");
        String reviewerName = "Anonymous";
        String photoUrl = null;

        if (reviewer != null) {
            reviewerName = (String) reviewer.get("displayName");
            photoUrl = (String) reviewer.get("profilePhotoUrl");
        }

        return Review.builder()
                .name(reviewerName != null ? reviewerName : "Google User")
                .rating(parseRating((String) googleReview.get("starRating")))
                .text((String) googleReview.get("comment"))
                .published(true)
                .source(ReviewSource.GOOGLE)
                .googleReviewId((String) googleReview.get("reviewId"))
                .authorPhotoUrl(photoUrl)
                .build();
    }

    private int parseRating(String rating) {
        if (rating == null)
            return 5; // Default to 5 if unknown
        return switch (rating.toUpperCase()) {
            case "FIVE" -> 5;
            case "FOUR" -> 4;
            case "THREE" -> 3;
            case "TWO" -> 2;
            case "ONE" -> 1;
            default -> 5;
        };
    }
}
