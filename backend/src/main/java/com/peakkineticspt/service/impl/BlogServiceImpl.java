package com.peakkineticspt.service.impl;


import com.peakkineticspt.dto.BlogDTOs;
import com.peakkineticspt.entity.BlogPost;
import com.peakkineticspt.entity.User;
import com.peakkineticspt.repository.BlogPostRepository;
import com.peakkineticspt.repository.UserRepository;
import com.peakkineticspt.service.IBlogService;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.Tracer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BlogServiceImpl implements IBlogService {

    private final BlogPostRepository blogRepository;
    private final UserRepository userRepository;
    private final Tracer tracer;

    @Value("${storage.upload-dir}")
    private String uploadDir;


    @Override
    public Page<BlogDTOs.BlogResponse> getAllPosts(String status, String slug, Integer limit, Integer offset, String tags) {
        Span span = tracer.spanBuilder("blog.getAllPosts").startSpan();
        try {
            PageRequest pageRequest = PageRequest.of(
                    offset != null ? offset : 0,
                    limit != null ? limit : 10
            );

            Page<BlogPost> posts;

            if (slug != null && !slug.isBlank()) {
                BlogPost post = blogRepository.findBySlug(slug)
                        .orElseThrow(() -> new RuntimeException("Blog post not found"));
                return Page.empty();
            } else if (tags != null && !tags.isBlank()) {
                List<String> tagList = Arrays.asList(tags.split(","));
                posts = blogRepository.findByTagsIn(tagList, pageRequest);
            } else if (status != null && !"all".equalsIgnoreCase(status)) {
                posts = blogRepository.findByStatus(status, pageRequest);
            } else {
                posts = blogRepository.findAll(pageRequest);
            }

            return posts.map(this::toResponse);
        } finally {
            span.end();
        }
    }

    @Override
    public BlogDTOs.BlogResponse getPostById(long id) {
        Span span = tracer.spanBuilder("blog.getById").startSpan();
        try {
            BlogPost post = blogRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Blog post not found"));
            return toResponse(post);
        } finally {
            span.end();
        }
    }

    @Override
    public BlogDTOs.BlogResponse getPostBySlug(String slug) {
        Span span = tracer.spanBuilder("blog.getBySlug").startSpan();
        try {
            BlogPost post = blogRepository.findBySlug(slug)
                    .orElseThrow(() -> new RuntimeException("Blog post not found"));
            return toResponse(post);
        } finally {
            span.end();
        }
    }

    @Override
    @Transactional
    public BlogDTOs.BlogResponse createPost(BlogDTOs.CreateBlogRequest request, long authorId) {
        Span span = tracer.spanBuilder("blog.create").startSpan();
        try {
            if (blogRepository.existsBySlug(request.getSlug())) {
                throw new RuntimeException("Slug already exists");
            }

            User author = userRepository.findById(authorId)
                    .orElseThrow(() -> new RuntimeException("Author not found"));

            String excerpt = request.getExcerpt();
            if (excerpt == null || excerpt.isBlank()) {
                excerpt = generateExcerpt(request.getContent());
            }

            BlogPost post = BlogPost.builder()
                    .title(request.getTitle())
                    .slug(request.getSlug())
                    .excerpt(excerpt)
                    .content(request.getContent())
                    .featuredImage(request.getFeaturedImage())
                    .status(request.getStatus())
                    .tags(String.join(",", request.getTags()))
                    .author(author)
                    .publishedAt("published".equals(request.getStatus()) ? LocalDateTime.now() : null)
                    .build();

            post = blogRepository.save(post);

            span.setAttribute("blog.id", post.getId());
            span.setAttribute("blog.slug", post.getSlug());

            return toResponse(post);
        } finally {
            span.end();
        }
    }

    @Override
    @Transactional
    public BlogDTOs.BlogResponse updatePost(long id, BlogDTOs.CreateBlogRequest request) {
        Span span = tracer.spanBuilder("blog.update").startSpan();
        try {
            BlogPost post = blogRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Blog post not found"));

            if (!post.getSlug().equals(request.getSlug()) && blogRepository.existsBySlug(request.getSlug())) {
                throw new RuntimeException("Slug already exists");
            }

            post.setTitle(request.getTitle());
            post.setSlug(request.getSlug());
            post.setExcerpt(request.getExcerpt() != null ? request.getExcerpt() : generateExcerpt(request.getContent()));
            post.setContent(request.getContent());
            post.setFeaturedImage(request.getFeaturedImage());
            post.setStatus(request.getStatus());
            post.setTags(String.join(",",request.getTags()));

            if ("published".equals(request.getStatus()) && post.getPublishedAt() == null) {
                post.setPublishedAt(LocalDateTime.now());
            }

            post = blogRepository.save(post);

            span.setAttribute("blog.id", id);

            return toResponse(post);
        } finally {
            span.end();
        }
    }

    @Override
    @Transactional
    public void deletePost(long id) {
        Span span = tracer.spanBuilder("blog.delete").startSpan();
        try {
            if (!blogRepository.existsById(id)) {
                throw new RuntimeException("Blog post not found");
            }

            blogRepository.deleteById(id);
            span.setAttribute("blog.id", id);
        } finally {
            span.end();
        }
    }

    @Override
    public String uploadImage(MultipartFile file) {
        Span span = tracer.spanBuilder("blog.uploadImage").startSpan();
        try {
            // Validate file
            if (file.isEmpty()) {
                throw new RuntimeException("File is empty");
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new RuntimeException("File must be an image");
            }

            if (file.getSize() > 5 * 1024 * 1024) { // 5MB
                throw new RuntimeException("File size exceeds 5MB limit");
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";
            String filename = UUID.randomUUID() + extension;

            // Save file
            Path uploadPath = Paths.get(uploadDir, "blog", "images");
            Files.createDirectories(uploadPath);

            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);

            String url = ServletUriComponentsBuilder
                    .fromCurrentContextPath()
                    .path("/blog/images/")
                    .path(filename)
                    .toUriString();

            span.setAttribute("image.filename", filename);
            span.setAttribute("image.size", file.getSize());

            return url;
        } catch (IOException e) {
            log.error("Failed to upload image", e);
            throw new RuntimeException("Failed to upload image: " + e.getMessage());
        } finally {
            span.end();
        }
    }

    private String generateExcerpt(String content) {
        String plainText = content.replaceAll("#", "").replaceAll("\\*", "").trim();
        return plainText.length() > 300 ? plainText.substring(0, 297) + "..." : plainText;
    }

    private BlogDTOs.BlogResponse toResponse(BlogPost post) {
        return BlogDTOs.BlogResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .slug(post.getSlug())
                .excerpt(post.getExcerpt())
                .content(post.getContent())
                .featuredImage(post.getFeaturedImage())
                .status(post.getStatus())
                .tags(Arrays.stream(post.getTags().split(",")).toList())
                .author(post.getAuthor() != null ? BlogDTOs.AuthorInfo.builder()
                        .id(post.getAuthor().getId())
                        .name(post.getAuthor().getFullName())
                        .build() : null)
                .publishedAt(post.getPublishedAt())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

}