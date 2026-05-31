package com.datn.dms.dtos.summary.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PACKAGE)
public class SummaryStatisticsResponse {
     Long totalSummaries;
     Double totalSummariesGrowth;

     Long todaySummaries;
     Double todaySummariesGrowth;

     Double successRate;
     Double successRateGrowth;

     Double averageProcessingTime;
     Double averageProcessingTimeGrowth;
}
