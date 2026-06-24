package com.datn.dms.controllers;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.datn.dms.dtos.summary.response.AdminSummaryStatisticsResponse;
import com.datn.dms.dtos.summary.response.InputTypeStatisticsResponse;
import com.datn.dms.dtos.summary.response.SummaryHistoryDetailResponse;
import com.datn.dms.dtos.summary.response.SummaryHistoryPageResponse;
import com.datn.dms.dtos.summary.response.SummaryTrendItemResponse;
import com.datn.dms.exception.GlobalExceptionHandler;
import com.datn.dms.services.SummaryService;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInfo;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class SummaryControllerTest {

    @Mock
    private SummaryService summaryService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new SummaryController(summaryService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .addPlaceholderValue("app.prefix", "/api/v1")
                .build();
    }

    @AfterEach
    void logTestCompleted(TestInfo testInfo) {
        System.out.printf("%n[SUMMARY_CONTROLLER_TEST] PASSED: %s%n", testInfo.getDisplayName());
    }

    @Test
    void getStatisticsReturnsData() throws Exception {
        when(summaryService.getAdminStatistics()).thenReturn(AdminSummaryStatisticsResponse.builder()
                .summaryHistory30Days(AdminSummaryStatisticsResponse.SummaryHistory30Days.builder().total(10L).unit("items").todayIncrease(1L).build())
                .build());

        mockMvc.perform(get("/api/v1/summaries/statistics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Get admin summary statistics successfully"))
                .andExpect(jsonPath("$.data.summaryHistory30Days.total").value(10));

        verify(summaryService).getAdminStatistics();
    }

    @Test
    void getSummaryTrendReturnsData() throws Exception {
        when(summaryService.getSummaryTrend(30)).thenReturn(List.of(SummaryTrendItemResponse.builder().date("2026-06-19").count(2L).build()));

        mockMvc.perform(get("/api/v1/summaries/statistics/trend"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Get summary trend successfully"))
                .andExpect(jsonPath("$.data[0].count").value(2));

        verify(summaryService).getSummaryTrend(30);
    }

    @Test
    void getInputTypeStatisticsReturnsData() throws Exception {
        when(summaryService.getInputTypeStatistics()).thenReturn(InputTypeStatisticsResponse.builder()
                .total(10L)
                .fileCount(6L)
                .textCount(4L)
                .filePercent(60.0)
                .textPercent(40.0)
                .build());

        mockMvc.perform(get("/api/v1/summaries/statistics/input-type"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Get input type statistics successfully"))
                .andExpect(jsonPath("$.data.fileCount").value(6));

        verify(summaryService).getInputTypeStatistics();
    }

    @Test
    void getSummaryHistoryReturnsPage() throws Exception {
        when(summaryService.getSummaryHistory(1, 10, "ALL", "ALL", null, null)).thenReturn(SummaryHistoryPageResponse.builder()
                .items(List.of())
                .pagination(SummaryHistoryPageResponse.PaginationMeta.builder().page(1).size(10).totalItems(0).totalPages(0).build())
                .build());

        mockMvc.perform(get("/api/v1/summaries/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Get summary history successfully"))
                .andExpect(jsonPath("$.data.pagination.page").value(1));

        verify(summaryService).getSummaryHistory(1, 10, "ALL", "ALL", null, null);
    }

    @Test
    void getSummaryHistoryDetailReturnsData() throws Exception {
        when(summaryService.getSummaryHistoryDetail(1L)).thenReturn(SummaryHistoryDetailResponse.builder().id(1L).title("Summary 1").build());

        mockMvc.perform(get("/api/v1/summaries/history/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Get summary detail successfully"))
                .andExpect(jsonPath("$.data.title").value("Summary 1"));

        verify(summaryService).getSummaryHistoryDetail(1L);
    }

    @Test
    void pingAiReturnsServerStatus() throws Exception {
        when(summaryService.pingAiServer()).thenReturn(Map.of("status", "success"));

        mockMvc.perform(get("/api/v1/summaries/ping-ai"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Ping AI server finished"))
                .andExpect(jsonPath("$.data.status").value("success"));

        verify(summaryService).pingAiServer();
    }
}
