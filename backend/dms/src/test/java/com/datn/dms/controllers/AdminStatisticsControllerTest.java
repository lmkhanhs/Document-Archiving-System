package com.datn.dms.controllers;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.datn.dms.dtos.statistics.response.DocumentTypeStatisticItemResponse;
import com.datn.dms.dtos.statistics.response.OverviewStatisticsResponse;
import com.datn.dms.dtos.statistics.response.RecentActivityResponse;
import com.datn.dms.dtos.statistics.response.TopActiveUserResponse;
import com.datn.dms.exception.GlobalExceptionHandler;
import com.datn.dms.services.AdminStatisticsService;
import java.util.List;
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
class AdminStatisticsControllerTest {

    @Mock
    private AdminStatisticsService adminStatisticsService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new AdminStatisticsController(adminStatisticsService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .addPlaceholderValue("app.prefix", "/api/v1")
                .build();
    }

    @AfterEach
    void logTestCompleted(TestInfo testInfo) {
        System.out.printf("%n[ADMIN_STATISTICS_CONTROLLER_TEST] PASSED: %s%n", testInfo.getDisplayName());
    }

    @Test
    void getOverviewStatisticsReturnsData() throws Exception {
        when(adminStatisticsService.getOverviewStatistics()).thenReturn(OverviewStatisticsResponse.builder()
                .totalUsers(10)
                .totalDocuments(20)
                .totalSummaries(5)
                .activeUsers(3)
                .successRate(90.0)
                .averageProcessingTime(1.5)
                .build());

        mockMvc.perform(get("/api/v1/admin/statistics/overview"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Get overview statistics successfully"))
                .andExpect(jsonPath("$.data.totalUsers").value(10));

        verify(adminStatisticsService).getOverviewStatistics();
    }

    @Test
    void getStatisticListsReturnData() throws Exception {
        when(adminStatisticsService.getDocumentTypeStatistics()).thenReturn(List.of(
                DocumentTypeStatisticItemResponse.builder().type("pdf").count(3).build()));
        when(adminStatisticsService.getTopActiveUsers()).thenReturn(List.of(
                TopActiveUserResponse.builder().userId(1L).username("admin").uploadedDocuments(2).summaryCount(1).build()));
        when(adminStatisticsService.getRecentActivities()).thenReturn(List.of(
                RecentActivityResponse.builder().id(1L).type("UPLOAD").title("report.pdf").status("SUCCESS").build()));

        mockMvc.perform(get("/api/v1/admin/statistics/document-types"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Get document type statistics successfully"))
                .andExpect(jsonPath("$.data[0].type").value("pdf"));
        verify(adminStatisticsService).getDocumentTypeStatistics();

        mockMvc.perform(get("/api/v1/admin/statistics/top-active-users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Get top active users successfully"))
                .andExpect(jsonPath("$.data[0].username").value("admin"));
        verify(adminStatisticsService).getTopActiveUsers();

        mockMvc.perform(get("/api/v1/admin/statistics/recent-activities"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Get recent activities successfully"))
                .andExpect(jsonPath("$.data[0].title").value("report.pdf"));
        verify(adminStatisticsService).getRecentActivities();
    }
}
