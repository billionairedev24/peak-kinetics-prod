package com.peakkineticspt.service;

public interface ISmsNotificationService {
    void sendReviewRequestSms(String toPhone, String clientName);

    void sendReferralRequestSms(String toPhone, String clientName);
}
