package com.datn.dms.controllers;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.datn.dms.dtos.files.response.CreateFileResponse;
import com.datn.dms.dtos.files.response.FileResponse;
import com.datn.dms.dtos.files.response.HomeDashboardResponse;
import com.datn.dms.dtos.files.response.HomeRecentItemResponse;
import com.datn.dms.exception.GlobalExceptionHandler;
import com.datn.dms.services.FileService;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInfo;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class FileControllerTest {

    @Mock
    private FileService fileService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new FileController(fileService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .addPlaceholderValue("app.prefix", "/api/v1")
                .build();
    }

    @AfterEach
    void logTestCompleted(TestInfo testInfo) {
        System.out.printf("%n[FILE_CONTROLLER_TEST] PASSED: %s%n", testInfo.getDisplayName());
    }

    @Test
    void uploadFileReturnsCreated() throws Exception {
        when(fileService.handleCreateFile(any(), any())).thenReturn(CreateFileResponse.builder()
                .id(1L)
                .name("report.pdf")
                .type("pdf")
                .size(100L)
                .url("/files/report.pdf")
                .build());

        mockMvc.perform(multipart("/api/v1/files/upload")
                        .file(new MockMultipartFile("file", "report.pdf", "application/pdf", "pdf".getBytes()))
                        .param("folderId", "1"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(201))
                .andExpect(jsonPath("$.message").value("Upload file successfully"))
                .andExpect(jsonPath("$.data.name").value("report.pdf"));

        verify(fileService).handleCreateFile(any(), any());
    }

    @Test
    void getHomeDashboardReturnsData() throws Exception {
        when(fileService.getHomeDashboard("doc", "pdf", "week", "me", "asc"))
                .thenReturn(HomeDashboardResponse.builder().recent(List.of(recentItem())).build());

        mockMvc.perform(get("/api/v1/files/home")
                        .param("search", "doc")
                        .param("fileType", "pdf")
                        .param("time", "week")
                        .param("owner", "me")
                        .param("sort", "asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Get home dashboard successfully"))
                .andExpect(jsonPath("$.data.recent[0].name").value("report.pdf"));

        verify(fileService).getHomeDashboard("doc", "pdf", "week", "me", "asc");
    }

    @Test
    void downloadAndPreviewReturnResourceResponse() throws Exception {
        when(fileService.downloadFile(1L)).thenReturn(fileResource("attachment; filename=report.pdf"));
        when(fileService.previewFile(1L)).thenReturn(fileResource("inline; filename=report.pdf"));

        mockMvc.perform(get("/api/v1/files/1/download"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=report.pdf"));
        verify(fileService).downloadFile(1L);

        mockMvc.perform(get("/api/v1/files/1/preview"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=report.pdf"));
        verify(fileService).previewFile(1L);
    }

    @Test
    void renameAndUpdateColorReturnUpdatedFile() throws Exception {
        when(fileService.renameFile(eq(1L), any())).thenReturn(recentItem());
        when(fileService.updateFileColor(1L, 2L)).thenReturn(file());

        mockMvc.perform(put("/api/v1/files/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"new-report.pdf\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Rename file successfully"))
                .andExpect(jsonPath("$.data.name").value("report.pdf"));
        verify(fileService).renameFile(eq(1L), any());

        mockMvc.perform(patch("/api/v1/files/1/color")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"colorId\":2}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Update file color successfully"))
                .andExpect(jsonPath("$.data.name").value("report.pdf"));
        verify(fileService).updateFileColor(1L, 2L);
    }

    @Test
    void deleteForceDeleteAndRestoreFileCallService() throws Exception {
        when(fileService.restoreFile(1L)).thenReturn(file());

        mockMvc.perform(delete("/api/v1/files/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Delete file successfully"));
        verify(fileService).deleteFile(1L);

        mockMvc.perform(delete("/api/v1/files/1/force"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Force delete file successfully"));
        verify(fileService).forceDeleteFile(1L);

        mockMvc.perform(put("/api/v1/files/restore/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Restore file successfully"))
                .andExpect(jsonPath("$.data.name").value("report.pdf"));
        verify(fileService).restoreFile(1L);
    }

    @Test
    void getFileListsReturnData() throws Exception {
        when(fileService.getRootFiles()).thenReturn(List.of(file()));
        when(fileService.getFilesByFolderId(1L)).thenReturn(List.of(file()));
        when(fileService.getFilesByColor(2L, "colored")).thenReturn(List.of(file()));
        when(fileService.getTrashFiles()).thenReturn(List.of(file()));

        mockMvc.perform(get("/api/v1/files/root"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Get root files successfully"));
        verify(fileService).getRootFiles();

        mockMvc.perform(get("/api/v1/files/folder/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Get files by folder id successfully"));
        verify(fileService).getFilesByFolderId(1L);

        mockMvc.perform(get("/api/v1/files/by-color").param("colorId", "2").param("type", "colored"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Get files by color successfully"));
        verify(fileService).getFilesByColor(2L, "colored");

        mockMvc.perform(get("/api/v1/files/trash"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Get trash files successfully"));
        verify(fileService).getTrashFiles();
    }

    @Test
    void adminFileQueriesReturnData() throws Exception {
        when(fileService.getFileAdminPaged(0, 10)).thenReturn(new PageImpl<>(List.of(file()), PageRequest.of(0, 10), 1));
        when(fileService.getTrashFilesAdminPaged(0, 10)).thenReturn(new PageImpl<>(List.of(file()), PageRequest.of(0, 10), 1));
        when(fileService.searchFilesAdmin("report", "admin")).thenReturn(List.of(file()));

        mockMvc.perform(get("/api/v1/files/admin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Get all files successfully"));
        verify(fileService).getFileAdminPaged(0, 10);

        mockMvc.perform(get("/api/v1/files/admin/trash"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Get all trash files successfully"));
        verify(fileService).getTrashFilesAdminPaged(0, 10);

        mockMvc.perform(get("/api/v1/files/admin/search")
                        .param("fileName", "report")
                        .param("uploader", "admin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Search files successfully"));
        verify(fileService).searchFilesAdmin("report", "admin");
    }

    @Test
    void adminFileMutationsAndPreviewCallService() throws Exception {
        when(fileService.restoreFileAdmin(1L)).thenReturn(file());
        when(fileService.previewFileAdmin(1L)).thenReturn(fileResource("inline; filename=report.pdf"));

        mockMvc.perform(delete("/api/v1/files/admin/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Delete file successfully"));
        verify(fileService).deleteFileAdmin(1L);

        mockMvc.perform(delete("/api/v1/files/admin/1/force"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Force delete file successfully"));
        verify(fileService).forceDeleteFileAdmin(1L);

        mockMvc.perform(put("/api/v1/files/admin/restore/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Restore file successfully"));
        verify(fileService).restoreFileAdmin(1L);

        mockMvc.perform(get("/api/v1/files/admin/1/preview"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=report.pdf"));
        verify(fileService).previewFileAdmin(1L);
    }

    private ResponseEntity<Resource> fileResource(String contentDisposition) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new ByteArrayResource("pdf".getBytes()));
    }

    private FileResponse file() {
        return FileResponse.builder()
                .id("1")
                .name("report.pdf")
                .type("pdf")
                .size(100L)
                .url("/files/report.pdf")
                .folderId(1L)
                .build();
    }

    private HomeRecentItemResponse recentItem() {
        return HomeRecentItemResponse.builder()
                .id(1L)
                .name("report.pdf")
                .fileType("pdf")
                .size(100L)
                .url("/files/report.pdf")
                .build();
    }
}
