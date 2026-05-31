package com.datn.dms.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.datn.dms.dtos.users.request.UpdateProfileRequest;
import com.datn.dms.dtos.users.response.DetailUserResponse;
import com.datn.dms.dtos.users.response.InfoUserResponse;
import com.datn.dms.dtos.users.response.RegistrationGrowthResponse;
import com.datn.dms.dtos.users.response.UserDistributionResponse;
import com.datn.dms.dtos.users.response.UserStatisticsResponse;
import com.datn.dms.entities.CountryEntity;
import com.datn.dms.entities.GenderEntity;
import com.datn.dms.entities.RoleEntity;
import com.datn.dms.entities.UserEntity;
import com.datn.dms.mapper.UserMapper;
import com.datn.dms.repositories.CountryRepository;
import com.datn.dms.repositories.GenderRepository;
import com.datn.dms.repositories.UserRepository;
import com.datn.dms.utils.AuthenticationUtills;
import com.datn.dms.exception.AppException;
import com.datn.dms.exception.ErrorCode;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    UserMapper userMapper;
    UserRepository userRepository;
    AuthenticationUtills authenticationUtills;
    com.datn.dms.repositories.RoleRepository roleRepository;
    GenderRepository genderRepository;
    CountryRepository countryRepository;

    @NonFinal
    @Value("${app.storage.upload-dir:uploads}")
    String uploadDir;

    public InfoUserResponse getInfoUser() { 
        String username = this.authenticationUtills.getUserName();
        UserEntity userEntity = this.userRepository.findByUsername(username)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
                    
        return this.userMapper.toInfoUserResponse(userEntity);
    }

    public DetailUserResponse getDetailUser() {
        String username = this.authenticationUtills.getUserName();
        UserEntity userEntity = this.userRepository.findByUsername(username)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return this.userMapper.toDetailUserResponse(userEntity);
    }

    public DetailUserResponse updateProfile(UpdateProfileRequest request) {
        String username = this.authenticationUtills.getUserName();
        UserEntity userEntity = this.userRepository.findByUsername(username)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (request.getEmail() != null && (userEntity.getEmail() == null || userEntity.getEmail().trim().isEmpty())) {
            userEntity.setEmail(request.getEmail());
        }

        if (request.getFullName() != null) {
            userEntity.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            userEntity.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            userEntity.setAddress(request.getAddress());
        }
        if (request.getCity() != null) {
            userEntity.setCity(request.getCity());
        }
        if (request.getGenderId() != null) {
            GenderEntity gender = genderRepository.findById(request.getGenderId())
                    .orElseThrow(() -> new AppException(ErrorCode.GENDER_NOT_FOUND));
            userEntity.setGender(gender);
        }
        if (request.getCountryId() != null) {
            CountryEntity country = countryRepository.findById(request.getCountryId())
                    .orElseThrow(() -> new AppException(ErrorCode.COUNTRY_NOT_FOUND));
            userEntity.setCountry(country);
        }

        userEntity = this.userRepository.save(userEntity);
        return this.userMapper.toDetailUserResponse(userEntity);
    }

    public DetailUserResponse updateAvatar(MultipartFile file) throws IOException {
        String username = this.authenticationUtills.getUserName();
        UserEntity userEntity = this.userRepository.findByUsername(username)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Create avatars directory
        Path avatarsDir = Paths.get(uploadDir, "public", "avatars").toAbsolutePath().normalize();
        Files.createDirectories(avatarsDir);

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String newFileName = "avatar_" + userEntity.getId() + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;

        // Save file
        Path targetPath = avatarsDir.resolve(newFileName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        // Update thumbnailUrl
        String thumbnailUrl = "/uploads/public/avatars/" + newFileName;
        userEntity.setThumbnailUrl(thumbnailUrl);
        userEntity = this.userRepository.save(userEntity);

        return this.userMapper.toDetailUserResponse(userEntity);
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

    public UserStatisticsResponse getUserStatistics() {
        long totalUsers = userRepository.count();
        long totalAdmins = userRepository.countByRoles_Name("ADMIN");
        long totalNormalUsers = userRepository.countByRoles_Name("USER");
        long totalDeletedUsers = userRepository.countByIsDeletedTrue();

        return UserStatisticsResponse.builder()
                .totalUsers(totalUsers)
                .totalAdmins(totalAdmins)
                .totalNormalUsers(totalNormalUsers)
                .totalDeletedUsers(totalDeletedUsers)
                .build();
    }

    public UserDistributionResponse getUserDistribution() {
        long active = userRepository.countByIsActiveTrueAndIsDeletedFalse();
        long locked = userRepository.countByIsActiveFalseAndIsDeletedFalse();
        long deleted = userRepository.countByIsDeletedTrue();
        
        long admin = userRepository.countByRoles_NameAndIsDeletedFalse("ADMIN");
        long user = userRepository.countByRoles_NameAndIsDeletedFalse("USER");

        UserDistributionResponse.StatusDistribution statusDistribution = UserDistributionResponse.StatusDistribution.builder()
                .active(active)
                .locked(locked)
                .deleted(deleted)
                .build();

        UserDistributionResponse.RoleDistribution roleDistribution = UserDistributionResponse.RoleDistribution.builder()
                .admin(admin)
                .user(user)
                .build();

        return UserDistributionResponse.builder()
                .statusDistribution(statusDistribution)
                .roleDistribution(roleDistribution)
                .build();
    }

    public RegistrationGrowthResponse getRegistrationGrowth(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        List<UserEntity> users = userRepository.findByCreatedAtBetween(start, end);

        Map<LocalDate, Long> countByDate = users.stream()
                .map(u -> u.getCreatedAt().toLocalDate())
                .collect(Collectors.groupingBy(d -> d, Collectors.counting()));

        List<RegistrationGrowthResponse.DailyRegistration> registrations = new ArrayList<>();
        long totalUsers = 0;

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            long count = countByDate.getOrDefault(date, 0L);
            registrations.add(RegistrationGrowthResponse.DailyRegistration.builder()
                    .date(date)
                    .count(count)
                    .build());
            totalUsers += count;
        }

        return RegistrationGrowthResponse.builder()
                .startDate(startDate)
                .endDate(endDate)
                .totalUsers(totalUsers)
                .registrations(registrations)
                .build();
    }
}
