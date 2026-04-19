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
    JWT_EXCEPTION(1006, "jwt exception", HttpStatus.UNAUTHORIZED),

    // Folder
    FOLDER_NOT_FOUND(1008, "Folder not found", HttpStatus.NOT_FOUND),
    FOLDER_EXISTED(1009, "Folder existed", HttpStatus.BAD_REQUEST),
    FOLDER_NAME_INVALID(1010, "Folder name is invalid", HttpStatus.BAD_REQUEST),

    // File
    FILE_EMPTY(1011, "File is empty", HttpStatus.BAD_REQUEST),
    FILE_STORE_FAILED(1012, "Cannot store file", HttpStatus.INTERNAL_SERVER_ERROR),
    FILE_NAME_INVALID(1013, "File name is invalid", HttpStatus.BAD_REQUEST),
    FILE_NOT_FOUND(1014, "File not found", HttpStatus.NOT_FOUND),
    FILE_PATH_INVALID(1015, "File path is invalid", HttpStatus.BAD_REQUEST);
   
    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}