package com.peakkineticspt.logging;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PiiMaskingLayoutTest {

    @Test
    void emailIsMasked_keepingFirstCharAndDomain() {
        String out = PiiMaskingLayout.mask("Contacting alice.smith@example.com about the issue");
        assertThat(out).contains("a***@example.com");
        assertThat(out).doesNotContain("alice.smith@");
    }

    @Test
    void multipleEmailsInOneLine_allMasked() {
        String out = PiiMaskingLayout.mask("From bob@a.io to charlie@b.net");
        assertThat(out).contains("@a.io").contains("@b.net");
        assertThat(out).doesNotContain("bob@").doesNotContain("charlie@");
    }

    @Test
    void emailWithPlusTag_isMasked() {
        String out = PiiMaskingLayout.mask("user+tag@gmail.com");
        assertThat(out).contains("@gmail.com");
        assertThat(out).doesNotContain("user+tag@");
    }

    @Test
    void usPhoneNumber10Digits_masked() {
        String out = PiiMaskingLayout.mask("Call me at 555-123-4567 today");
        assertThat(out).contains("***-***-4567");
        assertThat(out).doesNotContain("555-123-4567");
    }

    @Test
    void usPhoneWithCountryCode_masked() {
        String out = PiiMaskingLayout.mask("phone +1 (555) 123-4567");
        assertThat(out).doesNotContain("123-4567");
    }

    @Test
    void phoneWithDots_masked() {
        String out = PiiMaskingLayout.mask("contact 555.123.4567");
        assertThat(out).doesNotContain("555.123.4567");
    }

    @Test
    void ssn_masked() {
        String out = PiiMaskingLayout.mask("SSN 123-45-6789 on file");
        assertThat(out).contains("***-**-****");
        assertThat(out).doesNotContain("123-45-6789");
    }

    @Test
    void jwt_redacted() {
        String token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyIn0.signaturepart";
        String out = PiiMaskingLayout.mask("Authorization token=" + token);
        assertThat(out).contains("<jwt-redacted>");
        assertThat(out).doesNotContain("signaturepart");
    }

    @Test
    void bearerToken_redacted() {
        String out = PiiMaskingLayout.mask("Authorization: Bearer abc123_xyz-789");
        assertThat(out).contains("Bearer <redacted>");
        assertThat(out).doesNotContain("abc123_xyz-789");
    }

    @Test
    void plainTextWithoutPii_unchanged() {
        String input = "User logged in successfully request_id=42 status=200";
        assertThat(PiiMaskingLayout.mask(input)).isEqualTo(input);
    }

    @Test
    void nullAndEmpty_handled() {
        assertThat(PiiMaskingLayout.mask(null)).isNull();
        assertThat(PiiMaskingLayout.mask("")).isEmpty();
    }

    @Test
    void maskingIsIdempotent_noDoubleMasking() {
        String once = PiiMaskingLayout.mask("alice@example.com phone 555-123-4567");
        String twice = PiiMaskingLayout.mask(once);
        assertThat(twice).isEqualTo(once);
    }

    @Test
    void shortDigitSequence_notMistakenForPhone() {
        // an order ID like "Order 12345 for product 67890" should not match phone regex
        String out = PiiMaskingLayout.mask("Order 12345 for product 67890");
        assertThat(out).contains("12345").contains("67890");
    }
}
