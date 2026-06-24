package com.datn.dms.controllers;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.datn.dms.dtos.documents.response.FileTypeRatioResponse;
import com.datn.dms.dtos.documents.response.RecentUploadsResponse;
import com.datn.dms.dtos.documents.response.TopUploaderResponse;
import com.datn.dms.exception.GlobalExceptionHandler;
import com.datn.dms.services.AdminDocumentService;
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
class AdminDocumentControllerTest {

    @Mock
    private AdminDocumentService adminDocumentService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new AdminDocumentController(adminDocumentService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .addPlaceholderValue("app.prefix", "/api/v1")
                .build();
    }

    @AfterEach
    void logTestCompleted(TestInfo testInfo) {
        System.out.printf("%n[ADMIN_DOCUMENT_CONTROLLER_TEST] PASSED: %s %n", testInfo.getDisplayName());
    }

    @Test
    void getDocumentCountsReturnData() throws Exception {
        when(adminDocumentService.getTotalDocuments()).thenReturn(10L);
        when(adminDocumentService.getDeletedDocuments()).thenReturn(2L);

        mockMvc.perform(get("/api/v1/admin/documents/total-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Get total documents successfully"))
                .andExpect(jsonPath("$.data.totalDocuments").value(10));
        verify(adminDocumentService).getTotalDocuments();

        mockMvc.perform(get("/api/v1/admin/documents/deleted-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Get deleted documents successfully"))
                .andExpect(jsonPath("$.data.deletedDocuments").value(2));
        verify(adminDocumentService).getDeletedDocuments();
    }

    @Test
    void getDocumentStatisticsListsReturnData() throws Exception {
        when(adminDocumentService.getFileTypeRatio()).thenReturn(List.of(FileTypeRatioResponse.builder().type("pdf").count(3L).percentage(60L).build()));
        when(adminDocumentService.getRecentUploads(7)).thenReturn(List.of(RecentUploadsResponse.builder().date("2026-06-19").count(1L).build()));
        when(adminDocumentService.getTopUploaders()).thenReturn(List.of(TopUploaderResponse.builder().username("admin").documentCount(5L).build()));

        mockMvc.perform(get("/api/v1/admin/documents/file-type-ratio"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Get file type ratio successfully"));
        verify(adminDocumentService).getFileTypeRatio();

        mockMvc.perform(get("/api/v1/admin/documents/recent-uploads"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Get recent uploads successfully"));
        verify(adminDocumentService).getRecentUploads(7);

        mockMvc.perform(get("/api/v1/admin/documents/top-uploaders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Get top uploaders successfully"));
        verify(adminDocumentService).getTopUploaders();
    }
}
