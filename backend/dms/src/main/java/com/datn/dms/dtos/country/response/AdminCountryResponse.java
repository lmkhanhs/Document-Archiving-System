package com.datn.dms.dtos.country.response;

import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminCountryResponse {
    Long id;
    String flag;
    String isoCode;
    String name;
    Integer userCount;
    Boolean active;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
