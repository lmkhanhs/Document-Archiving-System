package com.datn.dms.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.datn.dms.entities.GenderEntity;

@Repository
public interface GenderRepository extends JpaRepository<GenderEntity, Long> {
    Optional<GenderEntity> findByName(String name);
}
