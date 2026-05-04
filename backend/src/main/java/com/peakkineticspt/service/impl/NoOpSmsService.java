package com.peakkineticspt.service.impl;

import com.peakkineticspt.service.ISmsNotificationService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "twilio.enabled", havingValue = "false", matchIfMissing = true)
@Slf4j
public class NoOpSmsService implements ISmsNotificationService {

    @PostConstruct
    void announce() {
        log.info("Twilio SMS disabled (twilio.enabled=false); using no-op SMS service. No Twilio classes loaded.");
    }

    @Override
    public void sendReviewRequestSms(String toPhone, String clientName) {
        log.info("SMS skipped (Twilio disabled): review request to={} name={}", maskPhone(toPhone), clientName);
    }

    @Override
    public void sendReferralRequestSms(String toPhone, String clientName) {
        log.info("SMS skipped (Twilio disabled): referral request to={} name={}", maskPhone(toPhone), clientName);
    }

    static String maskPhone(String phone) {
        if (phone == null) return "***";
        String digits = phone.replaceAll("\\D", "");
        if (digits.length() < 4) return "***";
        return "***-***-" + digits.substring(digits.length() - 4);
    }
}
