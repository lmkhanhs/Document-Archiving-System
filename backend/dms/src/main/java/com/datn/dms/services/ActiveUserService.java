package com.datn.dms.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.datn.dms.entities.UserEntity;
import com.datn.dms.repositories.UserRepository;
import com.datn.dms.utils.BaseRedisUtils;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ActiveUserService {

    BaseRedisUtils baseRedisUtils;
    UserRepository userRepository;

    private static final String ACTIVE_USER_PREFIX = "active_user:";

    public void ping(String username) {
        // Cập nhật lastLogin
        userRepository.findByUsername(username).ifPresent(user -> {
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
        });

        // Lưu vào Redis, TTL 3 phút
        baseRedisUtils.set(ACTIVE_USER_PREFIX + username, true, 3L, TimeUnit.MINUTES);
    }

    public List<UserEntity> getActiveUsers() {
        Set<String> keys = baseRedisUtils.getKeys(ACTIVE_USER_PREFIX + "*");
        if (keys == null || keys.isEmpty()) {
            return List.of();
        }

        List<String> activeUsernames = keys.stream()
                .map(key -> key.substring(ACTIVE_USER_PREFIX.length()))
                .collect(Collectors.toList());

        return userRepository.findAllByUsernameIn(activeUsernames);
    }
    public int getActiveUserCount() {
        return getActiveUsers().size();
    }
}
