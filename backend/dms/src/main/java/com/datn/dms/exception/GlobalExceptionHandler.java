package com.datn.dms.exception;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.datn.dms.dtos.ApiResponse;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(RuntimeException.class)
    ResponseEntity<ApiResponse<String>> handleRuntimeException(RuntimeException ex) {
        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .message("Exception RuntimeErorr")
                .data(ex.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
    }

    @ExceptionHandler(AppException.class)
    ResponseEntity<ApiResponse<String>> handleAppException(AppException ex) {
        ErrorCode errorCode = ex.getErrorCode();
        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();
        return ResponseEntity.status(errorCode.getHttpStatus().value()).body(apiResponse);
    }
    @ExceptionHandler(AuthorizationDeniedException.class)
    ResponseEntity<ApiResponse<String>> handleAuthorizationDeniedException(AuthorizationDeniedException ex) {
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED_EXCEPTION;
        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .data("Unauthorized: bạn không có quyền truy cập tính năng này")
                .build();
        return ResponseEntity.status(errorCode.getHttpStatus().value()).body(apiResponse);
    }
    @ExceptionHandler(AuthenticationException.class)
    ResponseEntity<ApiResponse<String>> handleAuthenticationException(AuthenticationException ex) {
        ErrorCode errorCode = ErrorCode.AUTHENTICATION_EXCEPTION;
        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .data("Authentication: hãy đăng nhập đúng username && password! ")
                .build();
        return ResponseEntity.status(errorCode.getHttpStatus().value()).body(apiResponse);
    }

}