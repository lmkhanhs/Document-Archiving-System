package com.datn.dms.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import com.datn.dms.dtos.ApiResponse;
import com.datn.dms.dtos.files.request.CreateFileRequest;
import com.datn.dms.dtos.files.request.UpdateFileRequest;
import com.datn.dms.dtos.files.response.CreateFileResponse;
import com.datn.dms.dtos.files.response.FileResponse;
import com.datn.dms.dtos.files.response.HomeDashboardResponse;
import com.datn.dms.dtos.files.response.HomeRecentItemResponse;
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
                .data(fileService.handleCreateFile(file, request))
                .build();
    }

    @GetMapping("/home")
    public ApiResponse<HomeDashboardResponse> getHomeDashboard(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String fileType,
            @RequestParam(required = false) String time,
            @RequestParam(required = false) String owner,
            @RequestParam(required = false, defaultValue = "desc") String sort) {
        return ApiResponse.<HomeDashboardResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get home dashboard successfully")
                .data(fileService.getHomeDashboard(search, fileType, time, owner, sort))
                .build();
    }

    @GetMapping("/{fileId}/download")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long fileId) {
        return fileService.downloadFile(fileId);
    }

    @PutMapping("/{fileId}")
    public ApiResponse<HomeRecentItemResponse> renameFile(
            @PathVariable Long fileId,
            @RequestBody UpdateFileRequest request) {
        return ApiResponse.<HomeRecentItemResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Rename file successfully")
                .data(fileService.renameFile(fileId, request))
                .build();
    }

    @DeleteMapping("/{fileId}")
    public ApiResponse<Void> deleteFile(@PathVariable Long fileId) {
        fileService.deleteFile(fileId);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Delete file successfully")
                .build();
    }

    @PutMapping("/restore/{fileId}")
    public ApiResponse<FileResponse> restoreFile(@PathVariable Long fileId) {
        return ApiResponse.<FileResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Restore file successfully")
                .data(fileService.restoreFile(fileId))
                .build();
    }

    @GetMapping("/root")
    public ApiResponse<List<FileResponse>> getRootFiles() {
        return ApiResponse.<List<FileResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get root files successfully")
                .data(fileService.getRootFiles())
                .build();
    }

    @GetMapping("/folder/{folderId}")
    public ApiResponse<List<FileResponse>> getFilesByFolderId(@PathVariable Long folderId) {
        return ApiResponse.<List<FileResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get files by folder id successfully")
                .data(fileService.getFilesByFolderId(folderId))
                .build();
    }

    @GetMapping("/trash")
    public ApiResponse<List<FileResponse>> getTrashFiles() {
        return ApiResponse.<List<FileResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get trash files successfully")
                .data(fileService.getTrashFiles())
                .build();
    }
    
}
