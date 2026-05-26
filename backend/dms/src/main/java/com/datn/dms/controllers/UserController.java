package com.datn.dms.controllers;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

    @PutMapping("/{id}/roles")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<InfoUserResponse> updateRoles(
            @PathVariable Long id,
            @RequestBody List<String> roles) {
        return ApiResponse.<InfoUserResponse>builder()
                .code(200)
                .message("User roles updated successfully")
                .data(userService.updateRoles(id, roles))
                .build();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<InfoUserResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam boolean isActive) {
        return ApiResponse.<InfoUserResponse>builder()
                .code(200)
                .message("User status updated successfully")
                .data(userService.updateStatus(id, isActive))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ApiResponse.<Void>builder()
                .code(200)
                .message("User deleted successfully")
                .build();
    }
}
