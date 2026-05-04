package com.peakkineticspt.controller;

import com.peakkineticspt.dto.AuthDTOs;
import com.peakkineticspt.entity.User;
import com.peakkineticspt.security.JwtAuthenticationFilter;
import com.peakkineticspt.security.JwtService;
import com.peakkineticspt.service.IAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/auth/")
public class AuthController {

    private final IAuthService authService;
    private final JwtService jwtService;

    /** Empty in dev (host-only cookie); set to .peakkineticspt.com in prod
     *  so api.peakkineticspt.com can issue a cookie usable across subdomains. */
    @Value("${auth.cookie.domain:}")
    private String cookieDomain;

    /** false in local-dev (HTTP); true in prod (HTTPS-only). */
    @Value("${auth.cookie.secure:true}")
    private boolean cookieSecure;

    /** Strict on same-registrable-domain setup (peakkineticspt.com ↔
     *  api.peakkineticspt.com); use Lax/None if frontend ever moves to a
     *  different registrable domain. */
    @Value("${auth.cookie.same-site:Strict}")
    private String cookieSameSite;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthDTOs.RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthDTOs.LoginRequest request) {
        Optional<User> userOpt = authService.login(request);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "error", "Invalid email or password"));
        }
        User user = userOpt.get();
        String token = jwtService.generate(user.getEmail(), user.getRole(), user.getId());
        ResponseCookie cookie = buildAuthCookie(token, jwtService.getExpirationSeconds());

        AuthDTOs.UserInfo userInfo = AuthDTOs.UserInfo.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getFullName())
                .role(user.getRole())
                .lastLogin(user.getLastLogin() != null
                        ? user.getLastLogin().format(DateTimeFormatter.ISO_DATE_TIME)
                        : null)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(AuthDTOs.LoginResponse.builder().user(userInfo).build());
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        ResponseCookie cleared = buildAuthCookie("", 0);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cleared.toString())
                .body(Map.of("success", true));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(
            @Valid @RequestBody AuthDTOs.ForgotPasswordRequest request, HttpServletRequest httpServletRequest) {
        authService.forgotPassword(request, httpServletRequest);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Password reset instructions sent to your email"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@Valid @RequestBody AuthDTOs.ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Password reset successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthDTOs.UserInfo> me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Object principal = authentication.getPrincipal();
        String email;
        if (principal instanceof UserDetails ud) {
            email = ud.getUsername();
        } else if (principal instanceof String s) {
            email = s;
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        AuthDTOs.UserInfo info = authService.getUserInfoByEmail(email);
        return info != null
                ? ResponseEntity.ok(info)
                : ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    private ResponseCookie buildAuthCookie(String value, long maxAgeSeconds) {
        ResponseCookie.ResponseCookieBuilder b = ResponseCookie.from(JwtAuthenticationFilter.COOKIE_NAME, value)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/")
                .maxAge(Duration.ofSeconds(maxAgeSeconds));
        if (cookieDomain != null && !cookieDomain.isBlank()) {
            b.domain(cookieDomain);
        }
        return b.build();
    }
}
