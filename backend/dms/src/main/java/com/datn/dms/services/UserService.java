package com.datn.dms.services;

import org.springframework.stereotype.Service;

import com.datn.dms.dtos.users.request.CreateUserRequest;
import com.datn.dms.dtos.users.response.CreateUserResponse;
import com.datn.dms.dtos.users.response.InfoUserResponse;
import com.datn.dms.entities.UserEntity;
import com.datn.dms.mapper.UserMapper;
import com.datn.dms.repositories.UserRepository;
import com.datn.dms.utils.AuthenticationUtills;
import com.datn.dms.exception.AppException;
import com.datn.dms.exception.ErrorCode;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    UserMapper userMapper;
    UserRepository userRepository;
    AuthenticationUtills authenticationUtills;

    public CreateUserResponse createUser(CreateUserRequest request) {
        UserEntity userEntity = this.userMapper.toUserEntity(request);
        userEntity.setEmail("123@gmail.com");
        userEntity.setPhone("123456789");
        userEntity.setAddress("123 Main St");
        userEntity = this.userRepository.save(userEntity);
        return this.userMapper.toCreateUserResponse(userEntity);
    }

    public InfoUserResponse getInfoUser() { 
        String username = this.authenticationUtills.getUserName();
        UserEntity userEntity = this.userRepository.findByUsername(username)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
                    
        return this.userMapper.toInfoUserResponse(userEntity);
    }
}
