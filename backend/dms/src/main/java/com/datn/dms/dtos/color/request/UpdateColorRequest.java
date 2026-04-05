package com.datn.dms.dtos.color.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateColorRequest {
    Long id;
    String name;
    String hexCode;
}
