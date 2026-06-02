package com.datn.dms.dtos.statistics.response;

import java.time.LocalDateTime;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TopActiveUserResponse {
    Long userId;
    String username;
    String thumbnailUrl;
    long uploadedDocuments;
    long summaryCount;
    LocalDateTime lastActiveAt;
}
