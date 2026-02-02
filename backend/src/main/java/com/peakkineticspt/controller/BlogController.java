package com.peakkineticspt.controller;

import com.peakkineticspt.dto.BlogDTOs;
import com.peakkineticspt.service.IBlogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/blog")
public class BlogController {

    private final IBlogService blogService;

    public BlogController(IBlogService blogService) {
        this.blogService = blogService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllPosts(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String slug,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer offset,
            @RequestParam(required = false) String tags) {

        Page<BlogDTOs.BlogResponse> posts = blogService.getAllPosts(status, slug, limit, offset, tags);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", posts.getContent(),
                "total", posts.getTotalElements(),
                "page", posts.getNumber(),
                "pageSize", posts.getSize()));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<Map<String, Object>> getPost(@PathVariable long postId) {
        BlogDTOs.BlogResponse post = blogService.getPostById(postId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", post));
    }

    @PostMapping("/admin/{authorId}")
    public ResponseEntity<Map<String, Object>> createPost(@Valid @RequestBody BlogDTOs.CreateBlogRequest request,
            @PathVariable long authorId) {

        BlogDTOs.BlogResponse response = blogService.createPost(request, authorId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Blog post created successfully",
                "data", response));
    }

    @PutMapping("/admin/blog/{postId}")
    public ResponseEntity<Map<String, Object>> updatePost(
            @PathVariable long postId,
            @Valid @RequestBody BlogDTOs.CreateBlogRequest request) {
        BlogDTOs.BlogResponse response = blogService.updatePost(postId, request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Blog post updated successfully",
                "data", response));
    }

    @DeleteMapping("/admin/blog/{postId}")
    public ResponseEntity<Map<String, Object>> deletePost(@PathVariable long postId) {
        blogService.deletePost(postId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Blog post deleted successfully"));
    }

    @PostMapping("/admin/blog/upload")
    public ResponseEntity<Map<String, Object>> uploadImage(@RequestParam("image") MultipartFile file) {
        String url = blogService.uploadImage(file);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "url", url,
                "filename", Objects.requireNonNull(file.getOriginalFilename()),
                "size", file.getSize(),
                "contentType", Objects.requireNonNull(file.getContentType())));
    }
}
