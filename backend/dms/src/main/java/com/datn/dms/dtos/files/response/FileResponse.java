package com.datn.dms.dtos.files.response;

import java.time.LocalDateTime;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FileResponse {
    String id;
    String name;
    String type;
    Long size;
    String url;
    Long folderId;
    String colorCode;
    LocalDateTime createdAt;
    LocalDateTime deletedAt;
}
