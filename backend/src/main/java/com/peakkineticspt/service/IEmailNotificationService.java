package com.peakkineticspt.service;

import jakarta.servlet.http.HttpServletRequest;

public interface IEmailNotificationService {

    void sendWelcomeEmail(String toEmail, String name);

    void sendPasswordResetEmail(String toEmail, String resetToken, HttpServletRequest httpServletRequest);

    void sendPasswordChangedEmail(String toEmail, String name);

    void sendReviewRequestEmail(String toEmail, String clientName, HttpServletRequest httpServletRequest);

    void sendReferralRequestEmail(String toEmail, String clientName, HttpServletRequest httpServletRequest);
}
