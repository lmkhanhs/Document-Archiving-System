package com.datn.dms.controllers;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.datn.dms.dtos.ApiResponse;
import com.datn.dms.dtos.country.response.AdminCountryResponse;
import com.datn.dms.dtos.country.response.CountryResponse;
import com.datn.dms.dtos.country.response.CountryStatisticsResponse;
import com.datn.dms.services.CountryService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("${app.prefix}/countries")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CountryController {
    CountryService countryService;

    @GetMapping
    public ApiResponse<List<CountryResponse>> getAllCountries() {
        return ApiResponse.<List<CountryResponse>>builder()
                .message("Get all countries successfully")
                .data(countryService.getAllCountriesIsActive())
                .build();
    }
    @GetMapping("/statistics")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<CountryStatisticsResponse>> getStatistics() {
        CountryStatisticsResponse statistics = countryService.getStatistics();

        return ResponseEntity.ok(ApiResponse.<CountryStatisticsResponse>builder()
                .code(200)
                .message("Get country statistics successfully")
                .data(statistics)
                .build());
    }
    @GetMapping("/admin")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AdminCountryResponse>>> getAdminCountries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size,
            @RequestParam(required = false) String keyword) {

        Page<AdminCountryResponse> data = countryService.getAdminCountries(page, size, keyword);

        return ResponseEntity.ok(ApiResponse.<Page<AdminCountryResponse>>builder()
                .code(200)
                .message("Get admin countries successfully")
                .data(data)
                .build());
    }
}
