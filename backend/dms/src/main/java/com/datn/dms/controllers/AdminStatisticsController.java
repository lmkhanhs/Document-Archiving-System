package com.datn.dms.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.datn.dms.dtos.ApiResponse;
import com.datn.dms.dtos.statistics.response.OverviewStatisticsResponse;
import com.datn.dms.services.AdminStatisticsService;

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
}
