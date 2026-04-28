package com.datn.dms.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.datn.dms.entities.FileEntity;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, Long> {
	Optional<FileEntity> findByIdAndOwner_IdAndIsDeletedFalse(Long id, Long ownerId);

	List<FileEntity> findAllByOwner_IdAndIsDeletedFalseOrderByUpdatedAtDesc(Long ownerId);

	List<FileEntity> findAllByOwner_IdAndFolderIsNullAndIsDeletedFalseOrderByCreatedAtDesc(Long ownerId);

	List<FileEntity> findAllByOwner_IdAndFolder_IdAndIsDeletedFalseOrderByCreatedAtDesc(Long ownerId, Long folderId);

	List<FileEntity> findAllByOwner_IdAndIsDeletedTrueOrderByCreatedAtDesc(Long ownerId);

	Optional<FileEntity> findByIdAndOwner_IdAndIsDeletedTrue(Long id, Long ownerId);
}
