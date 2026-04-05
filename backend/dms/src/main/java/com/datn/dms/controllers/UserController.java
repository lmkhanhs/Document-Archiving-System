package com.datn.dms.controllers;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.datn.dms.dtos.ApiResponse;
import com.datn.dms.dtos.users.request.CreateUserRequest;
import com.datn.dms.dtos.users.response.CreateUserResponse;
import com.datn.dms.dtos.users.response.InfoUserResponse;
import com.datn.dms.services.UserService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;



@RestController
@RequestMapping("${app.prefix}/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)    
public class UserController {
    UserService userService; 
    @PostMapping("")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CreateUserResponse> createUser(@RequestBody CreateUserRequest user) {
        return ApiResponse.<CreateUserResponse>builder()
                .code(201)
                .message("User created successfully")
                .data(userService.createUser(user))
                .build(); 
    }
    @GetMapping("/info")
    public ApiResponse<InfoUserResponse> getInfoUser() {
        return ApiResponse.<InfoUserResponse>builder()
                .code(200)
                .message("User info retrieved successfully")
                .data(userService.getInfoUser())
                .build();
    }
}
