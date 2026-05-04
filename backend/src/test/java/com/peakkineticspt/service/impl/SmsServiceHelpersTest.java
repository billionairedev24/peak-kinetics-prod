package com.peakkineticspt.service.impl;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SmsServiceHelpersTest {

    // ---- toE164 ---------------------------------------------------------

    @Test
    void e164_tenDigits_prependsPlusOne() {
        assertThat(SmsService.toE164("5551234567")).isEqualTo("+15551234567");
    }

    @Test
    void e164_elevenDigitsLeadingOne_keepsAsIs() {
        assertThat(SmsService.toE164("15551234567")).isEqualTo("+15551234567");
    }

    @Test
    void e164_formattedInput_normalizes() {
        assertThat(SmsService.toE164("(555) 123-4567")).isEqualTo("+15551234567");
        assertThat(SmsService.toE164("555-123-4567")).isEqualTo("+15551234567");
        assertThat(SmsService.toE164("555.123.4567")).isEqualTo("+15551234567");
    }

    @Test
    void e164_internationalDigits_preserved() {
        assertThat(SmsService.toE164("447911123456")).isEqualTo("+447911123456");
    }

    @Test
    void e164_null_returnsEmpty() {
        assertThat(SmsService.toE164(null)).isEmpty();
    }

    // ---- maskPhone ------------------------------------------------------

    @Test
    void mask_tenDigits_keepsLast4() {
        assertThat(SmsService.maskPhone("5551234567")).isEqualTo("***-***-4567");
    }

    @Test
    void mask_formattedInput_keepsLast4() {
        assertThat(SmsService.maskPhone("(555) 123-4567")).isEqualTo("***-***-4567");
    }

    @Test
    void mask_null_returnsTriplePlaceholder() {
        assertThat(SmsService.maskPhone(null)).isEqualTo("***");
    }

    @Test
    void mask_tooShort_returnsTriplePlaceholder() {
        assertThat(SmsService.maskPhone("12")).isEqualTo("***");
    }
}
