package com.datn.dms.controllers;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.datn.dms.dtos.folder.response.CreateFolderResponse;
import com.datn.dms.dtos.folder.response.FolderResponse;
import com.datn.dms.exception.GlobalExceptionHandler;
import com.datn.dms.services.FolderService;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInfo;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class FolderControllerTest {

    @Mock
    private FolderService folderService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new ForderController(folderService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .addPlaceholderValue("app.prefix", "/api/v1")
                .build();
    }

    @AfterEach
    void logTestCompleted(TestInfo testInfo) {
        System.out.printf("%n[FOLDER_CONTROLLER_TEST] PASSED: %s%n", testInfo.getDisplayName());
    }

    @Test
    void createFolderReturnsCreated() throws Exception {
        when(folderService.createFolder(any())).thenReturn(CreateFolderResponse.builder().id(1L).name("Docs").build());

        mockMvc.perform(post("/api/v1/folders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Docs\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(201))
                .andExpect(jsonPath("$.message").value("Create folder successfully"))
                .andExpect(jsonPath("$.data.name").value("Docs"));

        verify(folderService).createFolder(any());
    }

    @Test
    void getFolderListsReturnData() throws Exception {
        when(folderService.getAllActiveFolders()).thenReturn(List.of(folder()));
        when(folderService.getActiveRootFolders()).thenReturn(List.of(folder()));
        when(folderService.getActiveFoldersByParentId(1L)).thenReturn(List.of(folder()));
        when(folderService.getTrashFolders()).thenReturn(List.of(folder()));

        mockMvc.perform(get("/api/v1/folders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Get active folders successfully"));
        verify(folderService).getAllActiveFolders();

        mockMvc.perform(get("/api/v1/folders/root"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Get active root folders successfully"));
        verify(folderService).getActiveRootFolders();

        mockMvc.perform(get("/api/v1/folders/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Get child folders by parent id successfully"));
        verify(folderService).getActiveFoldersByParentId(1L);

        mockMvc.perform(get("/api/v1/folders/trash"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Get trash folders successfully"));
        verify(folderService).getTrashFolders();
    }

    @Test
    void updateDeleteRestoreFolderCallService() throws Exception {
        when(folderService.updateFolder(any(), any())).thenReturn(folder());
        when(folderService.restoreFolder(1L)).thenReturn(folder());

        mockMvc.perform(put("/api/v1/folders/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"New Docs\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Update folder successfully"));
        verify(folderService).updateFolder(any(), any());

        mockMvc.perform(delete("/api/v1/folders/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Delete folder successfully"));
        verify(folderService).deleteFolder(1L);

        mockMvc.perform(delete("/api/v1/folders/1/force"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Force delete folder successfully"));
        verify(folderService).forceDeleteFolder(1L);

        mockMvc.perform(put("/api/v1/folders/restore/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Restore folder successfully"));
        verify(folderService).restoreFolder(1L);
    }

    private FolderResponse folder() {
        return FolderResponse.builder().id(1L).name("Docs").path("/Docs").build();
    }
}
