package com.datn.dms.controllers;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.datn.dms.dtos.color.response.ColorResponse;
import com.datn.dms.dtos.color.response.ColorSummaryResponse;
import com.datn.dms.exception.GlobalExceptionHandler;
import com.datn.dms.services.ColorService;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class ColorControllerTest {

    @Mock
    private ColorService colorService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new ColorController(colorService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .addPlaceholderValue("app.prefix", "/api/v1")
                .build();
    }

    @Test
    void createColorReturnsCreated() throws Exception {
        when(colorService.createColor(any())).thenReturn(color());

        mockMvc.perform(post("/api/v1/colors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Blue\",\"hexCode\":\"#0000FF\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(201))
                .andExpect(jsonPath("$.message").value("Create color successfully"))
                .andExpect(jsonPath("$.data.name").value("Blue"));

        verify(colorService).createColor(any());
    }

    @Test
    void updateColorReturnsUpdatedColor() throws Exception {
        when(colorService.updateColor(any())).thenReturn(color());

        mockMvc.perform(put("/api/v1/colors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":1,\"name\":\"Blue\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Update color successfully"))
                .andExpect(jsonPath("$.data.id").value(1));

        verify(colorService).updateColor(any());
    }

    @Test
    void deleteColorCallsService() throws Exception {
        mockMvc.perform(delete("/api/v1/colors/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Delete color successfully"));

        verify(colorService).deleteColor(1L);
    }

    @Test
    void getAllColorsReturnsList() throws Exception {
        when(colorService.getAllColors(any(Pageable.class))).thenReturn(List.of(color()));

        mockMvc.perform(get("/api/v1/colors?page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Get all colors by pageable successfully"))
                .andExpect(jsonPath("$.data[0].hexCode").value("#0000FF"));

        verify(colorService).getAllColors(any(Pageable.class));
    }

    @Test
    void getColorSummaryReturnsList() throws Exception {
        when(colorService.getColorSummary()).thenReturn(List.of(ColorSummaryResponse.builder().name("Blue").fileCount(2L).build()));

        mockMvc.perform(get("/api/v1/colors/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Get color summary successfully"))
                .andExpect(jsonPath("$.data[0].name").value("Blue"));

        verify(colorService).getColorSummary();
    }

    @Test
    void getDeletedColorsReturnsList() throws Exception {
        when(colorService.getAllDeletedColors()).thenReturn(List.of(color()));

        mockMvc.perform(get("/api/v1/colors/deleted"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Get all deleted colors successfully"));

        verify(colorService).getAllDeletedColors();
    }

    @Test
    void restoreColorCallsService() throws Exception {
        mockMvc.perform(put("/api/v1/colors/restore/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Restore color successfully"));

        verify(colorService).restoreColor(eq(1L));
    }

    private ColorResponse color() {
        return ColorResponse.builder()
                .id(1L)
                .name("Blue")
                .hexCode("#0000FF")
                .position(1)
                .isDeleted(false)
                .build();
    }
}
