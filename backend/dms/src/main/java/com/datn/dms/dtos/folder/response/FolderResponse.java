package com.datn.dms.dtos.folder.response;

import java.time.LocalDateTime;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FolderResponse {
    Long id;
    String name;
    String path;
    Long parentId;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
