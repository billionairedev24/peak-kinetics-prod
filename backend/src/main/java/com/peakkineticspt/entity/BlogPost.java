package com.peakkineticspt.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "blog_posts", indexes = {
        @Index(name = "idx_slug", columnList = "slug", unique = true),
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_published_at", columnList = "published_at")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlogPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
    @Column(nullable = false, length = 200)
    private String title;

    @NotBlank(message = "Slug is required")
    @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug must be URL-friendly (lowercase, hyphens only)")
    @Column(nullable = false, unique = true, length = 255)
    private String slug;

    @Size(max = 300, message = "Excerpt must not exceed 300 characters")
    @Column(columnDefinition = "TEXT")
    private String excerpt;

    @NotBlank(message = "Content is required")
    @Size(min = 100, message = "Content must be at least 100 characters")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "featured_image", length = 500)
    private String featuredImage;

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(published|draft)$", message = "Status must be 'published' or 'draft'")
    @Column(nullable = false, length = 20)
    private String status = "draft";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private User author;

    private String tags;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if ("published".equals(status) && publishedAt == null) {
            publishedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();

        if ("published".equals(status) && publishedAt == null) {
            publishedAt = LocalDateTime.now();
        }
    }
}
