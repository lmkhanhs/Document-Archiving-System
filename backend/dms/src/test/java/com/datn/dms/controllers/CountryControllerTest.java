package com.datn.dms.controllers;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.datn.dms.dtos.country.response.AdminCountryResponse;
import com.datn.dms.dtos.country.response.CountryResponse;
import com.datn.dms.dtos.country.response.CountryStatisticsResponse;
import com.datn.dms.exception.GlobalExceptionHandler;
import com.datn.dms.services.CountryService;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class CountryControllerTest {

    @Mock
    private CountryService countryService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new CountryController(countryService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .addPlaceholderValue("app.prefix", "/api/v1")
                .build();
    }

    @Test
    void getAllCountriesReturnsList() throws Exception {
        when(countryService.getAllCountriesIsActive()).thenReturn(List.of(country()));

        mockMvc.perform(get("/api/v1/countries"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Get all countries successfully"))
                .andExpect(jsonPath("$.data[0].name").value("Vietnam"));

        verify(countryService).getAllCountriesIsActive();
    }

    @Test
    void getStatisticsReturnsStatistics() throws Exception {
        when(countryService.getStatistics()).thenReturn(CountryStatisticsResponse.builder()
                .totalSupportedCountries(3L)
                .activeCountries(2L)
                .userCoverageRate(66)
                .build());

        mockMvc.perform(get("/api/v1/countries/statistics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Get country statistics successfully"));

        verify(countryService).getStatistics();
    }

    @Test
    void getAdminCountriesReturnsPage() throws Exception {
        when(countryService.getAdminCountries(0, 6, "viet"))
                .thenReturn(new PageImpl<>(List.of(adminCountry()), PageRequest.of(0, 6), 1));

        mockMvc.perform(get("/api/v1/countries/admin").param("keyword", "viet"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Get admin countries successfully"))
                .andExpect(jsonPath("$.data.content[0].name").value("Vietnam"));

        verify(countryService).getAdminCountries(0, 6, "viet");
    }

    @Test
    void createAdminCountryReturnsCreated() throws Exception {
        when(countryService.createAdminCountry(eq("Vietnam"), eq("VN"), eq(true), any())).thenReturn(adminCountry());

        mockMvc.perform(multipart("/api/v1/countries/admin")
                        .file(new MockMultipartFile("file", "flag.png", "image/png", "flag".getBytes()))
                        .param("name", "Vietnam")
                        .param("code", "VN")
                        .param("active", "true"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(201))
                .andExpect(jsonPath("$.message").value("Create country successfully"));

        verify(countryService).createAdminCountry(eq("Vietnam"), eq("VN"), eq(true), any());
    }

    @Test
    void updateAdminCountryReturnsUpdated() throws Exception {
        when(countryService.updateAdminCountry(eq(1L), eq("Vietnam"), eq("VN"), eq(true), any())).thenReturn(adminCountry());

        mockMvc.perform(multipart("/api/v1/countries/admin/1")
                        .file(new MockMultipartFile("file", "flag.png", "image/png", "flag".getBytes()))
                        .param("name", "Vietnam")
                        .param("code", "VN")
                        .param("active", "true")
                        .with(request -> { request.setMethod("PUT"); return request; }))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Update country successfully"));

        verify(countryService).updateAdminCountry(eq(1L), eq("Vietnam"), eq("VN"), eq(true), any());
    }

    @Test
    void deleteAndRestoreAdminCountryCallService() throws Exception {
        mockMvc.perform(delete("/api/v1/countries/admin/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Delete country successfully"));
        verify(countryService).deleteAdminCountry(1L);

        mockMvc.perform(patch("/api/v1/countries/admin/1/restore"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Restore country successfully"));
        verify(countryService).restoreAdminCountry(1L);
    }

    @Test
    void getDeletedAdminCountriesReturnsPage() throws Exception {
        when(countryService.getDeletedAdminCountries(0, 6, null))
                .thenReturn(new PageImpl<>(List.of(adminCountry()), PageRequest.of(0, 6), 1));

        mockMvc.perform(get("/api/v1/countries/admin/trash"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Get deleted countries successfully"));

        verify(countryService).getDeletedAdminCountries(0, 6, null);
    }

    private CountryResponse country() {
        return CountryResponse.builder().id(1L).name("Vietnam").thumbnailUrl("/vn.png").build();
    }

    private AdminCountryResponse adminCountry() {
        return AdminCountryResponse.builder().id(1L).name("Vietnam").isoCode("VN").flag("/vn.png").active(true).userCount(5).build();
    }
}
