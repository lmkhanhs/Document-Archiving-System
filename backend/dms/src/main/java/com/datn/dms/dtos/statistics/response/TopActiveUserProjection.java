package com.datn.dms.dtos.statistics.response;

import java.time.LocalDateTime;

public interface TopActiveUserProjection {
    Long getUserId();
    String getUsername();
    String getEmail();
    String getThumbnailUrl();
    Long getUploadedDocuments();
    Long getSummaryCount();
    LocalDateTime getLastActiveAt();
}
