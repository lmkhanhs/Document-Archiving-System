package com.datn.dms.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.datn.dms.dtos.ApiResponse;
import com.datn.dms.dtos.documents.response.DeletedDocumentCountResponse;
import com.datn.dms.dtos.documents.response.FileTypeRatioResponse;
import com.datn.dms.dtos.documents.response.RecentUploadsResponse;
import com.datn.dms.dtos.documents.response.TotalDocumentCountResponse;
import com.datn.dms.services.AdminDocumentService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("${app.prefix}/admin/documents")
public class AdminDocumentController {

    AdminDocumentService adminDocumentService;

    @GetMapping("/total-count")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<TotalDocumentCountResponse>> getTotalDocumentsCount() {
        long totalDocuments = adminDocumentService.getTotalDocuments();
        
        return ResponseEntity.ok(ApiResponse.<TotalDocumentCountResponse>builder()
                .code(200)
                .message("Get total documents successfully")
                .data(new TotalDocumentCountResponse(totalDocuments))
                .build());
    }

    @GetMapping("/deleted-count")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<DeletedDocumentCountResponse>> getDeletedDocumentsCount() {
        long deletedDocuments = adminDocumentService.getDeletedDocuments();
        
        return ResponseEntity.ok(ApiResponse.<DeletedDocumentCountResponse>builder()
                .code(200)
                .message("Get deleted documents successfully")
                .data(new DeletedDocumentCountResponse(deletedDocuments))
                .build());
    }

    @GetMapping("/file-type-ratio")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<FileTypeRatioResponse>>> getFileTypeRatio() {
        List<FileTypeRatioResponse> ratios = adminDocumentService.getFileTypeRatio();
        
        return ResponseEntity.ok(ApiResponse.<List<FileTypeRatioResponse>>builder()
                .code(200)
                .message("Get file type ratio successfully")
                .data(ratios)
                .build());
    }

    @GetMapping("/recent-uploads")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<RecentUploadsResponse>>> getRecentUploads(
            @RequestParam(name = "days", defaultValue = "7") int days) {
        
        List<RecentUploadsResponse> recentUploads = adminDocumentService.getRecentUploads(days);
        
        return ResponseEntity.ok(ApiResponse.<List<RecentUploadsResponse>>builder()
                .code(200)
                .message("Get recent uploads successfully")
                .data(recentUploads)
                .build());
    }
}
