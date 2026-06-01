package com.datn.dms.services;

import com.datn.dms.dtos.summary.response.AdminSummaryStatisticsResponse;
import com.datn.dms.dtos.summary.response.SummaryStatisticsResponse;
import com.datn.dms.repositories.SummaryRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SummaryService {

    SummaryRepository summaryRepository;

    public SummaryStatisticsResponse getStatistics() {
        // 1. Total summaries
        long totalSummaries = summaryRepository.countTotalSummaries();
        long totalSummariesLastMonth = summaryRepository.countTotalSummariesUpToLastMonth();
        double totalSummariesGrowth = calculateGrowth(totalSummaries, totalSummariesLastMonth);

        // 3. Today summaries
        long todaySummaries = summaryRepository.countTodaySummaries();
        long yesterdaySummaries = summaryRepository.countYesterdaySummaries();
        double todaySummariesGrowth = calculateGrowth(todaySummaries, yesterdaySummaries);

        // 5. Success rate
        long totalSuccess = summaryRepository.countSuccessSummaries();
        double successRate = totalSummaries == 0 ? 0.0 : (double) totalSuccess / totalSummaries * 100.0;
        
        long successCurrentWeek = summaryRepository.countSuccessSummariesCurrentWeek();
        long totalCurrentWeek = summaryRepository.countTotalSummariesCurrentWeek();
        double successRateCurrentWeek = totalCurrentWeek == 0 ? 0.0 : (double) successCurrentWeek / totalCurrentWeek * 100.0;
        
        long successPreviousWeek = summaryRepository.countSuccessSummariesPreviousWeek();
        long totalPreviousWeek = summaryRepository.countTotalSummariesPreviousWeek();
        double successRatePreviousWeek = totalPreviousWeek == 0 ? 0.0 : (double) successPreviousWeek / totalPreviousWeek * 100.0;
        
        // Success rate growth is usually the absolute difference in percentage points
        double successRateGrowth = successRateCurrentWeek - successRatePreviousWeek;

        // 7. Average processing time
        Double avgProcessingTimeRaw = summaryRepository.getAverageProcessingTime();
        double averageProcessingTime = avgProcessingTimeRaw != null ? avgProcessingTimeRaw : 0.0;
        
        Double avgTimeCurrentMonthRaw = summaryRepository.getAverageProcessingTimeCurrentMonth();
        double avgTimeCurrentMonth = avgTimeCurrentMonthRaw != null ? avgTimeCurrentMonthRaw : 0.0;
        
        Double avgTimePreviousMonthRaw = summaryRepository.getAverageProcessingTimePreviousMonth();
        double avgTimePreviousMonth = avgTimePreviousMonthRaw != null ? avgTimePreviousMonthRaw : 0.0;
        
        double averageProcessingTimeGrowth = calculateGrowthSimple(avgTimeCurrentMonth, avgTimePreviousMonth);

        return SummaryStatisticsResponse.builder()
                .totalSummaries(totalSummaries)
                .totalSummariesGrowth(round(totalSummariesGrowth))
                .todaySummaries(todaySummaries)
                .todaySummariesGrowth(round(todaySummariesGrowth))
                .successRate(round(successRate))
                .successRateGrowth(round(successRateGrowth))
                .averageProcessingTime(round(averageProcessingTime))
                .averageProcessingTimeGrowth(round(averageProcessingTimeGrowth))
                .build();
    }

    public AdminSummaryStatisticsResponse getAdminStatistics() {
        // 1. summaryHistory30Days
        long total30Days = summaryRepository.countSummariesLast30Days();
        long todayIncrease = summaryRepository.countTodaySummaries();

        AdminSummaryStatisticsResponse.SummaryHistory30Days summaryHistory30Days = AdminSummaryStatisticsResponse.SummaryHistory30Days.builder()
                .total(total30Days)
                .unit("lượt")
                .todayIncrease(todayIncrease)
                .build();

        // 2. summarizedContent
        long totalSummaries = summaryRepository.countTotalSummaries();
        long thisWeekIncrease = summaryRepository.countTotalSummariesCurrentWeek();
        long fileCount = summaryRepository.countBySummaryType("FILE");
        long textCount = summaryRepository.countBySummaryType("TEXT");

        AdminSummaryStatisticsResponse.SummarizedContent summarizedContent = AdminSummaryStatisticsResponse.SummarizedContent.builder()
                .total(totalSummaries)
                .thisWeekIncrease(thisWeekIncrease)
                .fileCount(fileCount)
                .textCount(textCount)
                .build();

        // 3. averageProcessingTime
        Double avgProcessingTimeRaw = summaryRepository.getAverageProcessingTime();
        double averageProcessingTime = avgProcessingTimeRaw != null ? avgProcessingTimeRaw : 0.0;

        Double avgTimeCurrentMonthRaw = summaryRepository.getAverageProcessingTimeCurrentMonth();
        double avgTimeCurrentMonth = avgTimeCurrentMonthRaw != null ? avgTimeCurrentMonthRaw : 0.0;

        Double avgTimePreviousMonthRaw = summaryRepository.getAverageProcessingTimePreviousMonth();
        double avgTimePreviousMonth = avgTimePreviousMonthRaw != null ? avgTimePreviousMonthRaw : 0.0;

        double changePercent = calculateGrowthSimple(avgTimeCurrentMonth, avgTimePreviousMonth);

        AdminSummaryStatisticsResponse.AverageProcessingTime avgTime = AdminSummaryStatisticsResponse.AverageProcessingTime.builder()
                .value(round(averageProcessingTime))
                .unit("s")
                .changePercent(round(changePercent))
                .build();

        // 4. processingTasks
        long processingCount = summaryRepository.countProcessingTasks();

        AdminSummaryStatisticsResponse.ProcessingTasks processingTasks = AdminSummaryStatisticsResponse.ProcessingTasks.builder()
                .total(processingCount)
                .isLoading(true)
                .build();

        return AdminSummaryStatisticsResponse.builder()
                .summaryHistory30Days(summaryHistory30Days)
                .summarizedContent(summarizedContent)
                .averageProcessingTime(avgTime)
                .processingTasks(processingTasks)
                .build();
    }

    private double calculateGrowth(long current, long previous) {
        if (previous == 0) {
            return current > 0 ? 100.0 : 0.0;
        }
        return (double) (current - previous) / previous * 100.0;
    }
    
    private double calculateGrowthSimple(double current, double previous) {
        if (previous == 0.0) {
             return current > 0.0 ? 100.0 : 0.0;
        }
        return (current - previous) / previous * 100.0;
    }
    
    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
