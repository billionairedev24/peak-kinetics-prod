package com.peakkineticspt.service;

import com.peakkineticspt.dto.BlogDTOs;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

public interface IBlogService {
    Page<BlogDTOs.BlogResponse> getAllPosts(String status, String slug, Integer limit, Integer offset, String tags);
    BlogDTOs.BlogResponse getPostById(long id);
    BlogDTOs.BlogResponse getPostBySlug(String slug);
    BlogDTOs.BlogResponse createPost(BlogDTOs.CreateBlogRequest request, long authorId);
    BlogDTOs.BlogResponse updatePost(long id, BlogDTOs.CreateBlogRequest request);
    void deletePost(long id);
    String uploadImage(MultipartFile file);
}
