package com.datn.dms.dtos.users.response;

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
public class InfoUserResponse {
    Long id;
    String username;
    String password;   
    String email;
    String phone;
    String address;
    boolean isActive;
    String thumbnailUrl;
}
