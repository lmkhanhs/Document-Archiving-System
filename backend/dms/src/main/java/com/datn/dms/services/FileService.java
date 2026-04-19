package com.datn.dms.services;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.nio.charset.StandardCharsets;
import java.net.URLEncoder;
import java.util.Objects;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.datn.dms.dtos.files.request.CreateFileRequest;
import com.datn.dms.dtos.files.response.CreateFileResponse;
import com.datn.dms.entities.FileEntity;
import com.datn.dms.entities.FolderEntity;
import com.datn.dms.entities.UserEntity;
import com.datn.dms.exception.AppException;
import com.datn.dms.exception.ErrorCode;
import com.datn.dms.repositories.FileRepository;
import com.datn.dms.repositories.FolderRepository;
import com.datn.dms.repositories.UserRepository;
import com.datn.dms.utils.AuthenticationUtills;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FileService {

    final FileRepository fileRepository;
    final FolderRepository folderRepository;
    final UserRepository userRepository;
    final AuthenticationUtills authenticationUtills;

    @Value("${app.storage.upload-dir:uploads}")
    String uploadDir;

    public CreateFileResponse uploadFile(MultipartFile multipartFile, CreateFileRequest request) {
        if (multipartFile == null || multipartFile.isEmpty()) {
            throw new AppException(ErrorCode.FILE_EMPTY);
        }

        String username = authenticationUtills.getUserName();
        UserEntity owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        FolderEntity folder = null;
        if (request != null && request.getFolderId() != null) {
            folder = folderRepository.findByIdAndOwner_IdAndIsDeletedFalse(request.getFolderId(), owner.getId())
                    .orElseThrow(() -> new AppException(ErrorCode.FOLDER_NOT_FOUND));
        }

        String originalName = Objects.requireNonNullElse(multipartFile.getOriginalFilename(), "file").trim();
        if (originalName.isBlank()) {
            throw new AppException(ErrorCode.FILE_NAME_INVALID);
        }

        String extension = getFileExtension(originalName);
        String storedName = UUID.randomUUID() + extension;

        String folderSegment = folder != null ? "folder-" + folder.getId() : "root";
        Path relativePath = Paths.get("users", String.valueOf(owner.getId()), folderSegment, storedName);
        Path destination = Paths.get(uploadDir).resolve(relativePath).normalize();

        try {
            Files.createDirectories(destination.getParent());
            Files.copy(multipartFile.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new AppException(ErrorCode.FILE_STORE_FAILED);
        }

        FileEntity fileEntity = new FileEntity();
        fileEntity.setName(originalName);
        fileEntity.setType(Objects.requireNonNullElse(multipartFile.getContentType(), "application/octet-stream"));
        fileEntity.setSize(multipartFile.getSize());
        fileEntity.setUrl("/uploads/" + relativePath.toString().replace('\\', '/'));
        fileEntity.setFolder(folder);
        fileEntity.setOwner(owner);
        fileEntity.setDeleted(false);

        fileEntity = fileRepository.save(fileEntity);

        return CreateFileResponse.builder()
                .id(fileEntity.getId())
                .name(fileEntity.getName())
                .type(fileEntity.getType())
                .size(fileEntity.getSize())
                .url(fileEntity.getUrl())
                .folderId(fileEntity.getFolder() != null ? fileEntity.getFolder().getId() : null)
                .ownerId(fileEntity.getOwner().getId())
                .isDeleted(fileEntity.isDeleted())
                .createdAt(fileEntity.getCreatedAt())
                .build();
    }

    public ResponseEntity<Resource> downloadFile(Long fileId) {
        String username = authenticationUtills.getUserName();
        UserEntity owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        FileEntity fileEntity = fileRepository.findByIdAndOwner_IdAndIsDeletedFalse(fileId, owner.getId())
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        String fileUrl = fileEntity.getUrl();
        String uploadPrefix = "/uploads/";
        if (fileUrl == null || !fileUrl.startsWith(uploadPrefix)) {
            throw new AppException(ErrorCode.FILE_PATH_INVALID);
        }

        String relativeFilePath = fileUrl.substring(uploadPrefix.length());
        Path baseDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path targetPath = baseDir.resolve(relativeFilePath).normalize();

        if (!targetPath.startsWith(baseDir)) {
            throw new AppException(ErrorCode.FILE_PATH_INVALID);
        }

        if (!Files.exists(targetPath) || !Files.isRegularFile(targetPath)) {
            throw new AppException(ErrorCode.FILE_NOT_FOUND);
        }

        Resource resource;
        try {
            resource = new UrlResource(targetPath.toUri());
        } catch (MalformedURLException ex) {
            throw new AppException(ErrorCode.FILE_PATH_INVALID);
        }

        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(fileEntity.getType());
        } catch (Exception ex) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        String encodedFileName = URLEncoder.encode(fileEntity.getName(), StandardCharsets.UTF_8)
                .replace("+", "%20");

        return ResponseEntity.ok()
                .contentType(mediaType)
                .contentLength(fileEntity.getSize())
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(encodedFileName, StandardCharsets.UTF_8).build().toString())
                .body(resource);
    }

    private String getFileExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == fileName.length() - 1) {
            return "";
        }
        return fileName.substring(dotIndex);
    }
}
