package com.bloodbank.app.service;

import com.bloodbank.app.entity.NotificationLog;
import com.bloodbank.app.entity.User;
import com.bloodbank.app.repository.NotificationLogRepository;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private NotificationLogRepository logRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void sendVerificationEmail(User user, String token) {
        String verificationUrl = frontendUrl + "/verify?token=" + token;
        String subject = "Xác thực tài khoản Blood Bank của bạn";
        String content = "<h3>Xin chào " + user.getFullName() + ",</h3>"
                + "<p>Cảm ơn bạn đã đăng ký tài khoản tại Blood Bank.</p>"
                + "<p>Vui lòng nhấn vào đường link dưới đây để xác thực tài khoản của bạn (hết hạn trong 24 giờ):</p>"
                + "<p><a href=\"" + verificationUrl + "\">" + verificationUrl + "</a></p>"
                + "<br/><p>Trân trọng,<br/>Đội ngũ Blood Bank</p>";

        System.out.println("=============================================================");
        System.out.println("GỬI EMAIL XÁC THỰC:");
        System.out.println("Gửi đến: " + user.getEmail());
        System.out.println("Đường dẫn xác thực: " + verificationUrl);
        System.out.println("=============================================================");

        NotificationLog log = new NotificationLog();
        log.setId(UUID.randomUUID().toString());
        log.setUser(user);
        log.setType("EMAIL_VERIFICATION");

        try {
            if (mailSender == null) {
                throw new IllegalStateException("JavaMailSender không được cấu hình. Gửi email giả lập thành công!");
            }
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");
            helper.setTo(user.getEmail());
            helper.setSubject(subject);
            helper.setText(content, true);
            mailSender.send(message);

            log.setStatus("SENT");
            logRepository.save(log);
        } catch (Exception e) {
            System.err.println("Lỗi gửi email: " + e.getMessage());
            log.setStatus("FAILED");
            log.setErrorMessage(e.getMessage());
            logRepository.save(log);
        }
    }
}
