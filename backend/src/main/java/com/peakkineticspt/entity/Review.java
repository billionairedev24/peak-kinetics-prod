package com.peakkineticspt.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private Integer rating;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Builder.Default
    @Column(nullable = false)
    private Boolean published = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ReviewSource source = ReviewSource.LOCAL;

    @Column(unique = true)
    private String googleReviewId;

    @Column(columnDefinition = "TEXT")
    private String authorUrl;

    @Column(columnDefinition = "TEXT")
    private String authorPhotoUrl;

    @Column(columnDefinition = "TEXT")
    private String reply;

    public boolean isGoogleReview() {
        return ReviewSource.GOOGLE.equals(this.source);
    }
}
