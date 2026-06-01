package com.datn.dms.dtos.summary.response;

import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class AdminSummaryStatisticsResponse {
    SummaryHistory30Days summaryHistory30Days;
    SummarizedContent summarizedContent;
    AverageProcessingTime averageProcessingTime;
    ProcessingTasks processingTasks;

    @Data
    @Builder
    @FieldDefaults(level = lombok.AccessLevel.PRIVATE)
    public static class SummaryHistory30Days {
        Long total;
        String unit;
        Long todayIncrease;
    }

    @Data
    @Builder
    @FieldDefaults(level = lombok.AccessLevel.PRIVATE)
    public static class SummarizedContent {
        Long total;
        Long thisWeekIncrease;
        Long fileCount;
        Long textCount;
    }

    @Data
    @Builder
    @FieldDefaults(level = lombok.AccessLevel.PRIVATE)
    public static class AverageProcessingTime {
        Double value;
        String unit;
        Double changePercent;
    }

    @Data
    @Builder
    @FieldDefaults(level = lombok.AccessLevel.PRIVATE)
    public static class ProcessingTasks {
        Long total;
        Boolean isLoading;
    }
}
