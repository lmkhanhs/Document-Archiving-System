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

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;



@RestController
@RequestMapping("${app.prefix}/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)    
public class UserController {
    UserService userService; 
   
    @GetMapping("/info")
    public ApiResponse<InfoUserResponse> getInfoUser() {
        return ApiResponse.<InfoUserResponse>builder()
                .code(200)
                .message("User info retrieved successfully")
                .data(userService.getInfoUser())
                .build();
    }

    
    @GetMapping("")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<List<InfoUserResponse>> getAllUsers(Pageable pageable) {
        return ApiResponse.<List<InfoUserResponse>>builder()
                .code(200)
                .message("Users retrieved successfully")
                .data(userService.getAllUsers(pageable))
                .build();
    }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<List<InfoUserResponse>> searchUsers(@RequestParam String keyword) {
        return ApiResponse.<List<InfoUserResponse>>builder()
                .code(200)
                .message("Users retrieved successfully")
                .data(userService.searchUsers(keyword))
                .build();
    }

    @GetMapping("/filter")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<List<InfoUserResponse>> filterUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status) {
        return ApiResponse.<List<InfoUserResponse>>builder()
                .code(200)
                .message("Users filtered successfully")
                .data(userService.filterUsers(role, status))
                .build();
    }
}
