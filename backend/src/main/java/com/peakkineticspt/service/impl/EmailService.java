package com.peakkineticspt.service.impl;

import com.peakkineticspt.exception.NotificationException;
import com.peakkineticspt.service.IEmailNotificationService;
import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.Tracer;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@RequiredArgsConstructor
@Service
public class EmailService implements IEmailNotificationService {

    @Value("${resend.api-key}")
    private String apiKey;

    @Value("${resend.from-address:PEAK KINETICS PT <noReply@peakkineticspt.net>}")
    private String fromAddress;

    @Value("${resend.reply-to:info@peakkineticspt.com}")
    private String replyTo;

    private final Tracer tracer;

    @Override
    public void sendWelcomeEmail(String toEmail, String name) {
        send(toEmail, "Welcome to Peak Kinetics", buildWelcome(name), "email.sendWelcome");
    }

    @Override
    public void sendPasswordResetEmail(String toEmail, String resetToken, HttpServletRequest req) {
        send(toEmail, "Reset Your Password - Peak Kinetics",
                buildPasswordReset(resetToken, req), "email.sendPasswordReset");
    }

    @Override
    public void sendPasswordChangedEmail(String toEmail, String name) {
        send(toEmail, "Password Changed Successfully",
                buildPasswordChanged(name), "email.sendPasswordChanged");
    }

    @Override
    public void sendReviewRequestEmail(String toEmail, String clientName, HttpServletRequest req) {
        send(toEmail, "Share Your Experience - Peak Kinetics",
                buildReviewRequest(clientName, req), "email.sendReviewRequest");
    }

    @Override
    public void sendReferralRequestEmail(String toEmail, String clientName, HttpServletRequest req) {
        send(toEmail, "We Appreciate Your Referral - Peak Kinetics",
                buildReferralRequest(clientName, req), "email.sendReferralRequest");
    }

    private void send(String toEmail, String subject, String html, String spanName) {
        Span span = tracer.spanBuilder(spanName).startSpan();
        String masked = maskEmail(toEmail);
        try {
            Resend resend = new Resend(apiKey);
            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from(fromAddress)
                    .to(toEmail)
                    .replyTo(replyTo)
                    .subject(subject)
                    .html(html)
                    .build();

            resend.emails().send(params);

            log.info("Email sent to {} subject=\"{}\"", masked, subject);
            span.setAttribute("email.recipient.masked", masked);
            span.setAttribute("email.status", "SENT");
        } catch (ResendException e) {
            log.error("Resend rejected email to {}: {}", masked, e.getMessage());
            span.setAttribute("email.status", "REJECTED");
            throw new NotificationException("Failed to send email via Resend", e);
        } finally {
            span.end();
        }
    }

    static String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "***";
        int at = email.indexOf('@');
        String local = email.substring(0, at);
        String domain = email.substring(at);
        String maskedLocal = local.length() <= 2
                ? "**"
                : local.charAt(0) + "***" + local.charAt(local.length() - 1);
        return maskedLocal + domain;
    }

    private String getBaseUrl(HttpServletRequest request) {
        String scheme = request.getScheme();
        String host = request.getServerName();
        int port = request.getServerPort();
        boolean standard = ("http".equals(scheme) && port == 80)
                || ("https".equals(scheme) && port == 443);
        return standard ? scheme + "://" + host : scheme + "://" + host + ":" + port;
    }

    private String buildWelcome(String name) {
        return wrap("Welcome to Peak Kinetics!",
                "<h2>Hello " + escape(name) + ",</h2>" +
                        "<p>Thank you for registering with Peak Kinetics! We're excited to have you as part of our admin team.</p>" +
                        "<p>Your account has been successfully created. You can now log in to access the admin dashboard and manage the platform.</p>" +
                        "<p>If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>" +
                        "<p>Best regards,<br>The Peak Kinetics Team</p>");
    }

    private String buildPasswordReset(String token, HttpServletRequest req) {
        String url = getBaseUrl(req) + "/admin/reset-password?token=" + token;
        return wrap("Password Reset Request",
                "<h2>Reset Your Password</h2>" +
                        "<p>We received a request to reset your password for your Peak Kinetics admin account.</p>" +
                        "<p>Click the button below to reset your password. This link will expire in 1 hour.</p>" +
                        "<p><a href=\"" + url + "\" class=\"button\">Reset Password</a></p>" +
                        "<div class=\"warning\"><strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</div>");
    }

    private String buildPasswordChanged(String name) {
        return wrap("Password Changed Successfully",
                "<h2>Hello " + escape(name) + ",</h2>" +
                        "<p>Your password has been successfully changed.</p>" +
                        "<div class=\"alert\"><strong>Important:</strong> If you didn't make this change, please contact our support team immediately.</div>" +
                        "<p>Best regards,<br>The Peak Kinetics Team</p>");
    }

    private String buildReviewRequest(String name, HttpServletRequest req) {
        String url = getBaseUrl(req) + "/review";
        return wrap("We'd Love Your Feedback!",
                "<h2>Hello " + escape(name) + ",</h2>" +
                        "<p>Thank you for choosing Peak Kinetics. We hope you had a great experience with us.</p>" +
                        "<p class=\"stars\">⭐⭐⭐⭐⭐</p>" +
                        "<p><a href=\"" + url + "\" class=\"button\">Leave a Review</a></p>" +
                        "<p>Thank you,<br>The Peak Kinetics Team</p>");
    }

    private String buildReferralRequest(String name, HttpServletRequest req) {
        String url = getBaseUrl(req) + "/referral";
        return wrap("Help Others Peak!",
                "<h2>Hello " + escape(name) + ",</h2>" +
                        "<p>If you have friends or family who could benefit from our services, we'd be honored by a referral.</p>" +
                        "<p><a href=\"" + url + "\" class=\"button\">Refer a Friend</a></p>" +
                        "<p>Thank you,<br>The Peak Kinetics Team</p>");
    }

    private String wrap(String headerTitle, String innerHtml) {
        return "<!DOCTYPE html><html><head><style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background: #0066cc; color: white; padding: 20px; text-align: center; }" +
                ".content { padding: 30px; background: #f9f9f9; }" +
                ".button { display: inline-block; padding: 12px 30px; background: #0066cc; color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0; }" +
                ".footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }" +
                ".warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }" +
                ".alert { background: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; margin: 20px 0; }" +
                ".stars { font-size: 24px; color: #ffd700; }" +
                "</style></head><body><div class=\"container\">" +
                "<div class=\"header\"><h1>" + headerTitle + "</h1></div>" +
                "<div class=\"content\">" + innerHtml + "</div>" +
                "<div class=\"footer\"><p>&copy; Peak Kinetics. All rights reserved.</p></div>" +
                "</div></body></html>";
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
