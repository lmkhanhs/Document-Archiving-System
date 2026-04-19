package com.datn.dms.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.datn.dms.entities.FileEntity;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, Long> {
	Optional<FileEntity> findByIdAndOwner_IdAndIsDeletedFalse(Long id, Long ownerId);
}
