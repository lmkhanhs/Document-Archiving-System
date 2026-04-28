package com.datn.dms.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.datn.dms.dtos.folder.request.CreateFolderRequest;
import com.datn.dms.dtos.folder.request.UpdateFolderRequest;
import com.datn.dms.dtos.folder.response.CreateFolderResponse;
import com.datn.dms.dtos.folder.response.FolderResponse;
import com.datn.dms.entities.FolderEntity;
import com.datn.dms.entities.UserEntity;
import com.datn.dms.exception.AppException;
import com.datn.dms.exception.ErrorCode;
import com.datn.dms.mapper.FolderMapper;
import com.datn.dms.repositories.FolderRepository;
import com.datn.dms.repositories.UserRepository;
import com.datn.dms.utils.AuthenticationUtills;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FolderService {
    FolderRepository folderRepository;
    UserRepository userRepository;
    AuthenticationUtills authenticationUtills;
    FolderMapper folderMapper;

    public CreateFolderResponse createFolder(CreateFolderRequest request) {
        String username = authenticationUtills.getUserName();
        UserEntity owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        String folderName = request.getName() == null ? "" : request.getName().trim();
        if (folderName.isBlank()) {
            throw new AppException(ErrorCode.FOLDER_NAME_INVALID);
        }

        FolderEntity parent = null;
        Long parentId = request.getParentId();

        if (parentId != null) {
            parent = folderRepository.findByIdAndOwner_IdAndIsDeletedFalse(parentId, owner.getId())
                    .orElseThrow(() -> new AppException(ErrorCode.FOLDER_NOT_FOUND));

            boolean existed = folderRepository.existsByOwner_IdAndParent_IdAndNameAndIsDeletedFalse(
                    owner.getId(),
                    parent.getId(),
                    folderName);
            if (existed) {
                throw new AppException(ErrorCode.FOLDER_EXISTED);
            }
        } else {
                boolean existed = folderRepository.existsByOwner_IdAndParentIsNullAndNameAndIsDeletedFalse(
                    owner.getId(),
                    folderName);
            if (existed) {
                throw new AppException(ErrorCode.FOLDER_EXISTED);
            }
        }

        String path = buildPath(parent, folderName);

        FolderEntity folderEntity = FolderEntity.builder()
                .name(folderName)
                .path(path)
                .parent(parent)
                .owner(owner)
                .isDeleted(false)
                .build();

        folderEntity = folderRepository.save(folderEntity);

        return CreateFolderResponse.builder()
                .id(folderEntity.getId())
                .name(folderEntity.getName())
                .path(folderEntity.getPath())
                .parentId(folderEntity.getParent() != null ? folderEntity.getParent().getId() : null)
                .ownerId(folderEntity.getOwner().getId())
                .isDeleted(folderEntity.isDeleted())
                .createdAt(folderEntity.getCreatedAt())
                .build();
    }

    private String buildPath(FolderEntity parent, String folderName) {
        if (parent == null || parent.getPath() == null || parent.getPath().isBlank()) {
            return "/" + folderName;
        }
        return parent.getPath() + "/" + folderName;
    }

    public List<FolderResponse> getAllActiveFolders() {
        String username = authenticationUtills.getUserName();
        UserEntity owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return folderRepository.findAllByOwner_IdAndIsDeletedFalseOrderByCreatedAtDesc(owner.getId())
                .stream()
                .map(folderMapper::toFolderResponse)
                .toList();
    }

    public List<FolderResponse> getActiveFoldersByParentId(Long folderId) {
        String username = authenticationUtills.getUserName();
        UserEntity owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        folderRepository.findByIdAndOwner_IdAndIsDeletedFalse(folderId, owner.getId())
                .orElseThrow(() -> new AppException(ErrorCode.FOLDER_NOT_FOUND));

        return folderRepository.findAllByOwner_IdAndParent_IdAndIsDeletedFalseOrderByCreatedAtDesc(owner.getId(), folderId)
                .stream()
                .map(folderMapper::toFolderResponse)
                .toList();
    }

    public List<FolderResponse> getActiveRootFolders() {
        String username = authenticationUtills.getUserName();
        UserEntity owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return folderRepository.findAllByOwner_IdAndParentIsNullAndIsDeletedFalseOrderByCreatedAtDesc(owner.getId())
                .stream()
                .map(folderMapper::toFolderResponse)
                .toList();
    }

    public FolderResponse updateFolder(Long folderId, UpdateFolderRequest request) {
        String username = authenticationUtills.getUserName();
        UserEntity owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        FolderEntity folderEntity = folderRepository.findByIdAndOwner_IdAndIsDeletedFalse(folderId, owner.getId())
                .orElseThrow(() -> new AppException(ErrorCode.FOLDER_NOT_FOUND));

        folderMapper.updateFolderFromRequest(request, folderEntity);
        folderEntity = folderRepository.save(folderEntity);

        return folderMapper.toFolderResponse(folderEntity);
    }

    public FolderResponse restoreFolder(Long folderId) {
        String username = authenticationUtills.getUserName();
        UserEntity owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        FolderEntity folderEntity = folderRepository.findByIdAndOwner_IdAndIsDeletedTrue(folderId, owner.getId())
                .orElseThrow(() -> new AppException(ErrorCode.FOLDER_NOT_FOUND));

        folderEntity.setDeleted(false);
        folderEntity.setDeletedAt(null);
        folderEntity = folderRepository.save(folderEntity);

        return folderMapper.toFolderResponse(folderEntity);
    }

    public void deleteFolder(Long folderId) {
        String username = authenticationUtills.getUserName();
        UserEntity owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        FolderEntity folderEntity = folderRepository.findByIdAndOwner_IdAndIsDeletedFalse(folderId, owner.getId())
                .orElseThrow(() -> new AppException(ErrorCode.FOLDER_NOT_FOUND));

        folderEntity.setDeleted(true);
        folderEntity.setDeletedAt(java.time.LocalDateTime.now());
        folderRepository.save(folderEntity);
    }

    public List<FolderResponse> getTrashFolders() {
        String username = authenticationUtills.getUserName();
        UserEntity owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return folderRepository.findAllByOwner_IdAndIsDeletedTrueOrderByCreatedAtDesc(owner.getId())
                .stream()
                .map(folderMapper::toFolderResponse)
                .toList();
    }
}