package com.peakkineticspt.service;

import com.peakkineticspt.entity.Review;

import java.util.List;

public interface IGoogleBusinessProfileService {
    List<Review> fetchBusinessReviews();
}
