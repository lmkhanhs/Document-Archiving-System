package com.datn.dms.dtos.statistics.response;

import java.time.LocalDateTime;

public interface RecentActivityProjection {
    Long getId();
    String getType();
    String getTitle();
    String getStatus();
    LocalDateTime getCreatedAt();
}
