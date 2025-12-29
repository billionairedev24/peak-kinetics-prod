package com.peakkineticspt.service.impl;

import com.peakkineticspt.service.IEmailNotificationService;
import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.Tracer;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class EmailService implements IEmailNotificationService {

    @Value("${resend.api.key}")
    private String apiKey;

    private final Tracer tracer;

    public void sendWelcomeEmail(String toEmail, String name) throws ResendException {
        Span span = tracer.spanBuilder("email.sendWelcome").startSpan();
        try {
            String html = buildWelcomeEmailTemplate(name);
            sendEmail(toEmail, "Welcome to Peak Kinetics", html);
            span.setAttribute("email.recipient", toEmail);
        } finally {
            span.end();
        }
    }

    public void sendPasswordResetEmail(String toEmail, String resetToken, HttpServletRequest httpServletRequest) throws ResendException {
        Span span = tracer.spanBuilder("email.sendPasswordReset").startSpan();
        try {
            String html = buildPasswordResetTemplate(resetToken, httpServletRequest);
            sendEmail(toEmail, "Reset Your Password - Peak Kinetics", html);
            span.setAttribute("email.recipient", toEmail);
        } finally {
            span.end();
        }
    }

    public void sendPasswordChangedEmail(String toEmail, String name) throws ResendException {
        Span span = tracer.spanBuilder("email.sendPasswordChanged").startSpan();
        try {
            String html = buildPasswordChangedTemplate(name);
            sendEmail(toEmail, "Password Changed Successfully", html);
            span.setAttribute("email.recipient", toEmail);
        } finally {
            span.end();
        }
    }

    public void sendReviewRequestEmail(String toEmail, String clientName, HttpServletRequest httpServletRequest) throws ResendException {
        Span span = tracer.spanBuilder("email.sendReviewRequest").startSpan();
        try {
            String html = buildReviewRequestTemplate(clientName, httpServletRequest);
            sendEmail(toEmail, "Share Your Experience - Peak Kinetics", html);
            span.setAttribute("email.recipient", toEmail);
        } finally {
            span.end();
        }
    }

    private void sendEmail(String toEmail, String subject, String html) throws ResendException {
        Resend resend = new Resend(apiKey);
        CreateEmailOptions params = CreateEmailOptions.builder()
                .from("PEAK KINETICS PT <noReply@peakkineticspt.net>")
                .to(toEmail)
                .replyTo("info@peakkineticspt.com")
                .subject(subject)
                .html(html)
                .build();
        resend.emails().send(params);
    }


    private String buildWelcomeEmailTemplate(String name) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #0066cc; color: white; padding: 20px; text-align: center; }
                    .content { padding: 30px; background: #f9f9f9; }
                    .button { display: inline-block; padding: 12px 30px; background: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to Peak Kinetics!</h1>
                    </div>
                    <div class="content">
                        <h2>Hello %s,</h2>
                        <p>Thank you for registering with Peak Kinetics! We're excited to have you as part of our admin team.</p>
                        <p>Your account has been successfully created. You can now log in to access the admin dashboard and manage the platform.</p>
                        <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>
                        <p>Best regards,<br>The Peak Kinetics Team</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 Peak Kinetics. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """, name);
    }

    private String buildPasswordResetTemplate(String resetToken, HttpServletRequest httpServletRequest) {
        String resetUrl = getBaseUrl(httpServletRequest) + "/admin/reset-password?token=" + resetToken;
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #0066cc; color: white; padding: 20px; text-align: center; }
                    .content { padding: 30px; background: #f9f9f9; }
                    .button { display: inline-block; padding: 12px 30px; background: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <h2>Reset Your Password</h2>
                        <p>We received a request to reset your password for your Peak Kinetics admin account.</p>
                        <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
                        <a href="%s" class="button">Reset Password</a>
                        <div class="warning">
                            <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                        </div>
                        <p>For security reasons, this link will expire in 1 hour.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 Peak Kinetics. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """, resetUrl);
    }

    private String buildPasswordChangedTemplate(String name) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #28a745; color: white; padding: 20px; text-align: center; }
                    .content { padding: 30px; background: #f9f9f9; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                    .alert { background: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Changed Successfully</h1>
                    </div>
                    <div class="content">
                        <h2>Hello %s,</h2>
                        <p>Your password has been successfully changed.</p>
                        <div class="alert">
                            <strong>Important:</strong> If you didn't make this change, please contact our support team immediately.
                        </div>
                        <p>Your account security is important to us. We recommend using a strong, unique password.</p>
                        <p>Best regards,<br>The Peak Kinetics Team</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 Peak Kinetics. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """, name);
    }

    private String buildReviewRequestTemplate(String clientName, HttpServletRequest httpServletRequest) {
        String reviewUrl = getBaseUrl(httpServletRequest) + "/review";
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #0066cc; color: white; padding: 20px; text-align: center; }
                    .content { padding: 30px; background: #f9f9f9; }
                    .button { display: inline-block; padding: 12px 30px; background: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                    .stars { font-size: 24px; color: #ffd700; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>We'd Love Your Feedback!</h1>
                    </div>
                    <div class="content">
                        <h2>Hello %s,</h2>
                        <p>Thank you for choosing Peak Kinetics for your physical therapy needs. We hope you had a great experience with us!</p>
                        <p>Your feedback helps us improve our services and helps others make informed decisions about their care.</p>
                        <p class="stars">⭐⭐⭐⭐⭐</p>
                        <a href="%s" class="button">Leave a Review</a>
                        <p>It only takes a minute and would mean the world to us!</p>
                        <p>Thank you for your time,<br>The Peak Kinetics Team</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 Peak Kinetics. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """, clientName, reviewUrl);
    }


    private String getBaseUrl(HttpServletRequest request) {
        String scheme = request.getScheme();        // http / https
        String serverName = request.getServerName(); // domain
        int serverPort = request.getServerPort();

        boolean isStandardPort =
                ("http".equals(scheme) && serverPort == 80) ||
                        ("https".equals(scheme) && serverPort == 443);

        return isStandardPort
                ? String.format("%s://%s", scheme, serverName)
                : String.format("%s://%s:%d", scheme, serverName, serverPort);
    }
}
