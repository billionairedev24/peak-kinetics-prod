package com.peakkineticspt.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "patient_journeys")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientJourney {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User patient;

    private String currentPhase; // e.g., "Mobility", "Strength", "Performance"
    private Integer progressPercentage;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String nextMilestone;
    private LocalDateTime nextMilestoneDate;

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
