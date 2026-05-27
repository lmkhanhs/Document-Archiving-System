package com.datn.dms.dtos.gender.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GenderResponse {
    Long id;
    String name;
    String thumbnailUrl;
}
