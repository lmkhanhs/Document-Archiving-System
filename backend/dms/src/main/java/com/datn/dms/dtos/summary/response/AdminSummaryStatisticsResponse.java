package com.datn.dms.dtos.summary.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminSummaryStatisticsResponse {
    private SummaryHistory30Days summaryHistory30Days;
    private SummarizedContent summarizedContent;
    private AverageProcessingTime averageProcessingTime;
    private ProcessingTasks processingTasks;

    @Data
    @Builder
    public static class SummaryHistory30Days {
        private Long total;
        private String unit;
        private Long todayIncrease;
    }

    @Data
    @Builder
    public static class SummarizedContent {
        private Long total;
        private Long thisWeekIncrease;
        private Long fileCount;
        private Long textCount;
    }

    @Data
    @Builder
    public static class AverageProcessingTime {
        private Double value;
        private String unit;
        private Double changePercent;
    }

    @Data
    @Builder
    public static class ProcessingTasks {
        private Long total;
        private Boolean isLoading;
    }
}
