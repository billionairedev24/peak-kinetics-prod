package com.peakkineticspt.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;

class RequestIdFilterTest {

    private final RequestIdFilter filter = new RequestIdFilter();

    @Test
    void incomingHeaderIsHonored_andEchoedBack() throws ServletException, IOException {
        MockHttpServletRequest req = new MockHttpServletRequest();
        MockHttpServletResponse resp = new MockHttpServletResponse();
        String supplied = UUID.randomUUID().toString();
        req.addHeader("X-Request-ID", supplied);

        AtomicReference<String> seen = new AtomicReference<>();
        FilterChain chain = (r, s) -> seen.set(MDC.get("requestId"));

        filter.doFilter(req, resp, chain);

        assertThat(seen.get()).isEqualTo(supplied);
        assertThat(resp.getHeader("X-Request-ID")).isEqualTo(supplied);
    }

    @Test
    void missingHeader_generatesUuid() throws ServletException, IOException {
        MockHttpServletRequest req = new MockHttpServletRequest();
        MockHttpServletResponse resp = new MockHttpServletResponse();

        AtomicReference<String> seen = new AtomicReference<>();
        FilterChain chain = (r, s) -> seen.set(MDC.get("requestId"));

        filter.doFilter(req, resp, chain);

        String generated = seen.get();
        assertThat(generated).isNotBlank();
        assertThat(UUID.fromString(generated)).isNotNull();
        assertThat(resp.getHeader("X-Request-ID")).isEqualTo(generated);
    }

    @Test
    void blankHeader_generatesUuid() throws ServletException, IOException {
        MockHttpServletRequest req = new MockHttpServletRequest();
        MockHttpServletResponse resp = new MockHttpServletResponse();
        req.addHeader("X-Request-ID", "   ");

        AtomicReference<String> seen = new AtomicReference<>();
        FilterChain chain = (r, s) -> seen.set(MDC.get("requestId"));

        filter.doFilter(req, resp, chain);

        assertThat(seen.get()).isNotBlank();
        UUID.fromString(seen.get());
    }

    @Test
    void oversizeHeader_isRejectedAndReplaced() throws ServletException, IOException {
        MockHttpServletRequest req = new MockHttpServletRequest();
        MockHttpServletResponse resp = new MockHttpServletResponse();
        String tooBig = "x".repeat(65);
        req.addHeader("X-Request-ID", tooBig);

        AtomicReference<String> seen = new AtomicReference<>();
        FilterChain chain = (r, s) -> seen.set(MDC.get("requestId"));

        filter.doFilter(req, resp, chain);

        assertThat(seen.get()).isNotEqualTo(tooBig);
        UUID.fromString(seen.get());
    }

    @Test
    void mdcIsClearedAfterRequest() throws ServletException, IOException {
        MDC.clear();
        MockHttpServletRequest req = new MockHttpServletRequest();
        MockHttpServletResponse resp = new MockHttpServletResponse();
        req.addHeader("X-Request-ID", "abc-123");

        FilterChain chain = (r, s) -> {};

        filter.doFilter(req, resp, chain);

        assertThat(MDC.get("requestId")).isNull();
    }

    @Test
    void mdcIsClearedEvenIfDownstreamThrows() throws ServletException, IOException {
        MDC.clear();
        MockHttpServletRequest req = new MockHttpServletRequest();
        MockHttpServletResponse resp = new MockHttpServletResponse();

        FilterChain chain = new ThrowingChain();

        try {
            filter.doFilter(req, resp, chain);
        } catch (IOException expected) {
            // intentional
        }

        assertThat(MDC.get("requestId")).isNull();
    }

    private static class ThrowingChain implements FilterChain {
        @Override
        public void doFilter(jakarta.servlet.ServletRequest request, jakarta.servlet.ServletResponse response)
                throws IOException {
            throw new IOException("downstream boom");
        }
    }
}
