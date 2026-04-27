package com.datn.dms.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.datn.dms.entities.FolderEntity;

@Repository
public interface FolderRepository extends JpaRepository<FolderEntity, Long> {
    Optional<FolderEntity> findByIdAndOwner_IdAndIsDeletedFalse(Long id, Long ownerId);

    List<FolderEntity> findAllByOwner_IdAndIsDeletedFalseOrderByCreatedAtDesc(Long ownerId);

    List<FolderEntity> findAllByOwner_IdAndParent_IdAndIsDeletedFalseOrderByCreatedAtDesc(Long ownerId, Long parentId);

    List<FolderEntity> findAllByOwner_IdAndParentIsNullAndIsDeletedFalseOrderByCreatedAtDesc(Long ownerId);

    List<FolderEntity> findTop8ByOwner_IdAndIsDeletedFalseOrderByUpdatedAtDesc(Long ownerId);

    boolean existsByOwner_IdAndParent_IdAndNameAndIsDeletedFalse(Long ownerId, Long parentId, String name);

    boolean existsByOwner_IdAndParentIsNullAndNameAndIsDeletedFalse(Long ownerId, String name);

    Optional<FolderEntity> findByIdAndOwner_IdAndIsDeletedTrue(Long id, Long ownerId);
}
