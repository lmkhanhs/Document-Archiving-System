package com.datn.dms.dtos.country.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CountryResponse {
    Long id;
    String name;
    String thumbnailUrl;
}
