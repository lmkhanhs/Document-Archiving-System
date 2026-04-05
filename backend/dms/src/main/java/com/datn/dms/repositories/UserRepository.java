package com.datn.dms.repositories;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.datn.dms.entities.UserEntity;

@Repository
public interface UserRepository extends JpaRepository<UserEntity,  Long> {
    Optional<UserEntity> findByUsername(String username);
}
