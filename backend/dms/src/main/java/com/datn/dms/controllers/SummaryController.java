package com.datn.dms.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.datn.dms.dtos.ApiResponse;
import com.datn.dms.dtos.summary.response.SummaryStatisticsResponse;
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
    public ResponseEntity<ApiResponse<SummaryStatisticsResponse>> getStatistics() {
        SummaryStatisticsResponse statistics = summaryService.getStatistics();

        return ResponseEntity.ok(ApiResponse.<SummaryStatisticsResponse>builder()
                .code(200)
                .message("Get summary statistics successfully")
                .data(statistics)
                .build());
    }
}
