package com.peakkineticspt.security;

import com.auth0.jwk.Jwk;
import com.auth0.jwk.JwkProvider;
import com.auth0.jwk.JwkProviderBuilder;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.security.interfaces.RSAPublicKey;
import java.util.Collections;
import java.util.concurrent.TimeUnit;

/**
 * Validates Cloudflare Access JWTs presented as Cf-Access-Jwt-Assertion on
 * /admin/** and /api/admin/**. If valid, sets a Spring Security authentication
 * with the email claim as principal and ROLE_ADMIN authority.
 *
 * Disabled when cloudflare.access.team-domain is blank — useful in dev/tests.
 */
@Slf4j
@Component
public class CloudflareAccessFilter extends OncePerRequestFilter {

    static final String HEADER = "Cf-Access-Jwt-Assertion";

    @Value("${cloudflare.access.team-domain:}")
    private String teamDomain;

    @Value("${cloudflare.access.audience:}")
    private String audience;

    private volatile JwkProvider jwks;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if (teamDomain == null || teamDomain.isBlank()) return true;
        String path = request.getRequestURI();
        // App-level auth bootstrap (login, register, password reset, /me)
        // is reachable without CF Access so the JWT flow can establish a
        // session. Other /api/admin/** endpoints still require CF Access.
        if (path.startsWith("/api/admin/auth/")) return true;
        return !(path.startsWith("/admin") || path.startsWith("/api/admin"));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String token = request.getHeader(HEADER);
        if (token == null || token.isBlank()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"missing Cloudflare Access assertion\"}");
            response.setContentType("application/json");
            return;
        }
        try {
            DecodedJWT decoded = verify(token);
            String email = decoded.getClaim("email").asString();
            CfAccessAuthentication auth = new CfAccessAuthentication(email);
            auth.setAuthenticated(true);
            SecurityContextHolder.getContext().setAuthentication(auth);
            chain.doFilter(request, response);
        } catch (Exception e) {
            log.warn("Cloudflare Access JWT rejected: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"invalid Cloudflare Access assertion\"}");
        }
    }

    private DecodedJWT verify(String token) throws Exception {
        DecodedJWT pre = JWT.decode(token);
        Jwk jwk = jwks().get(pre.getKeyId());
        Algorithm alg = Algorithm.RSA256((RSAPublicKey) jwk.getPublicKey(), null);
        try {
            return JWT.require(alg)
                    .withIssuer(teamDomain)
                    .withAudience(audience)
                    .acceptLeeway(30)
                    .build()
                    .verify(token);
        } catch (JWTVerificationException e) {
            throw new SecurityException("JWT verification failed", e);
        }
    }

    private JwkProvider jwks() throws MalformedURLException {
        if (jwks == null) {
            synchronized (this) {
                if (jwks == null) {
                    URL url = new URL(teamDomain.replaceAll("/$", "") + "/cdn-cgi/access/certs");
                    jwks = new JwkProviderBuilder(url)
                            .cached(10, 12, TimeUnit.HOURS)
                            .rateLimited(10, 1, TimeUnit.MINUTES)
                            .build();
                }
            }
        }
        return jwks;
    }

    static class CfAccessAuthentication extends AbstractAuthenticationToken {
        private final String email;

        CfAccessAuthentication(String email) {
            super(Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")));
            this.email = email;
        }

        @Override
        public Object getCredentials() { return ""; }

        @Override
        public Object getPrincipal() { return email; }

        @Override
        public String getName() { return email; }
    }
}
