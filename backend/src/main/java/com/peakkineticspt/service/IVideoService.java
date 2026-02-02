package com.peakkineticspt.service;

import com.peakkineticspt.dto.VideoDTOs;
import java.util.List;

public interface IVideoService {
    VideoDTOs.VideoResponse createVideo(VideoDTOs.VideoRequest request);

    VideoDTOs.VideoResponse updateVideo(Long id, VideoDTOs.VideoRequest request);

    void deleteVideo(Long id);

    VideoDTOs.VideoResponse getVideoById(Long id);

    List<VideoDTOs.VideoResponse> getAllVideos();

    List<VideoDTOs.VideoResponse> getVideosByCategory(String category);
}
