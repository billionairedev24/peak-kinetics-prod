package com.peakkineticspt.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class VideoDTOs {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VideoRequest {
        @NotBlank(message = "Title is required")
        private String title;
        private String description;
        @NotBlank(message = "Video URL is required")
        private String videoUrl;
        private String thumbnailUrl;
        private String category;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VideoResponse {
        private Long id;
        private String title;
        private String description;
        private String videoUrl;
        private String thumbnailUrl;
        private String category;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
