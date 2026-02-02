package com.peakkineticspt.service;

import com.resend.core.exception.ResendException;
import jakarta.servlet.http.HttpServletRequest;

public interface IEmailNotificationService {

    void sendWelcomeEmail(String toEmail, String name) throws ResendException;

    void sendPasswordResetEmail(String toEmail, String resetToken, HttpServletRequest httpServletRequest)
            throws ResendException;

    void sendPasswordChangedEmail(String toEmail, String name) throws ResendException;

    void sendReviewRequestEmail(String toEmail, String clientName, HttpServletRequest httpServletRequest)
            throws ResendException;

    void sendReferralRequestEmail(String toEmail, String clientName, HttpServletRequest httpServletRequest)
            throws ResendException;
}
