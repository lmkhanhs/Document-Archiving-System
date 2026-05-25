package com.datn.dms.dtos.auth.response;

import java.util.List;


import lombok.*;
import lombok.experimental.FieldDefaults;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RolesResponse {
    List<String> roles;
}
