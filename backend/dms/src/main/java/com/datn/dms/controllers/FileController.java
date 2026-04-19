package com.datn.dms.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.datn.dms.dtos.ApiResponse;
import com.datn.dms.dtos.files.request.CreateFileRequest;
import com.datn.dms.dtos.files.response.CreateFileResponse;
import com.datn.dms.services.FileService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("${app.prefix}/files")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FileController {
    FileService fileService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CreateFileResponse> uploadFile(
            @RequestPart("file") MultipartFile file,
            @ModelAttribute CreateFileRequest request) {
        return ApiResponse.<CreateFileResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Upload file successfully")
                .data(fileService.uploadFile(file, request))
                .build();
    }

    @GetMapping("/{fileId}/download")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long fileId) {
        return fileService.downloadFile(fileId);
    }
}
