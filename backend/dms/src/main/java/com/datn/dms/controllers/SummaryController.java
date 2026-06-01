package com.datn.dms.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import com.datn.dms.dtos.ApiResponse;
import com.datn.dms.dtos.summary.response.AdminSummaryStatisticsResponse;
import com.datn.dms.dtos.summary.response.InputTypeStatisticsResponse;
import com.datn.dms.dtos.summary.response.SummaryHistoryDetailResponse;
import com.datn.dms.dtos.summary.response.SummaryHistoryPageResponse;
import com.datn.dms.dtos.summary.response.SummaryStatisticsResponse;
import com.datn.dms.dtos.summary.response.SummaryTrendItemResponse;
import com.datn.dms.services.SummaryService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("${app.prefix}/summaries")
public class SummaryController {
    SummaryService summaryService;

    @GetMapping("/statistics")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<AdminSummaryStatisticsResponse>> getStatistics() {
        AdminSummaryStatisticsResponse statistics = summaryService.getAdminStatistics();

        return ResponseEntity.ok(ApiResponse.<AdminSummaryStatisticsResponse>builder()
                .code(200)
                .message("Get admin summary statistics successfully")
                .data(statistics)
                .build());
    }

    @GetMapping("/statistics/trend")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<SummaryTrendItemResponse>>> getSummaryTrend(
            @RequestParam(defaultValue = "30") int days) {
        List<SummaryTrendItemResponse> trendData = summaryService.getSummaryTrend(days);

        return ResponseEntity.ok(ApiResponse.<List<SummaryTrendItemResponse>>builder()
                .code(200)
                .message("Get summary trend successfully")
                .data(trendData)
                .build());
    }

    @GetMapping("/statistics/input-type")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<InputTypeStatisticsResponse>> getInputTypeStatistics() {
        InputTypeStatisticsResponse stats = summaryService.getInputTypeStatistics();

        return ResponseEntity.ok(ApiResponse.<InputTypeStatisticsResponse>builder()
                .code(200)
                .message("Get input type statistics successfully")
                .data(stats)
                .build());
    }

    @GetMapping("/history")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<SummaryHistoryPageResponse>> getSummaryHistory(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "ALL") String inputType,
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        SummaryHistoryPageResponse response = summaryService.getSummaryHistory(page, size, inputType, status, startDate, endDate);

        return ResponseEntity.ok(ApiResponse.<SummaryHistoryPageResponse>builder()
                .code(200)
                .message("Get summary history successfully")
                .data(response)
                .build());
    }

    @GetMapping("/history/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<SummaryHistoryDetailResponse>> getSummaryHistoryDetail(@PathVariable Long id) {
        SummaryHistoryDetailResponse response = summaryService.getSummaryHistoryDetail(id);

        return ResponseEntity.ok(ApiResponse.<SummaryHistoryDetailResponse>builder()
                .code(200)
                .message("Get summary detail successfully")
                .data(response)
                .build());
    }
}
