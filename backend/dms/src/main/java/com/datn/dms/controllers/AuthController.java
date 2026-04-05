package com.datn.dms.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.datn.dms.dtos.auth.request.LoginRequest;
import com.datn.dms.dtos.auth.request.LogoutRequest;
import com.datn.dms.dtos.auth.request.RegisterRequest;
import com.datn.dms.dtos.auth.response.LoginResponse;
import com.datn.dms.dtos.auth.response.LogoutResponse;
import com.datn.dms.dtos.auth.response.RegisterResponse;
import com.datn.dms.services.AuthService;
import com.datn.dms.dtos.ApiResponse;

@RestController
@RequestMapping("${app.prefix}/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthController {
    AuthService authService;

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@RequestBody LoginRequest request) {
        return ApiResponse.<LoginResponse>builder()
                .code(200)
                .message("Login successfully")
                .data(authService.login(request))
                .build();
    }

    @PostMapping("/logout")
    public ApiResponse<LogoutResponse> logout(@RequestBody LogoutRequest logoutRequest) {
        return ApiResponse.<LogoutResponse>builder()
                .code(200)
                .message("Logout successfully!")
                .data(this.authService.handleLogout(logoutRequest))
                .build();
    }

    @PostMapping("/register")
    
    public ApiResponse<RegisterResponse> register(@RequestBody RegisterRequest request) {
        return ApiResponse.<RegisterResponse>builder()
                .code(201)         // Status mã HTTP CREATED
                .message("Register successfully")
                .data(authService.register(request))
                .build();
    }
}
