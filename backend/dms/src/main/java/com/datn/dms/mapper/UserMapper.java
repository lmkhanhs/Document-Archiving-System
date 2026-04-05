package com.datn.dms.mapper;

import org.mapstruct.Mapper;

import com.datn.dms.dtos.users.request.CreateUserRequest;
import com.datn.dms.dtos.users.response.CreateUserResponse;
import com.datn.dms.dtos.users.response.InfoUserResponse;
import com.datn.dms.entities.UserEntity;

@Mapper(componentModel = "spring")
public abstract class UserMapper {
    public abstract UserEntity toUserEntity(CreateUserRequest createUserRequest);
    public abstract CreateUserResponse toCreateUserResponse(UserEntity userEntity);

    public abstract InfoUserResponse toInfoUserResponse(UserEntity userEntity);
}
