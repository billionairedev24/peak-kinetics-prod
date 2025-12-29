package com.peakkineticspt.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

public class ReviewDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateReviewRequest {
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        @Pattern(regexp = "^[a-zA-Z\\s]+$", message = "Name must contain only letters and spaces")
        private String name;

        @NotNull(message = "Rating is required")
        @Min(value = 1, message = "Rating must be between 1 and 5")
        @Max(value = 5, message = "Rating must be between 1 and 5")
        private Integer rating;

        @NotBlank(message = "Review text is required")
        @Size(min = 20, max = 1000, message = "Review text must be between 20 and 1000 characters")
        private String text;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewResponse {
        private long id;
        private String name;
        private Integer rating;
        private String text;
        private String date;
        private LocalDateTime createdAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SendReviewRequestDTO {
        @NotBlank(message = "Client name is required")
        @Size(min = 2, max = 200, message = "Client name must be between 2 and 200 characters")
        private String name;

        @Email(message = "Invalid email format")
        private String email;


        @Pattern(regexp = "^\\+[1-9]\\d{1,14}$", message = "Phone must be in E.164 format")
        private String phone;

        @AssertTrue(message = "Either email or phone must be provided")
        private boolean isContactProvided() {
            return (email != null && !email.isBlank()) || (phone != null && !phone.isBlank());
        }
    }

    @Getter
    @AllArgsConstructor
    public static class ImportResult {
        private int imported;
        private int skipped;
        private List<String> errors;
    }
}

