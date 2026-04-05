package com.datn.dms.repositories;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.datn.dms.entities.ColorEntity;

@Repository
public interface ColorRepository extends JpaRepository<ColorEntity, Long> {
    Optional<ColorEntity> findByHexCode(String hexCode);
    Page<ColorEntity> findAllByIsDeletedFalse(Pageable pageable);
}
