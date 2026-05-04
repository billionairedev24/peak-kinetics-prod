package com.peakkineticspt.service.impl;

import com.peakkineticspt.dto.ReviewDTOs;
import com.peakkineticspt.entity.Review;
import com.peakkineticspt.repository.ReviewRepository;
import com.peakkineticspt.service.IEmailNotificationService;
import com.peakkineticspt.service.IGoogleBusinessProfileService;
import com.peakkineticspt.service.IReviewService;
import com.peakkineticspt.service.ISmsNotificationService;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.Tracer;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewServiceImpl implements IReviewService {

    private final ReviewRepository reviewRepository;
    private final IEmailNotificationService emailService;
    private final ISmsNotificationService smsService;
    private final IGoogleBusinessProfileService googleBusinessProfileService;
    private final Tracer tracer;

    @Override
    public Page<ReviewDTOs.ReviewResponse> getAllPublishedReviews(int page, int size) {
        Span span = tracer.spanBuilder("review.getAllPublished").startSpan();
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal instanceof UserDetails) {
                String user = ((UserDetails) principal).getUsername();
                if (Objects.nonNull(user)) {
                    return reviewRepository.findAll(PageRequest.of(page, size))
                            .map(this::toResponse);
                }
            }
            return reviewRepository.findByPublishedTrue(PageRequest.of(page, size))
                    .map(this::toResponse);
        } finally {
            span.end();
        }
    }

    @Override
    @Transactional
    public ReviewDTOs.ReviewResponse createReview(ReviewDTOs.CreateReviewRequest request) {
        Span span = tracer.spanBuilder("review.create").startSpan();
        try {
            if (request.getRating() < 1 || request.getRating() > 5) {
                throw new IllegalArgumentException("Rating must be between 1 and 5");
            }

            if (request.getText() == null || request.getText().trim().length() < 10) {
                throw new IllegalArgumentException("Review text must be at least 10 characters long");
            }

            Review review = Review.builder()
                    .name(request.getName())
                    .rating(request.getRating())
                    .text(request.getText())
                    .published(false) // Requires admin approval
                    .build();

            review = reviewRepository.save(review);

            span.setAttribute("review.id", review.getId());
            span.setAttribute("review.rating", review.getRating());

            return toResponse(review);
        } finally {
            span.end();
        }
    }

    @Override
    public ReviewDTOs.ReviewResponse getReviewById(long id) {
        Span span = tracer.spanBuilder("review.getById").startSpan();
        try {
            Review review = reviewRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Review not found"));
            return toResponse(review);
        } finally {
            span.end();
        }
    }

    @Override
    @Transactional
    public void deleteReview(long id) {
        Span span = tracer.spanBuilder("review.delete").startSpan();
        try {
            if (!reviewRepository.existsById(id)) {
                throw new RuntimeException("Review not found");
            }
            reviewRepository.deleteById(id);
            span.setAttribute("review.id", id);
        } finally {
            span.end();
        }
    }

    @Override
    public void sendReviewRequest(ReviewDTOs.SendReviewRequestDTO request, HttpServletRequest httpServletRequest) {
        Span span = tracer.spanBuilder("review.sendRequest").startSpan();
        try {
            if (request.getEmail() != null && !request.getEmail().isBlank()) {
                emailService.sendReviewRequestEmail(request.getEmail(), request.getName(), httpServletRequest);
            }

            if (request.getPhone() != null && !request.getPhone().isBlank()) {
                smsService.sendReviewRequestSms(request.getPhone(), request.getName());
            }

            span.setAttribute("client.name", request.getName());
        } finally {
            span.end();
        }
    }

    @Override
    public void sendReferralRequest(ReviewDTOs.SendReferralRequestDTO request, HttpServletRequest httpServletRequest) {
        Span span = tracer.spanBuilder("review.sendReferralRequest").startSpan();
        try {
            if (request.getEmail() != null && !request.getEmail().isBlank()) {
                emailService.sendReferralRequestEmail(request.getEmail(), request.getName(), httpServletRequest);
            }

            if (request.getPhone() != null && !request.getPhone().isBlank()) {
                smsService.sendReferralRequestSms(request.getPhone(), request.getName());
            }

            span.setAttribute("client.name", request.getName());
        } finally {
            span.end();
        }
    }

    @Override
    @Transactional
    public ReviewDTOs.ImportResult importReviewsFromExcel(MultipartFile file) {
        Span span = tracer.spanBuilder("review.importExcel").startSpan();
        try {
            List<String> errors = new ArrayList<>();
            int imported = 0;
            int skipped = 0;

            try (InputStream inputStream = file.getInputStream();
                    Workbook workbook = new XSSFWorkbook(inputStream)) {

                // Get the third sheet (index 2) named "All Data"
                Sheet sheet = workbook.getSheetAt(2);

                if (sheet == null) {
                    throw new RuntimeException("Sheet 'All Data' not found");
                }

                // Get header row to find column indices
                Row headerRow = sheet.getRow(0);
                if (headerRow == null) {
                    throw new RuntimeException("Header row not found");
                }

                // Find column indices
                int firstNameCol = -1;
                int lastNameCol = -1;
                int commentsCol = -1;

                for (Cell cell : headerRow) {
                    String header = cell.getStringCellValue().trim();
                    if (header.equalsIgnoreCase("Patient First Name")) {
                        firstNameCol = cell.getColumnIndex();
                    } else if (header.equalsIgnoreCase("Patient Last Name")) {
                        lastNameCol = cell.getColumnIndex();
                    } else if (header.equalsIgnoreCase("Comments")) {
                        commentsCol = cell.getColumnIndex();
                    }
                }

                if (firstNameCol == -1 || lastNameCol == -1 || commentsCol == -1) {
                    throw new RuntimeException("Required columns not found");
                }

                // Process data rows (skip header)
                for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                    Row row = sheet.getRow(i);
                    if (row == null) {
                        continue;
                    }

                    try {
                        String firstName = getCellValueAsString(row.getCell(firstNameCol));
                        String lastName = getCellValueAsString(row.getCell(lastNameCol));
                        String comments = getCellValueAsString(row.getCell(commentsCol));

                        if (firstName.isBlank() || lastName.isBlank() || comments.isBlank()) {
                            skipped++;
                            errors.add(String.format("Row %d: Missing required fields", i + 1));
                            continue;
                        }

                        Review review = Review.builder()
                                .name(firstName.trim() + " " + lastName.trim())
                                .rating(5)
                                .text(comments.trim())
                                .published(true)
                                .build();

                        reviewRepository.save(review);
                        imported++;
                    } catch (Exception e) {
                        skipped++;
                        errors.add(String.format("Row %d: %s", i + 1, e.getMessage()));
                    }
                }
            }

            span.setAttribute("imported.count", imported);
            span.setAttribute("skipped.count", skipped);

            return new ReviewDTOs.ImportResult(imported, skipped, errors);
        } catch (Exception e) {
            log.error("Failed to import Excel file", e);
            throw new RuntimeException("Failed to import Excel: " + e.getMessage());
        } finally {
            span.end();
        }
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return "";
        }

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                return String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return "";
        }
    }

    private ReviewDTOs.ReviewResponse toResponse(Review review) {
        return ReviewDTOs.ReviewResponse.builder()
                .id(review.getId())
                .name(review.getName().split(" ")[0])
                .rating(review.getRating())
                .text(review.getText())
                .date(formatDate(review.getCreatedAt()))
                .createdAt(review.getCreatedAt())
                .source(review.getSource() != null ? review.getSource().name() : "LOCAL")
                .googleReviewId(review.getGoogleReviewId())
                .authorUrl(review.getAuthorUrl())
                .authorPhotoUrl(review.getAuthorPhotoUrl())
                .reply(review.getReply())
                .build();
    }

    private String formatDate(LocalDateTime dateTime) {
        return dateTime.format(DateTimeFormatter.ofPattern("MMM dd, yyyy"));
    }

    @Override
    @Transactional
    public int syncGoogleReviews() {
        Span span = tracer.spanBuilder("review.syncGoogle").startSpan();
        try {
            log.info("Starting Google Reviews sync...");
            List<Review> googleReviews = googleBusinessProfileService.fetchBusinessReviews();

            int newReviewsCount = 0;
            for (Review review : googleReviews) {
                if (!reviewRepository.existsByGoogleReviewId(review.getGoogleReviewId())) {
                    reviewRepository.save(review);
                    newReviewsCount++;
                }
            }

            log.info("Finished Google Reviews sync. Imported {} new reviews.", newReviewsCount);
            span.setAttribute("synced.count", newReviewsCount);
            return newReviewsCount;
        } finally {
            span.end();
        }
    }

}
