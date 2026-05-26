package com.datn.dms.repositories;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.datn.dms.entities.UserEntity;

@Repository
public interface UserRepository extends JpaRepository<UserEntity,  Long> {
    Optional<UserEntity> findByUsername(String username);
    Optional<UserEntity> findByEmail(String email);
    List<UserEntity> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(String username, String email);
    
    @Query("SELECT DISTINCT u FROM UserEntity u LEFT JOIN u.roles r WHERE (:role IS NULL OR r.name = :role) AND (:isActive IS NULL OR u.isActive = :isActive)")
    List<UserEntity> filterUsers(@Param("role") String role, @Param("isActive") Boolean isActive);
    
    List<UserEntity> findByIsDeletedTrue();

    List<UserEntity> findAllByIsDeletedFalse();
}
