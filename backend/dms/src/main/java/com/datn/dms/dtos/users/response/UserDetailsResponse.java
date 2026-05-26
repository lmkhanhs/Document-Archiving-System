package com.datn.dms.dtos.users.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@NoArgsConstructor
@Getter
@Setter
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class UserDetailsResponse {
    Long id;
    String username;
    String email;
    String phone;
    String address;
    boolean isActive;
    String thumbnailUrl;
    LocalDateTime createdAt;
}
