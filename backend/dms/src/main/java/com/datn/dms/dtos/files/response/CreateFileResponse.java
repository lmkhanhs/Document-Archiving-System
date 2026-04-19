package com.datn.dms.dtos.files.response;

import java.time.LocalDateTime;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateFileResponse {
    Long id;
    String name;
    String type;
    Long size;
    String url;
    Long folderId;
    Long ownerId;
    Boolean isDeleted;
    LocalDateTime createdAt;
}
