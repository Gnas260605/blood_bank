package com.bloodbank.app.service;

import com.bloodbank.app.dto.LoginRequest;
import com.bloodbank.app.dto.RegisterRequest;
import com.bloodbank.app.entity.User;

public interface UserService {
    User register(RegisterRequest request);
    void verifyEmail(String token);
    void resendVerification(String email);
    User login(LoginRequest request);
}
