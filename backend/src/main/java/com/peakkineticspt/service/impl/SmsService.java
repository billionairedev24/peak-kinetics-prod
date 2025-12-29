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
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService implements ISmsNotificationService {

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.phone-number}")
    private String twilioPhoneNumber;

    private final Tracer tracer;

    @PostConstruct
    public void init() {
        Twilio.init(accountSid, authToken);
    }

    public void sendReviewRequestSms(String toPhone, String clientName) {
        Span span = tracer.spanBuilder("sms.sendReviewRequest").startSpan();
        try {
            String messageBody = String.format(
                    "Hi %s! We'd love your feedback on your Peak Kinetics experience. Leave a review: https://peakkinetics.com/review",
                    clientName
            );

            Message.creator(
                    new PhoneNumber(toPhone),
                    new PhoneNumber(twilioPhoneNumber),
                    messageBody
            ).create();

            log.info("SMS sent successfully to: {}", toPhone);
            span.setAttribute("sms.recipient", toPhone);
        } catch (Exception e) {
            log.error("Failed to send SMS to: {}", toPhone, e);
            throw new RuntimeException("Failed to send SMS", e);
        } finally {
            span.end();
        }
    }
}