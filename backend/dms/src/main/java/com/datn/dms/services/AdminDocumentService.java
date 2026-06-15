package com.datn.dms.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.datn.dms.dtos.documents.response.FileTypeRatioResponse;
import com.datn.dms.dtos.documents.response.RecentUploadsResponse;
import com.datn.dms.dtos.documents.response.TopUploaderResponse;
import com.datn.dms.repositories.FileRepository;
import com.datn.dms.repositories.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminDocumentService {
    FileRepository fileRepository;
    UserRepository userRepository;

    public long getTotalDocuments() {
        return fileRepository.count();
    }

    public long getDeletedDocuments() {
        return fileRepository.countByIsDeletedTrue();
    }

    public List<FileTypeRatioResponse> getFileTypeRatio() {
        List<Object[]> typeCounts = fileRepository.countFilesByType();
        Map<String, Long> extensionCounts = new HashMap<>();
        long totalCount = 0;

        for (Object[] result : typeCounts) {
            String mimeType = (String) result[0];
            Long count = (Long) result[1];
            
            String extension = resolveExtensionFromMimeType(mimeType);
            extensionCounts.put(extension, extensionCounts.getOrDefault(extension, 0L) + count);
            totalCount += count;
        }

        List<FileTypeRatioResponse> allRatios = new ArrayList<>();
        for (Map.Entry<String, Long> entry : extensionCounts.entrySet()) {
            allRatios.add(FileTypeRatioResponse.builder()
                    .type(entry.getKey())
                    .count(entry.getValue())
                    .percentage(0L)
                    .build());
        }

        // Sort descending by count
        allRatios.sort((a, b) -> Long.compare(b.getCount(), a.getCount()));

        List<FileTypeRatioResponse> top4 = new ArrayList<>();
        long otherCount = 0;

        for (FileTypeRatioResponse ratio : allRatios) {
            if (top4.size() < 4 && !ratio.getType().equals("Khác")) {
                top4.add(ratio);
            } else {
                otherCount += ratio.getCount();
            }
        }

        long finalTotalCount = totalCount;
        for (FileTypeRatioResponse ratio : top4) {
            long percentage = finalTotalCount == 0 ? 0 : Math.round((ratio.getCount() * 100.0) / finalTotalCount);
            ratio.setPercentage(percentage);
        }

        long otherPercentage = finalTotalCount == 0 ? 0 : Math.round((otherCount * 100.0) / finalTotalCount);

        List<FileTypeRatioResponse> result = new ArrayList<>(top4);
        
        result.add(FileTypeRatioResponse.builder()
                .type("Khác")
                .count(otherCount)
                .percentage(otherPercentage)
                .build());

        return result;
    }

    private String resolveExtensionFromMimeType(String mimeType) {
        if (mimeType == null) return "Khác";
        String lowerMime = mimeType.toLowerCase();
        
        if (lowerMime.contains("pdf")) return "PDF";
        if (lowerMime.contains("wordprocessingml") || lowerMime.contains("msword")) return "DOCX";
        if (lowerMime.contains("spreadsheetml") || lowerMime.contains("ms-excel")) return "XLSX";
        if (lowerMime.contains("presentationml") || lowerMime.contains("ms-powerpoint")) return "PPTX";
        if (lowerMime.contains("text/plain")) return "TXT";
        if (lowerMime.contains("zip") || lowerMime.contains("x-zip-compressed") || lowerMime.contains("rar") || lowerMime.contains("7z")) return "ZIP";
        if (lowerMime.contains("sql")) return "SQL";
        if (lowerMime.contains("json")) return "JSON";
        if (lowerMime.contains("csv")) return "CSV";
        if (lowerMime.contains("image/")) {
            if (lowerMime.contains("png")) return "PNG";
            if (lowerMime.contains("jpeg") || lowerMime.contains("jpg")) return "JPG";
            if (lowerMime.contains("gif")) return "GIF";
            if (lowerMime.contains("webp")) return "WEBP";
            return "IMAGE";
        }
        if (lowerMime.contains("video/")) return "MP4";
        if (lowerMime.contains("audio/")) return "MP3";

        return "Khác";
    }

    public List<RecentUploadsResponse> getRecentUploads(int days) {
        if (days < 1) days = 7;
        if (days > 30) days = 30;

        LocalDate endDate = com.datn.dms.utils.DateTimeUtils.today();
        LocalDate startDate = endDate.minusDays(days - 1);
        LocalDateTime startDateTime = startDate.atStartOfDay();

        List<LocalDateTime> createdDates = fileRepository.findCreatedAtAfter(startDateTime);
        
        Map<LocalDate, Long> countsByDate = new HashMap<>();
        for (LocalDateTime dt : createdDates) {
            if (dt != null) {
                LocalDate date = dt.toLocalDate();
                countsByDate.put(date, countsByDate.getOrDefault(date, 0L) + 1);
            }
        }

        List<RecentUploadsResponse> result = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");

        for (int i = 0; i < days; i++) {
            LocalDate currentDate = startDate.plusDays(i);
            long count = countsByDate.getOrDefault(currentDate, 0L);
            
            result.add(RecentUploadsResponse.builder()
                    .date(currentDate.format(formatter))
                    .count(count)
                    .build());
        }

        return result;
    }

    public List<TopUploaderResponse> getTopUploaders() {
        List<TopUploaderResponse> topUploaders = userRepository.getTopUploaders(PageRequest.of(0, 5));
        
        for (TopUploaderResponse uploader : topUploaders) {
            if (uploader.getUsername() == null || uploader.getUsername().isBlank()) {
                uploader.setUsername(uploader.getEmail());
            }
        }
        
        return topUploaders;
    }
}
