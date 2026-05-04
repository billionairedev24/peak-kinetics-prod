package com.peakkineticspt.service.impl;

import com.peakkineticspt.service.ISmsNotificationService;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.Tracer;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "twilio.enabled", havingValue = "true")
@RequiredArgsConstructor
@Slf4j
public class SmsService implements ISmsNotificationService {

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.phone-number}")
    private String fromNumber;

    private final Tracer tracer;

    @PostConstruct
    void initTwilio() {
        Twilio.init(accountSid, authToken);
        log.info("Twilio SMS enabled; from={}", fromNumber);
    }

    @Override
    public void sendReviewRequestSms(String toPhone, String clientName) {
        String body = String.format(
                "Hi %s! We'd love your feedback on your Peak Kinetics experience. Leave a review: https://peakkineticspt.com/review",
                clientName);
        sendInternalSms(toPhone, body, "sms.sendReviewRequest");
    }

    @Override
    public void sendReferralRequestSms(String toPhone, String clientName) {
        String body = String.format(
                "Hi %s! If you know anyone who could benefit from Peak Kinetics, we'd appreciate your referral: https://peakkineticspt.com/referral",
                clientName);
        sendInternalSms(toPhone, body, "sms.sendReferralRequest");
    }

    private void sendInternalSms(String toPhone, String body, String spanName) {
        Span span = tracer.spanBuilder(spanName).startSpan();
        String maskedTo = maskPhone(toPhone);
        try {
            Message message = Message.creator(
                    new PhoneNumber(toE164(toPhone)),
                    new PhoneNumber(fromNumber),
                    body).create();

            log.info("SMS sent to {} sid={}", maskedTo, message.getSid());
            span.setAttribute("sms.recipient.masked", maskedTo);
            span.setAttribute("sms.status", "SUBMITTED");
            span.setAttribute("sms.sid", message.getSid());
        } catch (Exception e) {
            log.error("SMS failed to {}: {}", maskedTo, e.getMessage());
            span.setAttribute("sms.status", "FAILED");
            throw new RuntimeException("Failed to send SMS", e);
        } finally {
            span.end();
        }
    }

    static String toE164(String phone) {
        if (phone == null) return "";
        String digits = phone.replaceAll("\\D", "");
        if (digits.length() == 10) digits = "1" + digits;
        return "+" + digits;
    }

    static String maskPhone(String phone) {
        if (phone == null) return "***";
        String digits = phone.replaceAll("\\D", "");
        if (digits.length() < 4) return "***";
        return "***-***-" + digits.substring(digits.length() - 4);
    }
}
