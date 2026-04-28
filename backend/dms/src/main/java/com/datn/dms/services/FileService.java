package com.datn.dms.services;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;

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
import com.datn.dms.dtos.files.request.UpdateFileRequest;
import com.datn.dms.dtos.files.response.CreateFileResponse;
import com.datn.dms.dtos.files.response.FileResponse;
import com.datn.dms.dtos.files.response.HomeDashboardResponse;
import com.datn.dms.dtos.files.response.HomeQuickAccessItemResponse;
import com.datn.dms.dtos.files.response.HomeRecentItemResponse;
import com.datn.dms.dtos.files.response.HomeStorageStatusResponse;
import com.datn.dms.dtos.files.response.HomeSuggestedItemResponse;
import com.datn.dms.entities.FileEntity;
import com.datn.dms.entities.FolderEntity;
import com.datn.dms.entities.UserEntity;
import com.datn.dms.exception.AppException;
import com.datn.dms.exception.ErrorCode;
import com.datn.dms.mapper.FileMapper;
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

    static final long DEFAULT_TOTAL_STORAGE_BYTES = 15L * 1024 * 1024 * 1024;

    final FileRepository fileRepository;
    final FolderRepository folderRepository;
    final UserRepository userRepository;
    final AuthenticationUtills authenticationUtills;
    final FileMapper fileMapper;

    @Value("${app.storage.upload-dir:uploads}")
    String uploadDir;

    @Value("${app.storage.total-bytes:16106127360}")
    long totalStorageBytes;

    public CreateFileResponse handleCreateFile(MultipartFile multipartFile, CreateFileRequest request) {
        if (multipartFile == null || multipartFile.isEmpty()) {
            throw new AppException(ErrorCode.FILE_EMPTY);
        }

        UserEntity owner = getCurrentUser();

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

    public HomeDashboardResponse getHomeDashboard(
            String search,
            String fileType,
            String time,
            String owner,
            String sort) {
        UserEntity currentUser = getCurrentUser();

        List<FileEntity> allFiles = fileRepository.findAllByOwner_IdAndIsDeletedFalseOrderByUpdatedAtDesc(currentUser.getId());
        List<FolderEntity> quickFolders = folderRepository.findTop8ByOwner_IdAndIsDeletedFalseOrderByUpdatedAtDesc(currentUser.getId());

        List<FileEntity> filteredFiles = allFiles.stream()
                .filter(file -> matchesSearch(file, search))
                .filter(file -> matchesType(file, fileType))
                .filter(file -> matchesTime(file, time))
                .filter(file -> matchesOwner(file, owner))
                .toList();

        Comparator<FileEntity> updatedSort = "asc".equalsIgnoreCase(sort)
                ? Comparator.comparing(FileEntity::getUpdatedAt, Comparator.nullsLast(Comparator.naturalOrder()))
                : Comparator.comparing(FileEntity::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder()));

        List<FileEntity> sortedFiles = filteredFiles.stream().sorted(updatedSort).toList();

        List<HomeRecentItemResponse> recent = sortedFiles.stream()
                .limit(20)
                .map(this::toRecentItem)
                .toList();

        Set<Long> recentIds = new HashSet<>(recent.stream().map(HomeRecentItemResponse::getId).toList());

        List<HomeSuggestedItemResponse> suggested = sortedFiles.stream()
                .sorted(Comparator
                        .comparing(FileEntity::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(FileEntity::getSize, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(8)
                .map(file -> toSuggestedItem(file, recentIds.contains(file.getId())))
                .toList();

        List<HomeQuickAccessItemResponse> quickFromFiles = sortedFiles.stream()
                .limit(6)
                .map(this::toQuickAccessFile)
                .toList();

        List<HomeQuickAccessItemResponse> quickFromFolders = quickFolders.stream()
                .filter(folder -> search == null || search.isBlank()
                        || folder.getName().toLowerCase().contains(search.trim().toLowerCase()))
                .limit(4)
                .map(folder -> HomeQuickAccessItemResponse.builder()
                        .id(folder.getId())
                        .itemType("FOLDER")
                        .fileType("FOLDER")
                        .name(folder.getName())
                        .lastAccessedAt(getEffectiveDate(folder.getUpdatedAt(), folder.getCreatedAt()))
                        .owner(currentUser.getUsername())
                        .size(0L)
                        .build())
                .toList();

        List<HomeQuickAccessItemResponse> quickAccess = Stream.concat(quickFromFiles.stream(), quickFromFolders.stream())
                .sorted(Comparator.comparing(HomeQuickAccessItemResponse::getLastAccessedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(8)
                .toList();

        long usedBytes = allFiles.stream().map(FileEntity::getSize).filter(Objects::nonNull).mapToLong(Long::longValue).sum();
        long finalTotal = totalStorageBytes > 0 ? totalStorageBytes : DEFAULT_TOTAL_STORAGE_BYTES;
        int usagePercent = (int) Math.min(100L, Math.round((usedBytes * 100.0) / finalTotal));

        HomeStorageStatusResponse storage = HomeStorageStatusResponse.builder()
                .usedBytes(usedBytes)
                .totalBytes(finalTotal)
                .usedText(formatBytes(usedBytes))
                .totalText(formatBytes(finalTotal))
                .usagePercent(usagePercent)
                .build();

        return HomeDashboardResponse.builder()
                .quickAccess(quickAccess)
                .recent(recent)
                .suggested(suggested)
                .storage(storage)
                .build();
    }

    public ResponseEntity<Resource> downloadFile(Long fileId) {
        UserEntity owner = getCurrentUser();

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

    public HomeRecentItemResponse renameFile(Long fileId, UpdateFileRequest request) {
        UserEntity owner = getCurrentUser();

        FileEntity fileEntity = fileRepository.findByIdAndOwner_IdAndIsDeletedFalse(fileId, owner.getId())
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        String nextName = request != null && request.getName() != null ? request.getName().trim() : "";
        if (nextName.isBlank()) {
            throw new AppException(ErrorCode.FILE_NAME_INVALID);
        }

        fileEntity.setName(nextName);
        fileEntity = fileRepository.save(fileEntity);

        return toRecentItem(fileEntity);
    }

    public void deleteFile(Long fileId) {
        UserEntity owner = getCurrentUser();

        FileEntity fileEntity = fileRepository.findByIdAndOwner_IdAndIsDeletedFalse(fileId, owner.getId())
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        fileEntity.setDeleted(true);
        fileEntity.setDeletedAt(java.time.LocalDateTime.now());
        fileRepository.save(fileEntity);
    }

    public FileResponse restoreFile(Long fileId) {
        UserEntity owner = getCurrentUser();

        FileEntity fileEntity = fileRepository.findByIdAndOwner_IdAndIsDeletedTrue(fileId, owner.getId())
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        fileEntity.setDeleted(false);
        fileEntity.setDeletedAt(null);
        fileEntity = fileRepository.save(fileEntity);

        return fileMapper.toFileResponse(fileEntity);
    }

    public List<FileResponse> getRootFiles() {
        UserEntity currentUser = getCurrentUser();
        return fileRepository.findAllByOwner_IdAndFolderIsNullAndIsDeletedFalseOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(fileMapper::toFileResponse)
                .toList();
    }

    public List<FileResponse> getFilesByFolderId(Long folderId) {
        UserEntity currentUser = getCurrentUser();
        
        folderRepository.findByIdAndOwner_IdAndIsDeletedFalse(folderId, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.FOLDER_NOT_FOUND));

        return fileRepository.findAllByOwner_IdAndFolder_IdAndIsDeletedFalseOrderByCreatedAtDesc(currentUser.getId(), folderId)
                .stream()
                .map(fileMapper::toFileResponse)
                .toList();
    }

    public List<FileResponse> getTrashFiles() {
        UserEntity currentUser = getCurrentUser();
        return fileRepository.findAllByOwner_IdAndIsDeletedTrueOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(fileMapper::toFileResponse)
                .toList();
    }

    private UserEntity getCurrentUser() {
        String username = authenticationUtills.getUserName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private HomeQuickAccessItemResponse toQuickAccessFile(FileEntity file) {
        return HomeQuickAccessItemResponse.builder()
                .id(file.getId())
                .itemType("FILE")
                .fileType(resolveFileType(file))
                .name(file.getName())
                .lastAccessedAt(getEffectiveDate(file.getUpdatedAt(), file.getCreatedAt()))
                .owner(file.getOwner() != null ? file.getOwner().getUsername() : "")
                .size(file.getSize())
                .url(file.getUrl())
                .build();
    }

    private HomeRecentItemResponse toRecentItem(FileEntity file) {
        return HomeRecentItemResponse.builder()
                .id(file.getId())
                .name(file.getName())
                .fileType(resolveFileType(file))
                .editedBy(file.getOwner() != null ? file.getOwner().getUsername() : "")
                .updatedAt(getEffectiveDate(file.getUpdatedAt(), file.getCreatedAt()))
                .size(file.getSize())
                .url(file.getUrl())
                .build();
    }

    private HomeSuggestedItemResponse toSuggestedItem(FileEntity file, boolean isRecent) {
        return HomeSuggestedItemResponse.builder()
                .id(file.getId())
                .name(file.getName())
                .fileType(resolveFileType(file))
                .owner(file.getOwner() != null ? file.getOwner().getUsername() : "")
                .updatedAt(getEffectiveDate(file.getUpdatedAt(), file.getCreatedAt()))
                .size(file.getSize())
                .reason(isRecent ? "File mở gần đây" : "File sử dụng thường xuyên")
                .url(file.getUrl())
                .build();
    }

    private boolean matchesSearch(FileEntity file, String search) {
        if (search == null || search.isBlank()) {
            return true;
        }

        return file.getName() != null && file.getName().toLowerCase().contains(search.trim().toLowerCase());
    }

    private boolean matchesType(FileEntity file, String fileType) {
        if (fileType == null || fileType.isBlank() || "all".equalsIgnoreCase(fileType)) {
            return true;
        }

        return resolveFileType(file).equalsIgnoreCase(fileType.trim());
    }

    private boolean matchesTime(FileEntity file, String time) {
        if (time == null || time.isBlank() || "all".equalsIgnoreCase(time)) {
            return true;
        }

        LocalDateTime updatedAt = getEffectiveDate(file.getUpdatedAt(), file.getCreatedAt());
        LocalDateTime now = LocalDateTime.now();

        return switch (time.toLowerCase()) {
            case "today" -> updatedAt.toLocalDate().isEqual(now.toLocalDate());
            case "7d", "7days" -> updatedAt.isAfter(now.minusDays(7));
            case "30d", "30days" -> updatedAt.isAfter(now.minusDays(30));
            default -> true;
        };
    }

    private boolean matchesOwner(FileEntity file, String owner) {
        if (owner == null || owner.isBlank()) {
            return true;
        }

        String username = file.getOwner() != null ? file.getOwner().getUsername() : "";
        return username.toLowerCase().contains(owner.trim().toLowerCase());
    }

    private LocalDateTime getEffectiveDate(LocalDateTime updatedAt, LocalDateTime createdAt) {
        return updatedAt != null ? updatedAt : createdAt;
    }

    private String resolveFileType(FileEntity file) {
        String name = file.getName() != null ? file.getName().toLowerCase() : "";
        String mime = file.getType() != null ? file.getType().toLowerCase() : "";

        if (name.endsWith(".pdf") || mime.contains("pdf")) {
            return "PDF";
        }

        if (name.endsWith(".doc") || name.endsWith(".docx") || mime.contains("word")) {
            return "DOCX";
        }

        if (name.endsWith(".xls") || name.endsWith(".xlsx") || mime.contains("sheet") || mime.contains("excel")) {
            return "EXCEL";
        }

        if (mime.startsWith("image/") || name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg")
                || name.endsWith(".gif") || name.endsWith(".webp")) {
            return "IMAGE";
        }

        return "FILE";
    }

    private String getFileExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == fileName.length() - 1) {
            return "";
        }
        return fileName.substring(dotIndex);
    }

    private String formatBytes(long bytes) {
        double value = bytes;
        String[] units = { "B", "KB", "MB", "GB", "TB" };
        int index = 0;

        while (value >= 1024 && index < units.length - 1) {
            value /= 1024;
            index++;
        }

        return String.format("%.1f %s", value, units[index]);
    }
}
