package com.datn.dms.dtos.files.response;

import java.time.LocalDateTime;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HomeQuickAccessItemResponse {
    Long id;
    String itemType;
    String fileType;
    String name;
    LocalDateTime lastAccessedAt;
    String owner;
    Long size;
    String url;
}
