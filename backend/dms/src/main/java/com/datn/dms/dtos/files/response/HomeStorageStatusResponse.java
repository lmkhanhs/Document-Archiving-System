package com.datn.dms.dtos.files.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HomeStorageStatusResponse {
    Long usedBytes;
    Long totalBytes;
    String usedText;
    String totalText;
    int usagePercent;
}
