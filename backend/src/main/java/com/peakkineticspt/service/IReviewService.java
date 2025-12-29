package com.peakkineticspt.service;

import com.peakkineticspt.dto.ReviewDTOs;
import com.resend.core.exception.ResendException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

public interface IReviewService {
    Page<ReviewDTOs.ReviewResponse> getAllPublishedReviews(int page, int size);
    ReviewDTOs.ReviewResponse createReview(ReviewDTOs.CreateReviewRequest request);
    ReviewDTOs.ReviewResponse getReviewById(long id);
    void deleteReview(long id);
    void sendReviewRequest(ReviewDTOs.SendReviewRequestDTO request, HttpServletRequest httpServletRequest) throws ResendException;
    ReviewDTOs.ImportResult importReviewsFromExcel(MultipartFile file);
}
