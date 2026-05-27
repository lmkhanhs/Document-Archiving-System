package com.datn.dms.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

	List<FileEntity> findAllByIsDeletedFalseOrderByCreatedAtDesc();

	List<FileEntity> findAllByIsDeletedTrueOrderByCreatedAtDesc();

	Optional<FileEntity> findByIdAndIsDeletedFalse(Long id);
	
	Optional<FileEntity> findByIdAndIsDeletedTrue(Long id);

	@Query("SELECT f FROM FileEntity f WHERE f.isDeleted = false " +
		   "AND (:fileName IS NULL OR LOWER(f.name) LIKE LOWER(CONCAT('%', :fileName, '%'))) " +
		   "AND (:uploader IS NULL OR LOWER(f.owner.username) LIKE LOWER(CONCAT('%', :uploader, '%'))) " +
		   "ORDER BY f.createdAt DESC")
	List<FileEntity> searchFilesAdmin(@Param("fileName") String fileName, @Param("uploader") String uploader);
}
