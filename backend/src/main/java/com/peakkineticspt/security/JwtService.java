package com.peakkineticspt.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;

/**
 * Issues and validates HS256 JWTs for the app's email+password login flow.
 * Distinct from CloudflareAccessFilter, which validates RS256 JWTs minted by
 * Cloudflare Access (different signing key, different issuer).
 */
@Service
public class JwtService {

    private static final String ISSUER = "peak-kinetics";

    private final Algorithm algorithm;
    private final JWTVerifier verifier;
    private final long expirationMs;

    public JwtService(@Value("${jwt.secret}") String secret,
                      @Value("${jwt.expiration:86400000}") long expirationMs) {
        if (secret == null || secret.length() < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET must be at least 32 characters; current length: "
                            + (secret == null ? 0 : secret.length()));
        }
        this.algorithm = Algorithm.HMAC256(secret);
        this.verifier = JWT.require(algorithm).withIssuer(ISSUER).acceptLeeway(30).build();
        this.expirationMs = expirationMs;
    }

    public String generate(String email, String role, long userId) {
        Instant now = Instant.now();
        return JWT.create()
                .withIssuer(ISSUER)
                .withSubject(email)
                .withClaim("uid", userId)
                .withClaim("role", role)
                .withIssuedAt(Date.from(now))
                .withExpiresAt(Date.from(now.plusMillis(expirationMs)))
                .sign(algorithm);
    }

    public DecodedJWT verify(String token) throws JWTVerificationException {
        return verifier.verify(token);
    }

    public long getExpirationSeconds() {
        return expirationMs / 1000L;
    }
}
