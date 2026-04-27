package com.datn.dms.dtos.files.response;

import java.time.LocalDateTime;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HomeRecentItemResponse {
    Long id;
    String name;
    String fileType;
    String editedBy;
    LocalDateTime updatedAt;
    Long size;
    String url;
}
