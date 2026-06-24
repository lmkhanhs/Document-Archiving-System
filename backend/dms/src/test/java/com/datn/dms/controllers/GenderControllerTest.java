package com.datn.dms.controllers;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.datn.dms.dtos.gender.response.GenderResponse;
import com.datn.dms.exception.GlobalExceptionHandler;
import com.datn.dms.services.GenderService;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class GenderControllerTest {

    @Mock
    private GenderService genderService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new GenderController(genderService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .addPlaceholderValue("app.prefix", "/api/v1")
                .build();
    }

    @Test
    void getAllGendersReturnsList() throws Exception {
        when(genderService.getAllGenders()).thenReturn(List.of(GenderResponse.builder()
                .id(1L)
                .name("Male")
                .thumbnailUrl("/male.png")
                .build()));

        mockMvc.perform(get("/api/v1/genders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Get all genders successfully"))
                .andExpect(jsonPath("$.data[0].name").value("Male"));

        verify(genderService).getAllGenders();
    }
}
