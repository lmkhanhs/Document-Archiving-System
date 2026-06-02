package com.datn.dms.services;

import org.springframework.stereotype.Service;

import com.datn.dms.dtos.statistics.response.DocumentTypeStatisticItemResponse;
import com.datn.dms.dtos.statistics.response.OverviewStatisticsResponse;
import com.datn.dms.repositories.FileRepository;
import com.datn.dms.repositories.SummaryRepository;
import com.datn.dms.repositories.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminStatisticsService {

    UserRepository userRepository;
    FileRepository fileRepository;
    SummaryRepository summaryRepository;
    ActiveUserService activeUserService;

    public OverviewStatisticsResponse getOverviewStatistics() {
        long totalUsers = userRepository.count();
        long totalDocuments = fileRepository.count();
        long totalSummaries = summaryRepository.countTotalSummaries();
        int activeUsers = activeUserService.getActiveUserCount();

        long successSummaries = summaryRepository.countSuccessSummaries();
        double successRate = 0.0;
        if (totalSummaries > 0) {
            successRate = (double) successSummaries / totalSummaries * 100;
            // Round to 1 decimal place if needed, but double is fine. Let's round to 2 decimal places.
            successRate = BigDecimal.valueOf(successRate)
                    .setScale(2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        Double avgProcessingTimeDouble = summaryRepository.getAverageProcessingTime();
        double averageProcessingTime = avgProcessingTimeDouble == null ? 0.0 : avgProcessingTimeDouble;
        averageProcessingTime = BigDecimal.valueOf(averageProcessingTime)
                .setScale(1, RoundingMode.HALF_UP)
                .doubleValue();

        return OverviewStatisticsResponse.builder()
                .totalUsers(totalUsers)
                .totalDocuments(totalDocuments)
                .totalSummaries(totalSummaries)
                .activeUsers(activeUsers)
                .successRate(successRate)
                .averageProcessingTime(averageProcessingTime)
                .build();
    }

    public List<DocumentTypeStatisticItemResponse> getDocumentTypeStatistics() {
        List<String> names = fileRepository.findAllFileNames();
        long pdfCount = 0;
        long docxCount = 0;
        long txtCount = 0;
        long otherCount = 0;

        for (String name : names) {
            if (name == null) {
                otherCount++;
                continue;
            }
            String lowerName = name.toLowerCase();
            if (lowerName.endsWith(".pdf")) {
                pdfCount++;
            } else if (lowerName.endsWith(".docx") || lowerName.endsWith(".doc")) {
                docxCount++;
            } else if (lowerName.endsWith(".txt")) {
                txtCount++;
            } else {
                otherCount++;
            }
        }

        return List.of(
            new DocumentTypeStatisticItemResponse("PDF", pdfCount),
            new DocumentTypeStatisticItemResponse("DOCX", docxCount),
            new DocumentTypeStatisticItemResponse("TXT", txtCount),
            new DocumentTypeStatisticItemResponse("Khác", otherCount)
        );
    }

    public List<com.datn.dms.dtos.statistics.response.TopActiveUserResponse> getTopActiveUsers() {
        // limit to 5
        List<com.datn.dms.dtos.statistics.response.TopActiveUserProjection> projections = userRepository.getTopActiveUsers(5);

        return projections.stream().map(p -> {
            return com.datn.dms.dtos.statistics.response.TopActiveUserResponse.builder()
                    .userId(p.getUserId())
                    .username(p.getUsername())
                    .thumbnailUrl(p.getThumbnailUrl())
                    .uploadedDocuments(p.getUploadedDocuments() != null ? p.getUploadedDocuments() : 0)
                    .summaryCount(p.getSummaryCount() != null ? p.getSummaryCount() : 0)
                    .lastActiveAt(p.getLastActiveAt())
                    .build();
        }).toList();
    }

    public List<com.datn.dms.dtos.statistics.response.RecentActivityResponse> getRecentActivities() {
        List<com.datn.dms.dtos.statistics.response.RecentActivityProjection> projections = userRepository.getRecentActivities(10);

        return projections.stream().map(p -> com.datn.dms.dtos.statistics.response.RecentActivityResponse.builder()
                .id(p.getId())
                .type(p.getType())
                .title(p.getTitle())
                .status(p.getStatus())
                .createdAt(p.getCreatedAt())
                .build()).toList();
    }
}
