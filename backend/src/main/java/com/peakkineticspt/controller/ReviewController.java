package com.peakkineticspt.controller;

import com.peakkineticspt.dto.ReviewDTOs;
import com.peakkineticspt.service.IReviewService;
import com.resend.core.exception.ResendException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final IReviewService reviewService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<ReviewDTOs.ReviewResponse> reviews = reviewService.getAllPublishedReviews(page, size);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", reviews.getContent(),
                "total", reviews.getTotalElements(),
                "page", page,
                "pageSize", size
        ));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createReview(@Valid @RequestBody ReviewDTOs.CreateReviewRequest request) {
        ReviewDTOs.ReviewResponse response = reviewService.createReview(request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Thank you for your review!",
                "data", response
        ));
    }

    @GetMapping("/{reviewId}")
    public ResponseEntity<ReviewDTOs.ReviewResponse> getReview(
            @PathVariable long reviewId) {
        return ResponseEntity.ok(reviewService.getReviewById(reviewId));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Map<String, Object>> deleteReview(
            @PathVariable long reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Review deleted successfully"
        ));
    }

    @PostMapping("/admin/send-request")
    public ResponseEntity<Map<String, Object>> sendReviewRequest(
            @Valid @RequestBody ReviewDTOs.SendReviewRequestDTO request, HttpServletRequest httpServletRequest) throws ResendException {
        reviewService.sendReviewRequest(request, httpServletRequest);

        List<String> sentVia = new java.util.ArrayList<>();
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            sentVia.add("email");
        }
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            sentVia.add("sms");
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Review request sent successfully to " + request.getName(),
                "sentVia", sentVia,
                "reviewUrl", "https://peakkinetics.com/review"
        ));
    }

    @PostMapping("/admin/import")
    public ResponseEntity<Map<String, Object>> importReviews(
            @RequestParam("file") MultipartFile file) {
        ReviewDTOs.ImportResult result = reviewService.importReviewsFromExcel(file);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Successfully imported " + result.getImported() + " reviews",
                "imported", result.getImported(),
                "skipped", result.getSkipped(),
                "errors", result.getErrors()
        ));
    }
}
