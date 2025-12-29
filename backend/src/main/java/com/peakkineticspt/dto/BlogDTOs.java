package com.peakkineticspt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

public class BlogDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateBlogRequest {
        @NotBlank(message = "Title is required")
        @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
        private String title;

        @NotBlank(message = "Slug is required")
        @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug must be lowercase with hyphens only")
        private String slug;

        @Size(max = 300, message = "Excerpt must not exceed 300 characters")
        private String excerpt;

        @NotBlank(message = "Content is required")
        @Size(min = 100, message = "Content must be at least 100 characters")
        private String content;

        @Pattern(regexp = "^https?://.*", message = "Featured image must be a valid URL")
        private String featuredImage;

        @NotBlank(message = "Status is required")
        @Pattern(regexp = "^(published|draft)$", message = "Status must be 'published' or 'draft'")
        private String status;

        @Size(max = 10, message = "Maximum 10 tags allowed")
        private List<@Size(min = 2, max = 50, message = "Each tag must be between 2 and 50 characters") String> tags;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BlogResponse {
        private long id;
        private String title;
        private String slug;
        private String excerpt;
        private String content;
        private String featuredImage;
        private String status;
        private List<String> tags;
        private AuthorInfo author;
        private LocalDateTime publishedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuthorInfo {
        private long id;
        private String name;
    }
}
