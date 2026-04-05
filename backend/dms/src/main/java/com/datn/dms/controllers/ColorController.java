package com.datn.dms.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Pageable;

import com.datn.dms.dtos.ApiResponse;
import com.datn.dms.dtos.color.request.CreateColorRequest;
import com.datn.dms.dtos.color.request.UpdateColorRequest;
import com.datn.dms.dtos.color.response.ColorResponse;
import com.datn.dms.services.ColorService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("${app.prefix}/colors")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ColorController {
    ColorService colorService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<ColorResponse> createColor(@RequestBody CreateColorRequest request) {
        return ApiResponse.<ColorResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Create color successfully")
                .data(colorService.createColor(request))
                .build();
    }

    @PutMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<ColorResponse> updateColor(@RequestBody UpdateColorRequest request) {
        return ApiResponse.<ColorResponse>builder()
                .message("Update color successfully")
                .data(colorService.updateColor(request))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<Void> deleteColor(@PathVariable Long id) {
        colorService.deleteColor(id);
        return ApiResponse.<Void>builder()
                .message("Delete color successfully")
                .build();
    }

    @GetMapping
    public ApiResponse<List<ColorResponse>> getAllColors(Pageable pageable) {
        return ApiResponse.<List<ColorResponse>>builder()
                .message("Get all colors by pageable successfully")
                .data(colorService.getAllColors(pageable))
                .build();
    }

    @GetMapping("/deleted")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<List<ColorResponse>> getAllDeletedColors() {
        return ApiResponse.<List<ColorResponse>>builder()
                .message("Get all deleted colors successfully")
                .data(colorService.getAllDeletedColors())
                .build();
    }

    @PutMapping("/restore/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<Void> restoreColor(@PathVariable Long id) {
        colorService.restoreColor(id);
        return ApiResponse.<Void>builder()
                .message("Restore color successfully")
                .build();
    }
}
