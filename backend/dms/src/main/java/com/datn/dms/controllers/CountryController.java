package com.datn.dms.controllers;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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

    @PostMapping("/admin")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<AdminCountryResponse>> createAdminCountry(
            @RequestParam("name") String name,
            @RequestParam("code") String code,
            @RequestParam(value = "active", required = false, defaultValue = "true") Boolean active,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {

        AdminCountryResponse data = countryService.createAdminCountry(name, code, active, file);

        return ResponseEntity.status(201).body(ApiResponse.<AdminCountryResponse>builder()
                .code(201)
                .message("Create country successfully")
                .data(data)
                .build());
    }

    @PutMapping("/admin/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<AdminCountryResponse>> updateAdminCountry(
            @PathVariable("id") Long id,
            @RequestParam("name") String name,
            @RequestParam("code") String code,
            @RequestParam(value = "active", required = false, defaultValue = "true") Boolean active,
            @RequestParam(value = "file", required = false) org.springframework.web.multipart.MultipartFile file) {

        AdminCountryResponse data = countryService.updateAdminCountry(id, name, code, active, file);

        return ResponseEntity.status(200).body(ApiResponse.<AdminCountryResponse>builder()
                .code(201)
                .message("Update country successfully")
                .data(data)
                .build());
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAdminCountry(
            @PathVariable("id") Long id) {
        countryService.deleteAdminCountry(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200)
                .message("Delete country successfully")
                .build());
    }

    @GetMapping("/admin/trash")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AdminCountryResponse>>> getDeletedAdminCountries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size,
            @RequestParam(required = false) String keyword) {

        Page<AdminCountryResponse> data = countryService.getDeletedAdminCountries(page, size, keyword);

        return ResponseEntity.ok(ApiResponse.<Page<AdminCountryResponse>>builder()
                .code(200)
                .message("Get deleted countries successfully")
                .data(data)
                .build());
    }

    @PatchMapping("/admin/{id}/restore")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> restoreAdminCountry(
            @PathVariable("id") Long id) {
        countryService.restoreAdminCountry(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200)
                .message("Restore country successfully")
                .build());
    }
}
