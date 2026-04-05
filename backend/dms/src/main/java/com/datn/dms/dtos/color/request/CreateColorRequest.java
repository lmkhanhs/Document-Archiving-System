package com.datn.dms.dtos.color.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateColorRequest {
    String name;
    String hexCode;
}
