package com.peakkineticspt.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Local-development auth bypass. Every request is treated as authenticated as
 * the configured email with ROLE_ADMIN. Bean only exists when
 * {@code dev.auto-auth.enabled=true} — so it can never accidentally activate
 * in prod where the property is unset.
 */
@Component
@ConditionalOnProperty(name = "dev.auto-auth.enabled", havingValue = "true")
public class DevAuthFilter extends OncePerRequestFilter {

    @Value("${dev.auto-auth.email:dev@localhost}")
    private String email;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            DevAuth auth = new DevAuth(email);
            auth.setAuthenticated(true);
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        chain.doFilter(request, response);
    }

    static class DevAuth extends AbstractAuthenticationToken {
        private final String email;

        DevAuth(String email) {
            super(List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
            this.email = email;
        }

        @Override public Object getCredentials() { return ""; }
        @Override public Object getPrincipal() { return email; }
        @Override public String getName() { return email; }
    }
}
