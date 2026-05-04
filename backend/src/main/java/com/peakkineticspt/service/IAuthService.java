package com.peakkineticspt.service;

import com.peakkineticspt.dto.AuthDTOs;
import jakarta.servlet.http.HttpServletRequest;

public interface IAuthService {

    AuthDTOs.RegisterResponse register(AuthDTOs.RegisterRequest request);
    void forgotPassword(AuthDTOs.ForgotPasswordRequest request, HttpServletRequest httpServletRequest);
    void resetPassword(AuthDTOs.ResetPasswordRequest request);
    AuthDTOs.UserInfo getUserInfoByEmail(String email);
}
