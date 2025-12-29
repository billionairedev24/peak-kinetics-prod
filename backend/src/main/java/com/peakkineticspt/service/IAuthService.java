package com.peakkineticspt.service;

import com.peakkineticspt.dto.AuthDTOs;
import com.resend.core.exception.ResendException;
import jakarta.servlet.http.HttpServletRequest;

public interface IAuthService {

    AuthDTOs.RegisterResponse register(AuthDTOs.RegisterRequest request) throws ResendException;
    void forgotPassword(AuthDTOs.ForgotPasswordRequest request, HttpServletRequest httpServletRequest) throws ResendException;
    void resetPassword(AuthDTOs.ResetPasswordRequest request) throws ResendException;
    AuthDTOs.UserInfo getUserInfoByEmail(String email);
}
