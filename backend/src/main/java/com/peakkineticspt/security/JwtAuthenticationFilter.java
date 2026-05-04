package com.peakkineticspt.security;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

/**
 * Reads a JWT from the auth_token HttpOnly cookie (or, as a fallback,
 * Authorization: Bearer header) and sets a Spring Security authentication
 * with the email as principal and the role as a granted authority.
 *
 * No-op if the token is missing or invalid — downstream
 * .authenticated() request matchers handle the 401.
 *
 * Skipped entirely if another filter (e.g. CloudflareAccessFilter or
 * DevAuthFilter) already authenticated the request, so the two filters
 * compose safely.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    public static final String COOKIE_NAME = "auth_token";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        Authentication existing = SecurityContextHolder.getContext().getAuthentication();
        if (existing != null && existing.isAuthenticated()
                && !"anonymousUser".equals(existing.getPrincipal())) {
            chain.doFilter(request, response);
            return;
        }

        String token = extractToken(request);
        if (token == null) {
            chain.doFilter(request, response);
            return;
        }

        try {
            DecodedJWT decoded = jwtService.verify(token);
            String email = decoded.getSubject();
            String role = decoded.getClaim("role").asString();
            List<SimpleGrantedAuthority> authorities = role != null && !role.isBlank()
                    ? Collections.singletonList(new SimpleGrantedAuthority(
                            "ROLE_" + role.replaceAll("\\s+", "_").toUpperCase()))
                    : Collections.emptyList();
            UserDetails principal = User.withUsername(email)
                    .password("")
                    .authorities(authorities)
                    .build();
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(principal, "", authorities);
            SecurityContextHolder.getContext().setAuthentication(auth);
        } catch (JWTVerificationException e) {
            log.debug("JWT rejected: {}", e.getMessage());
        }

        chain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie c : cookies) {
                if (COOKIE_NAME.equals(c.getName())
                        && c.getValue() != null
                        && !c.getValue().isBlank()) {
                    return c.getValue();
                }
            }
        }
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith(BEARER_PREFIX)) {
            return header.substring(BEARER_PREFIX.length()).trim();
        }
        return null;
    }
}
