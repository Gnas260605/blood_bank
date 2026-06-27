package com.bloodbank.app.controller;

import com.bloodbank.app.dto.AuthResponse;
import com.bloodbank.app.dto.LoginRequest;
import com.bloodbank.app.dto.RegisterRequest;
import com.bloodbank.app.dto.UserDto;
import com.bloodbank.app.entity.User;
import com.bloodbank.app.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> registerUser(@Valid @RequestBody RegisterRequest request) {
        try {
            userService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(
                    "SUCCESS",
                    "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản."
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new AuthResponse("ERROR", e.getMessage()));
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<AuthResponse> verifyEmail(@RequestParam String token) {
        try {
            userService.verifyEmail(token);
            return ResponseEntity.ok(new AuthResponse(
                    "SUCCESS",
                    "Tài khoản đã được xác thực thành công!"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new AuthResponse("ERROR", e.getMessage()));
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<AuthResponse> resendVerification(@RequestBody Map<String, String> payload) {
        try {
            String email = payload.get("email");
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new AuthResponse("ERROR", "Email không được để trống."));
            }
            userService.resendVerification(email);
            return ResponseEntity.ok(new AuthResponse(
                    "SUCCESS",
                    "Email xác thực đã được gửi lại thành công!"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new AuthResponse("ERROR", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginUser(@Valid @RequestBody LoginRequest request) {
        try {
            User user = userService.login(request);
            UserDto userDto = new UserDto(
                    user.getId(),
                    user.getFullName(),
                    user.getEmail(),
                    user.getPhone(),
                    user.getBloodGroup(),
                    user.getStatus(),
                    user.getCreatedAt()
            );
            return ResponseEntity.ok(new AuthResponse(
                    "SUCCESS",
                    "Đăng nhập thành công!",
                    userDto
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new AuthResponse("ERROR", e.getMessage()));
        }
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<AuthResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new AuthResponse(
                "VALIDATION_ERROR",
                "Thông tin nhập vào không hợp lệ.",
                errors
        ));
    }
}
