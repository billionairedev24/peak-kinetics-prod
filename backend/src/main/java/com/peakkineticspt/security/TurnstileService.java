package com.peakkineticspt.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Server-side verification of Cloudflare Turnstile tokens. If the secret-key
 * is not configured, verification is disabled (returns true) so dev/test still
 * works without provisioning Cloudflare resources.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class TurnstileService {

    private static final String SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

    @Value("${cloudflare.turnstile.secret-key:}")
    private String secretKey;

    private final RestClient restClient;

    public boolean verify(String token, String remoteIp) {
        if (secretKey == null || secretKey.isBlank()) {
            return true;
        }
        if (token == null || token.isBlank()) {
            return false;
        }
        try {
            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("secret", secretKey);
            form.add("response", token);
            if (remoteIp != null && !remoteIp.isBlank()) form.add("remoteip", remoteIp);

            @SuppressWarnings("unchecked")
            Map<String, Object> result = restClient.post()
                    .uri(SITEVERIFY)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(Map.class);

            boolean ok = result != null && Boolean.TRUE.equals(result.get("success"));
            if (!ok) {
                log.warn("Turnstile verification failed: {}", result);
            }
            return ok;
        } catch (Exception e) {
            log.error("Turnstile verification error", e);
            return false;
        }
    }
}
