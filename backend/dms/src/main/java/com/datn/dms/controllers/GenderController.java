package com.datn.dms.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.datn.dms.dtos.ApiResponse;
import com.datn.dms.dtos.gender.response.GenderResponse;
import com.datn.dms.services.GenderService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("${app.prefix}/genders")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GenderController {
    GenderService genderService;

    @GetMapping
    public ApiResponse<List<GenderResponse>> getAllGenders() {
        return ApiResponse.<List<GenderResponse>>builder()
                .message("Get all genders successfully")
                .data(genderService.getAllGenders())
                .build();
    }
}
