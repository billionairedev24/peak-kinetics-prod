package com.peakkineticspt.controller;

import com.peakkineticspt.dto.VideoDTOs;
import com.peakkineticspt.service.IVideoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
@Slf4j
public class VideoController {

    private final IVideoService videoService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createVideo(@Valid @RequestBody VideoDTOs.VideoRequest request) {
        log.info("Received request to create video: {}", request.getTitle());
        VideoDTOs.VideoResponse response = videoService.createVideo(request);
        log.info("Video created successfully with ID: {}", response.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "data", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateVideo(@PathVariable Long id,
            @Valid @RequestBody VideoDTOs.VideoRequest request) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", videoService.updateVideo(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteVideo(@PathVariable Long id) {
        videoService.deleteVideo(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Video deleted successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getVideoById(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", videoService.getVideoById(id)));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllVideos(@RequestParam(required = false) String category) {
        List<VideoDTOs.VideoResponse> videos;
        if (category != null && !category.isEmpty()) {
            videos = videoService.getVideosByCategory(category);
        } else {
            videos = videoService.getAllVideos();
        }
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", videos,
                "total", videos.size()));
    }
}
