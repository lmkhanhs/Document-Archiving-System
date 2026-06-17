package com.datn.dms.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.datn.dms.dtos.ApiResponse;
import com.datn.dms.dtos.summary.response.SummaryHistoryDetailResponse;
import com.datn.dms.dtos.summary.response.SummaryHistoryItemResponse;
import com.datn.dms.services.SummaryService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("${app.prefix}/summary-histories")
public class SummaryHistoryController {
    SummaryService summaryService;

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<SummaryHistoryItemResponse>>> getMySummaryHistories(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "ALL") String type,
            @RequestParam(required = false, defaultValue = "all") String time) {
        return ResponseEntity.ok(ApiResponse.<List<SummaryHistoryItemResponse>>builder()
                .code(200)
                .message("Get my summary histories successfully")
                .data(summaryService.getMySummaryHistories(search, type, time))
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SummaryHistoryDetailResponse>> getMySummaryHistoryDetail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<SummaryHistoryDetailResponse>builder()
                .code(200)
                .message("Get my summary history detail successfully")
                .data(summaryService.getMySummaryHistoryDetail(id))
                .build());
    }
}
