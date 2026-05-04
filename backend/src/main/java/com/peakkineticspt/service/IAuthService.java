package com.peakkineticspt.service;

import com.peakkineticspt.dto.AuthDTOs;
import com.peakkineticspt.entity.User;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Optional;

public interface IAuthService {

    AuthDTOs.RegisterResponse register(AuthDTOs.RegisterRequest request);

    /**
     * Verifies email + password, updates last_login on success.
     * Returns Optional.empty() for any auth failure (unknown email, bad
     * password) so callers can return a uniform 401 without leaking which
     * branch failed (timing/enumeration resistance).
     */
    Optional<User> login(AuthDTOs.LoginRequest request);

    void forgotPassword(AuthDTOs.ForgotPasswordRequest request, HttpServletRequest httpServletRequest);
    void resetPassword(AuthDTOs.ResetPasswordRequest request);
    AuthDTOs.UserInfo getUserInfoByEmail(String email);
}
