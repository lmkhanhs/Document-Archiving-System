package com.datn.dms.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    USER_EXISTED(1000, "user existed", HttpStatus.INTERNAL_SERVER_ERROR),
    USER_NOT_FOUND(1001, "user not found", HttpStatus.INTERNAL_SERVER_ERROR),
    USER_IS_LOCKED(1002, "Account locked", HttpStatus.FORBIDDEN),

    // Color
    COLOR_EXISTED(1003, "Color existed", HttpStatus.INTERNAL_SERVER_ERROR),
    COLOR_NOT_FOUND(1004, "Color not found", HttpStatus.INTERNAL_SERVER_ERROR),


    AUTHENTICATION_EXCEPTION(1005, "Authentication exception", HttpStatus.UNAUTHORIZED),
    INVALID_PASSWORD(1006, "Invalid password", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED_EXCEPTION(1007, "Unauthorized exception", HttpStatus.FORBIDDEN),
    JWT_EXCEPTION(1006, "jwt exception", HttpStatus.UNAUTHORIZED);
   
    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}