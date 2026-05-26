package com.datn.dms.mapper;

import java.util.List;
import java.util.Set;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.mapstruct.Named;

import com.datn.dms.dtos.users.request.CreateUserRequest;
import com.datn.dms.dtos.users.response.CreateUserResponse;
import com.datn.dms.dtos.users.response.InfoUserResponse;
import com.datn.dms.entities.RoleEntity;
import com.datn.dms.entities.UserEntity;

@Mapper(componentModel = "spring")
public abstract class UserMapper {
    public abstract UserEntity toUserEntity(CreateUserRequest createUserRequest);
    public abstract CreateUserResponse toCreateUserResponse(UserEntity userEntity);

    @Mappings({
        @Mapping(target = "roles", source = "roles", qualifiedByName = "mapRolesToName")
    })
    public abstract InfoUserResponse toInfoUserResponse(UserEntity userEntity);

    @Named("mapRolesToName")
    protected List<String> mapRolesToName(Set<RoleEntity> roles) {
        if (roles == null || roles.isEmpty()) {
            return List.of();
        }
        return roles.stream().map(RoleEntity::getName).toList();
    }
}
