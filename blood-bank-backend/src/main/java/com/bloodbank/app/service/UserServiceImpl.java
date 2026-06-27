package com.bloodbank.app.service;

import com.bloodbank.app.dto.LoginRequest;
import com.bloodbank.app.dto.RegisterRequest;
import com.bloodbank.app.entity.User;
import com.bloodbank.app.entity.VerifyToken;
import com.bloodbank.app.repository.UserRepository;
import com.bloodbank.app.repository.VerifyTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VerifyTokenRepository tokenRepository;

    @Autowired
    private NotificationService notificationService;

    @Override
    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email này đã được đăng ký. Thử đăng nhập?");
        }

        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPasswordHash(BCrypt.hashpw(request.getPassword(), BCrypt.gensalt()));
        user.setBloodGroup(request.getBloodGroup());
        user.setStatus("PENDING");

        user = userRepository.save(user);

        // Generate verification token
        String tokenVal = UUID.randomUUID().toString();
        VerifyToken verifyToken = new VerifyToken();
        verifyToken.setId(UUID.randomUUID().toString());
        verifyToken.setUser(user);
        verifyToken.setToken(tokenVal);
        verifyToken.setExpiredAt(LocalDateTime.now().plusHours(24));
        verifyToken.setUsed(false);

        tokenRepository.save(verifyToken);

        // Send email
        notificationService.sendVerificationEmail(user, tokenVal);

        return user;
    }

    @Override
    public void verifyEmail(String token) {
        VerifyToken verifyToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Link xác thực không hợp lệ."));

        if (verifyToken.getUsed()) {
            throw new IllegalArgumentException("Link xác thực đã được sử dụng.");
        }

        if (verifyToken.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Link xác thực đã hết hạn. Vui lòng gửi lại.");
        }

        User user = verifyToken.getUser();
        user.setStatus("ACTIVE");
        userRepository.save(user);

        verifyToken.setUsed(true);
        tokenRepository.save(verifyToken);
    }

    @Override
    public void resendVerification(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản với email này."));

        if ("ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new IllegalArgumentException("Tài khoản của bạn đã được xác thực thành công.");
        }

        // Invalidate old tokens
        List<VerifyToken> oldTokens = tokenRepository.findByUserAndUsedFalse(user);
        for (VerifyToken oldToken : oldTokens) {
            oldToken.setUsed(true);
        }
        tokenRepository.saveAll(oldTokens);

        // Generate new token
        String tokenVal = UUID.randomUUID().toString();
        VerifyToken verifyToken = new VerifyToken();
        verifyToken.setId(UUID.randomUUID().toString());
        verifyToken.setUser(user);
        verifyToken.setToken(tokenVal);
        verifyToken.setExpiredAt(LocalDateTime.now().plusHours(24));
        verifyToken.setUsed(false);

        tokenRepository.save(verifyToken);

        // Send email
        notificationService.sendVerificationEmail(user, tokenVal);
    }

    @Override
    public User login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Sai email hoặc mật khẩu."));

        if ("PENDING".equalsIgnoreCase(user.getStatus())) {
            throw new IllegalArgumentException("Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email.");
        }

        if ("BANNED".equalsIgnoreCase(user.getStatus())) {
            throw new IllegalArgumentException("Tài khoản của bạn đã bị khóa.");
        }

        if (!BCrypt.checkpw(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Sai email hoặc mật khẩu.");
        }

        return user;
    }
}
