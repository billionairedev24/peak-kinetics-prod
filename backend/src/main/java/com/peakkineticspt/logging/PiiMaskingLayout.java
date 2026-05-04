package com.peakkineticspt.logging;

import ch.qos.logback.classic.PatternLayout;
import ch.qos.logback.classic.spi.ILoggingEvent;

import java.util.regex.Pattern;

public class PiiMaskingLayout extends PatternLayout {

    private static final Pattern EMAIL = Pattern.compile(
            "([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]*(@[A-Za-z0-9.-]+\\.[A-Za-z]{2,})");
    private static final Pattern PHONE = Pattern.compile(
            "(?<!\\d)(\\+?1?[\\s-.]?)\\(?\\d{3}\\)?[\\s-.]?\\d{3}[\\s-.]?(\\d{4})(?!\\d)");
    private static final Pattern SSN = Pattern.compile(
            "(?<!\\d)\\d{3}-\\d{2}-\\d{4}(?!\\d)");
    private static final Pattern JWT = Pattern.compile(
            "eyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+");
    private static final Pattern BEARER = Pattern.compile(
            "(?i)bearer\\s+[A-Za-z0-9._~+/=-]+");

    @Override
    public String doLayout(ILoggingEvent event) {
        String rendered = super.doLayout(event);
        return mask(rendered);
    }

    static String mask(String s) {
        if (s == null || s.isEmpty()) return s;
        String out = EMAIL.matcher(s).replaceAll("$1***$2");
        out = PHONE.matcher(out).replaceAll("$1***-***-$2");
        out = SSN.matcher(out).replaceAll("***-**-****");
        out = JWT.matcher(out).replaceAll("<jwt-redacted>");
        out = BEARER.matcher(out).replaceAll("Bearer <redacted>");
        return out;
    }
}
