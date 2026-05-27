package com.datn.dms.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.datn.dms.dtos.ApiResponse;
import com.datn.dms.dtos.country.response.CountryResponse;
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
                .data(countryService.getAllCountries())
                .build();
    }
}
