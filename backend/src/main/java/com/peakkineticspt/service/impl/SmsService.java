package com.peakkineticspt.service.impl;

import com.peakkineticspt.service.ISmsNotificationService;
import com.vonage.client.VonageClient;
import com.vonage.client.sms.MessageStatus;
import com.vonage.client.sms.SmsSubmissionResponse;
import com.vonage.client.sms.messages.TextMessage;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.Tracer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService implements ISmsNotificationService {

    @Value("${vonage.from-number}")
    private String fromNumber;

    private final VonageClient vonageClient;
    private final Tracer tracer;

    @Override
    public void sendReviewRequestSms(String toPhone, String clientName) {
        String messageBody = String.format(
                "Hi %s! We'd love your feedback on your Peak Kinetics experience. Leave a review: https://peakkinetics.com/review",
                clientName);
        sendInternalSms(toPhone, messageBody, "sms.sendReviewRequest");
    }

    @Override
    public void sendReferralRequestSms(String toPhone, String clientName) {
        String messageBody = String.format(
                "Hi %s! Hope you're feeling great. If you know anyone who could benefit from Peak Kinetics, we'd appreciate your referral! Learn more: https://peakkinetics.com/referral",
                clientName);
        sendInternalSms(toPhone, messageBody, "sms.sendReferralRequest");
    }

    private void sendInternalSms(String toPhone, String messageBody, String spanName) {
        Span span = tracer.spanBuilder(spanName).startSpan();
        try {
            TextMessage message = new TextMessage(fromNumber, sanitizePhoneNumber(toPhone), messageBody);

            SmsSubmissionResponse response = vonageClient.getSmsClient().submitMessage(message);

            if (response.getMessages().get(0).getStatus() == MessageStatus.OK) {
                log.info("SMS sent successfully to: {}", toPhone);
                span.setAttribute("sms.recipient", toPhone);
                span.setAttribute("sms.status", "SUCCESS");
            } else {
                String errorText = response.getMessages().get(0).getErrorText();
                log.error("Failed to send SMS to {}: {}", toPhone, errorText);
                span.setAttribute("sms.status", "FAILED");
                span.setAttribute("sms.error", errorText);
                throw new RuntimeException("Failed to send SMS: " + errorText);
            }
        } catch (Exception e) {
            log.error("Exception while sending SMS to: {}", toPhone, e);
            throw new RuntimeException("Failed to send SMS", e);
        } finally {
            span.end();
        }
    }

    /**
     * Basic sanitization to ensure phone numbers are in E.164-ish format for Vonage
     */
    private String sanitizePhoneNumber(String phone) {
        if (phone == null)
            return "";
        // Remove everything except digits
        String digits = phone.replaceAll("\\D", "");
        // If it starts with 1 (US) and is 11 digits, it's already good
        // If it's 10 digits, it might need a country code prefix for some providers,
        // but Vonage usually prefers full international format.
        // For simplicity, we assume US if 10 digits (common for this app)
        if (digits.length() == 10) {
            return "1" + digits;
        }
        return digits;
    }
}