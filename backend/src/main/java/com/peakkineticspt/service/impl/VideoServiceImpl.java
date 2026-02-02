package com.peakkineticspt.service.impl;

import com.peakkineticspt.dto.VideoDTOs;
import com.peakkineticspt.entity.Video;
import com.peakkineticspt.exception.ResourceNotFoundException;
import com.peakkineticspt.repository.VideoRepository;
import com.peakkineticspt.service.IVideoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class VideoServiceImpl implements IVideoService {

    private final VideoRepository videoRepository;

    public VideoServiceImpl(VideoRepository videoRepository) {
        this.videoRepository = videoRepository;
    }

    @Override
    public VideoDTOs.VideoResponse createVideo(VideoDTOs.VideoRequest request) {
        Video video = Video.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .videoUrl(request.getVideoUrl())
                .thumbnailUrl(request.getThumbnailUrl())
                .category(request.getCategory())
                .build();

        Video savedVideo = videoRepository.save(video);
        return mapToResponse(savedVideo);
    }

    @Override
    public VideoDTOs.VideoResponse updateVideo(Long id, VideoDTOs.VideoRequest request) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Video not found with id: " + id));

        video.setTitle(request.getTitle());
        video.setDescription(request.getDescription());
        video.setVideoUrl(request.getVideoUrl());
        video.setThumbnailUrl(request.getThumbnailUrl());
        video.setCategory(request.getCategory());

        Video updatedVideo = videoRepository.save(video);
        return mapToResponse(updatedVideo);
    }

    @Override
    public void deleteVideo(Long id) {
        if (!videoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Video not found with id: " + id);
        }
        videoRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public VideoDTOs.VideoResponse getVideoById(Long id) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Video not found with id: " + id));
        return mapToResponse(video);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VideoDTOs.VideoResponse> getAllVideos() {
        return videoRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VideoDTOs.VideoResponse> getVideosByCategory(String category) {
        return videoRepository.findByCategory(category).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private VideoDTOs.VideoResponse mapToResponse(Video video) {
        return VideoDTOs.VideoResponse.builder()
                .id(video.getId())
                .title(video.getTitle())
                .description(video.getDescription())
                .videoUrl(video.getVideoUrl())
                .thumbnailUrl(video.getThumbnailUrl())
                .category(video.getCategory())
                .createdAt(video.getCreatedAt())
                .updatedAt(video.getUpdatedAt())
                .build();
    }
}
