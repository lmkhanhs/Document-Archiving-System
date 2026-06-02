package com.datn.dms.services;

import org.springframework.stereotype.Service;

import com.datn.dms.dtos.statistics.response.OverviewStatisticsResponse;
import com.datn.dms.repositories.FileRepository;
import com.datn.dms.repositories.SummaryRepository;
import com.datn.dms.repositories.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.math.RoundingMode;

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
}
