package com.peakkineticspt.service.impl;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class EmailServiceMaskTest {

    @Test
    void longLocal_keepsFirstAndLastChar() {
        assertThat(EmailService.maskEmail("alice.smith@example.com"))
                .isEqualTo("a***h@example.com");
    }

    @Test
    void shortLocal_doubleStar() {
        assertThat(EmailService.maskEmail("ab@example.com")).isEqualTo("**@example.com");
        assertThat(EmailService.maskEmail("a@example.com")).isEqualTo("**@example.com");
    }

    @Test
    void noAtSign_returnsTriplePlaceholder() {
        assertThat(EmailService.maskEmail("not-an-email")).isEqualTo("***");
    }

    @Test
    void null_returnsTriplePlaceholder() {
        assertThat(EmailService.maskEmail(null)).isEqualTo("***");
    }

    @Test
    void plusTagInLocal_partOfMaskedSection() {
        // local part "user+tag" → first/last preserved
        assertThat(EmailService.maskEmail("user+tag@gmail.com"))
                .isEqualTo("u***g@gmail.com");
    }

    @Test
    void domainPreservedExactly() {
        assertThat(EmailService.maskEmail("a.b@sub.example.co.uk"))
                .endsWith("@sub.example.co.uk");
    }
}
