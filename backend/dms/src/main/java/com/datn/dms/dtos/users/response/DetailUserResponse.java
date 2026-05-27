package com.datn.dms.dtos.users.response;

import java.time.LocalDateTime;
import java.util.List;

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
public class DetailUserResponse {
    Long id;
    String username;
    String fullName;
    String email;
    String phone;
    String address;
    String city;
    boolean isActive;
    String thumbnailUrl;
    LocalDateTime createdAt;
    List<String> roles;

    // Gender info
    Long genderId;
    String genderName;

    // Country info
    Long countryId;
    String countryName;
    String countryThumbnailUrl;
}
