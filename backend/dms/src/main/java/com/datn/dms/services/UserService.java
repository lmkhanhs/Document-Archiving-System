package com.datn.dms.services;

import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.datn.dms.dtos.users.request.CreateUserRequest;
import com.datn.dms.dtos.users.response.CreateUserResponse;
import com.datn.dms.dtos.users.response.InfoUserResponse;
import com.datn.dms.entities.RoleEntity;
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
    com.datn.dms.repositories.RoleRepository roleRepository;

    // public CreateUserResponse createUser(CreateUserRequest request) {
    //     UserEntity userEntity = this.userMapper.toUserEntity(request);
    //     userEntity.setEmail("123@gmail.com");
    //     userEntity.setPhone("123456789");
    //     userEntity.setAddress("123 Main St");
    //     userEntity = this.userRepository.save(userEntity);
    //     return this.userMapper.toCreateUserResponse(userEntity);
    // }

    public InfoUserResponse getInfoUser() { 
        String username = this.authenticationUtills.getUserName();
        UserEntity userEntity = this.userRepository.findByUsername(username)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
                    
        return this.userMapper.toInfoUserResponse(userEntity);
    }

    public List<InfoUserResponse> getAllUsers(org.springframework.data.domain.Pageable pageable) {
        return this.userRepository.findAllByIsDeletedFalse().stream()
                .map(this.userMapper::toInfoUserResponse)
                .toList();
    }
    public List<InfoUserResponse> searchUsers(String keyword) {
        return this.userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(keyword, keyword).stream()
                .map(this.userMapper::toInfoUserResponse)
                .toList();
    }

    public List<InfoUserResponse> filterUsers(String role, String status) {
        Boolean isActive = null;
        if ("ACTIVE".equalsIgnoreCase(status)) {
            isActive = true;
        } else if ("LOCKED".equalsIgnoreCase(status)) {
            isActive = false;
        }
        
        return this.userRepository.filterUsers(role, isActive).stream()
                .map(this.userMapper::toInfoUserResponse)
                .toList();
    }

    public InfoUserResponse updateRoles(Long userId, String roleName) {
        UserEntity userEntity = this.userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        List<String> targetRoles = "ADMIN".equalsIgnoreCase(roleName) 
                ? List.of("ADMIN", "USER") 
                : List.of("USER");
                
        Set<RoleEntity> roles = this.roleRepository.findByNameIn(targetRoles);
        userEntity.setRoles(roles);
        userEntity = this.userRepository.save(userEntity);
        
        return this.userMapper.toInfoUserResponse(userEntity);
    }

    public InfoUserResponse updateStatus(Long userId, boolean isActive) {
        UserEntity userEntity = this.userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        userEntity.setActive(isActive);
        userEntity = this.userRepository.save(userEntity);
        
        return this.userMapper.toInfoUserResponse(userEntity);
    }

    public void softDeleteUser(Long userId) {
        UserEntity userEntity = this.userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        userEntity.setDeleted(true);
        this.userRepository.save(userEntity);
    }

    public void restoreUser(Long userId) {
        UserEntity userEntity = this.userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        userEntity.setDeleted(false);
        this.userRepository.save(userEntity);
    }

    public void hardDeleteUser(Long userId) {
        if (!this.userRepository.existsById(userId)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        this.userRepository.deleteById(userId);
    }

    public List<InfoUserResponse> getSoftDeletedUsers() {
        return this.userRepository.findByIsDeletedTrue().stream()
                .map(this.userMapper::toInfoUserResponse)
                .toList();
    }
}
