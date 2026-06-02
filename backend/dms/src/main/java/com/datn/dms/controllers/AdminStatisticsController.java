package com.datn.dms.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.datn.dms.dtos.ApiResponse;
import com.datn.dms.dtos.statistics.response.DocumentTypeStatisticItemResponse;
import com.datn.dms.dtos.statistics.response.OverviewStatisticsResponse;
import com.datn.dms.services.AdminStatisticsService;

import java.util.List;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("${app.prefix}/admin/statistics")
public class AdminStatisticsController {

    AdminStatisticsService adminStatisticsService;

    @GetMapping("/overview")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<OverviewStatisticsResponse>> getOverviewStatistics() {
        OverviewStatisticsResponse response = adminStatisticsService.getOverviewStatistics();

        return ResponseEntity.ok(ApiResponse.<OverviewStatisticsResponse>builder()
                .code(200)
                .message("Get overview statistics successfully")
                .data(response)
                .build());
    }
    @GetMapping("/document-types")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<DocumentTypeStatisticItemResponse>>> getDocumentTypeStatistics() {
        List<DocumentTypeStatisticItemResponse> response = adminStatisticsService.getDocumentTypeStatistics();

        return ResponseEntity.ok(ApiResponse.<List<DocumentTypeStatisticItemResponse>>builder()
                .code(200)
                .message("Get document type statistics successfully")
                .data(response)
                .build());
    }

    @GetMapping("/top-active-users")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<com.datn.dms.dtos.statistics.response.TopActiveUserResponse>>> getTopActiveUsers() {
        List<com.datn.dms.dtos.statistics.response.TopActiveUserResponse> response = adminStatisticsService.getTopActiveUsers();

        return ResponseEntity.ok(ApiResponse.<List<com.datn.dms.dtos.statistics.response.TopActiveUserResponse>>builder()
                .code(200)
                .message("Get top active users successfully")
                .data(response)
                .build());
    }

    @GetMapping("/recent-activities")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<com.datn.dms.dtos.statistics.response.RecentActivityResponse>>> getRecentActivities() {
        List<com.datn.dms.dtos.statistics.response.RecentActivityResponse> response = adminStatisticsService.getRecentActivities();

        return ResponseEntity.ok(ApiResponse.<List<com.datn.dms.dtos.statistics.response.RecentActivityResponse>>builder()
                .code(200)
                .message("Get recent activities successfully")
                .data(response)
                .build());
    }
}
