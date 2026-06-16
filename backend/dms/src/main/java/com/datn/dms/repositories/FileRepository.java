package com.datn.dms.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.datn.dms.entities.FileEntity;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, Long> {
	Optional<FileEntity> findByIdAndOwner_IdAndIsDeletedFalse(Long id, Long ownerId);

	List<FileEntity> findAllByOwner_IdAndIsDeletedFalseOrderByUpdatedAtDesc(Long ownerId);

	List<FileEntity> findAllByOwner_IdAndColorIsNotNullAndIsDeletedFalseOrderByUpdatedAtDesc(Long ownerId);

	List<FileEntity> findAllByOwner_IdAndColorIsNullAndIsDeletedFalseOrderByUpdatedAtDesc(Long ownerId);

	List<FileEntity> findAllByOwner_IdAndColor_IdAndIsDeletedFalseOrderByUpdatedAtDesc(Long ownerId, Long colorId);

	long countByOwner_IdAndColor_IdAndIsDeletedFalse(Long ownerId, Long colorId);

	List<FileEntity> findAllByOwner_IdAndFolderIsNullAndIsDeletedFalseOrderByCreatedAtDesc(Long ownerId);

	List<FileEntity> findAllByOwner_IdAndFolder_IdAndIsDeletedFalseOrderByCreatedAtDesc(Long ownerId, Long folderId);

	List<FileEntity> findAllByOwner_IdAndIsDeletedTrueOrderByCreatedAtDesc(Long ownerId);

	Optional<FileEntity> findByIdAndOwner_IdAndIsDeletedTrue(Long id, Long ownerId);

	List<FileEntity> findAllByIsDeletedFalseOrderByCreatedAtDesc();

	Page<FileEntity> findAllByIsDeletedFalseOrderByCreatedAtDesc(Pageable pageable);

	List<FileEntity> findAllByIsDeletedTrueOrderByCreatedAtDesc();

	Page<FileEntity> findAllByIsDeletedTrueOrderByCreatedAtDesc(Pageable pageable);

	Optional<FileEntity> findByIdAndIsDeletedFalse(Long id);
	
	Optional<FileEntity> findByIdAndIsDeletedTrue(Long id);

	@Query("SELECT f FROM FileEntity f WHERE f.isDeleted = false " +
		   "AND (:fileName IS NULL OR LOWER(f.name) LIKE LOWER(CONCAT('%', :fileName, '%'))) " +
		   "AND (:uploader IS NULL OR LOWER(f.owner.username) LIKE LOWER(CONCAT('%', :uploader, '%'))) " +
		   "ORDER BY f.createdAt DESC")
	List<FileEntity> searchFilesAdmin(@Param("fileName") String fileName, @Param("uploader") String uploader);

	@Query("SELECT f.name FROM FileEntity f")
	List<String> findAllFileNames();

	@Query("SELECT f.name FROM FileEntity f WHERE f.isDeleted = false " +
		   "AND f.owner.id = :ownerId " +
		   "AND ((:folderId IS NULL AND f.folder IS NULL) OR (:folderId IS NOT NULL AND f.folder.id = :folderId)) " +
		   "AND LOWER(f.name) LIKE LOWER(CONCAT('%', :extension))")
	List<String> findActiveFileNamesByOwnerAndFolderAndExtension(
			@Param("ownerId") Long ownerId,
			@Param("folderId") Long folderId,
			@Param("extension") String extension);

	long countByIsDeletedTrue();

	@Query("SELECT f.type, COUNT(f) FROM FileEntity f WHERE f.isDeleted = false GROUP BY f.type")
	List<Object[]> countFilesByType();

	@Query("SELECT f.createdAt FROM FileEntity f WHERE f.isDeleted = false AND f.createdAt >= :startDate")
	List<LocalDateTime> findCreatedAtAfter(@Param("startDate") LocalDateTime startDate);
}
