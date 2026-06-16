package com.datn.dms.dtos.color.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ColorSummaryResponse {
    Long id;
    String name;
    String hexCode;
    Integer position;
    Long fileCount;
}
