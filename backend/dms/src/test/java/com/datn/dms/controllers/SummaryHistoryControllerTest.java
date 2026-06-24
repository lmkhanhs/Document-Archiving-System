package com.datn.dms.controllers;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.datn.dms.dtos.summary.response.SummaryHistoryDetailResponse;
import com.datn.dms.dtos.summary.response.SummaryHistoryItemResponse;
import com.datn.dms.exception.GlobalExceptionHandler;
import com.datn.dms.services.SummaryService;
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
class SummaryHistoryControllerTest {

    @Mock
    private SummaryService summaryService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new SummaryHistoryController(summaryService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .addPlaceholderValue("app.prefix", "/api/v1")
                .build();
    }

    @AfterEach
    void logTestCompleted(TestInfo testInfo) {
        System.out.printf("%n[SUMMARY_HISTORY_CONTROLLER_TEST] PASSED: %s%n", testInfo.getDisplayName());
    }

    @Test
    void getMySummaryHistoriesReturnsList() throws Exception {
        when(summaryService.getMySummaryHistories("report", "FILE", "week")).thenReturn(List.of(
                SummaryHistoryItemResponse.builder().id(1L).title("Report summary").inputType("FILE").status("SUCCESS").build()));

        mockMvc.perform(get("/api/v1/summary-histories/my")
                        .param("search", "report")
                        .param("type", "FILE")
                        .param("time", "week"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Get my summary histories successfully"))
                .andExpect(jsonPath("$.data[0].title").value("Report summary"));

        verify(summaryService).getMySummaryHistories("report", "FILE", "week");
    }

    @Test
    void getMySummaryHistoryDetailReturnsData() throws Exception {
        when(summaryService.getMySummaryHistoryDetail(1L)).thenReturn(
                SummaryHistoryDetailResponse.builder().id(1L).title("Report summary detail").build());

        mockMvc.perform(get("/api/v1/summary-histories/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Get my summary history detail successfully"))
                .andExpect(jsonPath("$.data.title").value("Report summary detail"));

        verify(summaryService).getMySummaryHistoryDetail(1L);
    }
}
