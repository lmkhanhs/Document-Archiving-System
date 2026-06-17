package com.datn.dms.dtos.summary.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class SummaryHistoryItemResponse {
    private Long id;
    private String title;
    private String inputType; 
    private String username;
    private String thumbnailUrl;
    private LocalDateTime createdAt;
    private String fileSize;
    private String status;
    private String errorMessage;
    private String originalPreview;
    private String summaryPreview;
}
