package com.datn.dms.dtos.statistics.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OverviewStatisticsResponse {
    long totalUsers;
    long totalDocuments;
    long totalSummaries;
    int activeUsers;
    double successRate;
    double averageProcessingTime;
}
