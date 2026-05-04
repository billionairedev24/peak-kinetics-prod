package com.peakkineticspt.service.impl;

import com.peakkineticspt.dto.AuthDTOs;
import com.peakkineticspt.entity.PasswordResetToken;
import com.peakkineticspt.entity.User;
import com.peakkineticspt.repository.PasswordResetTokenRepository;
import com.peakkineticspt.repository.UserRepository;
import com.peakkineticspt.service.IAuthService;
import com.peakkineticspt.service.IEmailNotificationService;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.Tracer;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements IAuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final IEmailNotificationService emailService;
    private final Tracer tracer;

    @Override
    @Transactional
    public AuthDTOs.RegisterResponse register(AuthDTOs.RegisterRequest request) {
        Span span = tracer.spanBuilder("auth.register").startSpan();
        try {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already exists");
            }

            User admin = User.builder()
                    .title(request.getTitle())
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .email(request.getEmail())
                    .passwordHash(passwordEncoder.encode(request.getPassword()))
                    .role("Administrator")
                    .build();

            admin = userRepository.save(admin);

            emailService.sendWelcomeEmail(admin.getEmail(), admin.getFullName());

            span.setAttribute("user.id", admin.getId());

            return new AuthDTOs.RegisterResponse(
                    true,
                    "Account created successfully"
            // new RegisterData(admin.getId(), admin.getEmail(), admin.getFullName())
            );
        } finally {
            span.end();
        }
    }

    @Override
    @Transactional
    public void forgotPassword(AuthDTOs.ForgotPasswordRequest request, HttpServletRequest httpServletRequest) {
        Span span = tracer.spanBuilder("auth.forgotPassword").startSpan();
        try {
            // Always return success for security (don't reveal if email exists)
            userRepository.findByEmail(request.getEmail()).ifPresent(admin -> {
                String token = UUID.randomUUID().toString();

                PasswordResetToken resetToken = PasswordResetToken.builder()
                        .token(token)
                        .user(admin)
                        .expiresAt(LocalDateTime.now().plusHours(1))
                        .used(false)
                        .build();

                tokenRepository.save(resetToken);
                emailService.sendPasswordResetEmail(admin.getEmail(), token, httpServletRequest);
            });

            span.setAttribute("email", request.getEmail());
        } finally {
            span.end();
        }
    }

    @Override
    @Transactional
    public void resetPassword(AuthDTOs.ResetPasswordRequest request) {
        Span span = tracer.spanBuilder("auth.resetPassword").startSpan();
        try {
            PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken())
                    .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

            if (resetToken.getUsed() || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Invalid or expired reset token");
            }

            User admin = resetToken.getUser();
            admin.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(admin);

            resetToken.setUsed(true);
            tokenRepository.save(resetToken);

            emailService.sendPasswordChangedEmail(admin.getEmail(), admin.getFullName());

            span.setAttribute("user.id", admin.getId());
        } finally {
            span.end();
        }
    }

    @Override
    public AuthDTOs.UserInfo getUserInfoByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(admin -> AuthDTOs.UserInfo.builder()
                        .id(admin.getId())
                        .name(admin.getFirstName() + " " + admin.getLastName())
                        .email(admin.getEmail())
                        .role(admin.getRole())
                        .lastLogin(LocalDateTime.now()
                                .format(DateTimeFormatter.ISO_DATE_TIME))
                        .build())
                .orElse(null);
    }

    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DateTimeFormatter.ISO_DATE_TIME) : null;
    }
}
