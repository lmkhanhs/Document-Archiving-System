package com.datn.dms.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.mapstruct.Named;

import com.datn.dms.dtos.summary.response.SummaryHistoryItemResponse;
import com.datn.dms.dtos.summary.response.SummaryHistoryDetailResponse;
import com.datn.dms.entities.SummaryEntity;

@Mapper(componentModel = "spring")
public abstract class SummaryMapper {

    @Mappings({
        @Mapping(target = "title", source = ".", qualifiedByName = "mapTitle"),
        @Mapping(target = "inputType", source = "summaryType"),
        @Mapping(target = "username", source = ".", qualifiedByName = "mapUsername"),
        @Mapping(target = "thumbnailUrl", source = "user.thumbnailUrl"),
        @Mapping(target = "fileSize", source = ".", qualifiedByName = "mapFileSize"),
        @Mapping(target = "status", source = ".", qualifiedByName = "mapStatus"),
        @Mapping(target = "originalPreview", source = ".", qualifiedByName = "mapOriginalContent"),
        @Mapping(target = "summaryPreview", source = "summaryContent")
    })
    public abstract SummaryHistoryItemResponse toSummaryHistoryItemResponse(SummaryEntity entity);

    @Mappings({
        @Mapping(target = "title", source = ".", qualifiedByName = "mapTitle"),
        @Mapping(target = "inputType", source = "summaryType"),
        @Mapping(target = "fileId", source = "file.id"),
        @Mapping(target = "fileName", source = "file.name"),
        @Mapping(target = "username", source = ".", qualifiedByName = "mapUsername"),
        @Mapping(target = "thumbnailUrl", source = "user.thumbnailUrl"),
        @Mapping(target = "aiModel", source = "model"),
        @Mapping(target = "summaryType", constant = "Chi tiết"),
        @Mapping(target = "fileSize", source = ".", qualifiedByName = "mapFileSize"),
        @Mapping(target = "status", source = ".", qualifiedByName = "mapStatus"),
        @Mapping(target = "processingTimeSeconds", source = "duration"),
        @Mapping(target = "compressionRate", source = ".", qualifiedByName = "mapCompressionRate"),
        @Mapping(target = "originalContent", source = ".", qualifiedByName = "mapOriginalContent")
    })
    public abstract SummaryHistoryDetailResponse toSummaryHistoryDetailResponse(SummaryEntity entity);

    @Named("mapTitle")
    protected String mapTitle(SummaryEntity entity) {
        if ("FILE".equalsIgnoreCase(entity.getSummaryType()) && entity.getFile() != null) {
            return entity.getFile().getName();
        } else if ("TEXT".equalsIgnoreCase(entity.getSummaryType()) && entity.getOriginalContent() != null) {
            String content = entity.getOriginalContent().trim();
            return content.length() > 30 ? content.substring(0, 30) + "..." : content;
        }
        return "Không có tiêu đề";
    }

    @Named("mapOriginalContent")
    protected String mapOriginalContent(SummaryEntity entity) {
        if (entity == null) {
            return "";
        }

        if ("TEXT".equalsIgnoreCase(entity.getSummaryType())) {
            return entity.getOriginalContent() != null ? entity.getOriginalContent() : "";
        }

        if (entity.getOriginalContent() != null && !entity.getOriginalContent().isBlank()) {
            return entity.getOriginalContent();
        }

        if ("FILE".equalsIgnoreCase(entity.getSummaryType()) && entity.getFile() != null) {
            return "File: " + entity.getFile().getName();
        }

        return "";
    }

    @Named("mapUsername")
    protected String mapUsername(SummaryEntity entity) {
        if (entity.getUser() != null) {
            return entity.getUser().getUsername() != null ? entity.getUser().getUsername() : entity.getUser().getEmail();
        }
        return "Unknown";
    }

    @Named("mapFileSize")
    protected String mapFileSize(SummaryEntity entity) {
        if (!"FILE".equalsIgnoreCase(entity.getSummaryType()) || entity.getFile() == null) {
            return null;
        }
        Long bytes = entity.getFile().getSize();
        if (bytes == null || bytes == 0) return "0 B";
        String[] units = {"B", "KB", "MB", "GB", "TB"};
        int index = (int) (Math.log(bytes) / Math.log(1024));
        if (index >= units.length) index = units.length - 1;
        double size = bytes / Math.pow(1024, index);
        return String.format("%.1f %s", size, units[index]).replace(",", ".");
    }

    @Named("mapStatus")
    protected String mapStatus(SummaryEntity entity) {
        return "SUCCESS".equalsIgnoreCase(entity.getStatus()) ? "COMPLETED" : entity.getStatus();
    }

    @Named("mapCompressionRate")
    protected Double mapCompressionRate(SummaryEntity entity) {
        if (entity.getOriginalLength() == null || entity.getOriginalLength() == 0 || entity.getSummaryLength() == null) {
            return 0.0;
        }
        double rate = (1.0 - ((double) entity.getSummaryLength() / entity.getOriginalLength())) * 100.0;
        return Math.round(rate * 10.0) / 10.0;
    }
}
