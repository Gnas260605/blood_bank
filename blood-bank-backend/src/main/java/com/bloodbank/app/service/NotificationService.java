package com.bloodbank.app.service;

import com.bloodbank.app.entity.User;

public interface NotificationService {
    void sendVerificationEmail(User user, String token);
}
