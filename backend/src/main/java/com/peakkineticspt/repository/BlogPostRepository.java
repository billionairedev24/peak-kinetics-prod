package com.peakkineticspt.repository;

import com.peakkineticspt.entity.BlogPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {
    Optional<BlogPost> findBySlug(String slug);
    boolean existsBySlug(String slug);
    Page<BlogPost> findByStatus(String status, Pageable pageable);

    @Query("SELECT b FROM BlogPost b JOIN b.tags t WHERE t IN :tags")
    Page<BlogPost> findByTagsIn(@Param("tags") List<String> tags, Pageable pageable);
}
