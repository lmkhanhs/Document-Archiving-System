package com.datn.dms.configuations;

import java.io.IOException;

import org.springframework.stereotype.Component;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

import com.datn.dms.dtos.ApiResponse;
import com.datn.dms.exception.ErrorCode;
import com.fasterxml.jackson.databind.ObjectMapper;


import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException authException) throws IOException, ServletException {
        ErrorCode errorCode = ErrorCode.AUTHENTICATION_EXCEPTION;
        ApiResponse<Void> errorResponse = ApiResponse.<Void>builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();
        
        ObjectMapper objectMapper = new ObjectMapper();
        String responseBody = objectMapper.writeValueAsString(errorResponse);
        response.setContentType("application/json");
        response.setStatus(errorCode.getHttpStatus().value());
        response.getWriter().write(responseBody);
        response.flushBuffer();
    }
}
