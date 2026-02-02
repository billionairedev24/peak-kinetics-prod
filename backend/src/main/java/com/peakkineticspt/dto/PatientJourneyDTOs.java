package com.peakkineticspt.dto;

import lombok.*;
import java.time.LocalDateTime;

public class PatientJourneyDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PatientJourneyResponse {
        private Long id;
        private Long patientId;
        private String patientName;
        private String currentPhase;
        private Integer progressPercentage;
        private String description;
        private String nextMilestone;
        private LocalDateTime nextMilestoneDate;
        private LocalDateTime updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateJourneyRequest {
        private String currentPhase;
        private Integer progressPercentage;
        private String description;
        private String nextMilestone;
        private LocalDateTime nextMilestoneDate;
    }
}
