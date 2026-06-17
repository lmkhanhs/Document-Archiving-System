package com.datn.dms.services;

import com.datn.dms.dtos.summary.response.AdminSummaryStatisticsResponse;
import com.datn.dms.dtos.summary.response.InputTypeStatisticsResponse;
import com.datn.dms.dtos.summary.response.SummaryHistoryItemResponse;
import com.datn.dms.dtos.summary.response.SummaryHistoryDetailResponse;
import com.datn.dms.dtos.summary.response.SummaryHistoryPageResponse;
import com.datn.dms.dtos.summary.response.SummaryStatisticsResponse;
import com.datn.dms.dtos.summary.response.SummaryTrendItemResponse;
import com.datn.dms.entities.SummaryEntity;
import com.datn.dms.exception.AppException;
import com.datn.dms.exception.ErrorCode;
import com.datn.dms.mapper.SummaryMapper;
import com.datn.dms.repositories.SummaryRepository;
import com.datn.dms.repositories.UserRepository;
import com.datn.dms.utils.AuthenticationUtills;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SummaryService {

    SummaryRepository summaryRepository;
    UserRepository userRepository;
    AuthenticationUtills authenticationUtills;
    SummaryMapper summaryMapper;

    @NonFinal
    @Value("${app.ai.base-url}")
    String aiBaseUrl;

    public List<SummaryHistoryItemResponse> getMySummaryHistories(String search, String type, String time) {
        Long userId = getCurrentUserId();
        Specification<SummaryEntity> spec = buildMySummarySpec(userId, search, type, time);
        return summaryRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(summaryMapper::toSummaryHistoryItemResponse)
                .collect(Collectors.toList());
    }

    public SummaryHistoryDetailResponse getMySummaryHistoryDetail(Long id) {
        Long userId = getCurrentUserId();
        SummaryEntity summaryEntity = summaryRepository.findOne((root, query, cb) -> cb.and(
                        cb.equal(root.get("id"), id),
                        cb.equal(root.get("user").get("id"), userId)))
                .orElseThrow(() -> new AppException(ErrorCode.SUMMARY_NOT_FOUND));
        return summaryMapper.toSummaryHistoryDetailResponse(summaryEntity);
    }

    private Long getCurrentUserId() {
        return userRepository.findByUsername(authenticationUtills.getUserName())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND))
                .getId();
    }

    private Specification<SummaryEntity> buildMySummarySpec(Long userId, String search, String type, String time) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("user").get("id"), userId));

            if (type != null && !type.isBlank() && !"ALL".equalsIgnoreCase(type)) {
                predicates.add(cb.equal(root.get("summaryType"), type.trim().toUpperCase()));
            }

            if (search != null && !search.isBlank()) {
                String keyword = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("originalContent")), keyword),
                        cb.like(cb.lower(root.get("summaryContent")), keyword),
                        cb.like(cb.lower(root.join("file", jakarta.persistence.criteria.JoinType.LEFT).get("name")), keyword)));
            }

            LocalDate now = com.datn.dms.utils.DateTimeUtils.today();
            if ("today".equalsIgnoreCase(time)) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), now.atStartOfDay()));
            } else if ("7d".equalsIgnoreCase(time)) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), now.minusDays(7).atStartOfDay()));
            } else if ("30d".equalsIgnoreCase(time)) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), now.minusDays(30).atStartOfDay()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

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
    
    public List<SummaryTrendItemResponse> getSummaryTrend(int days) {
        if (days < 0) {
            days = 0;
        }
        
        List<Object[]> rawData = summaryRepository.getSummaryTrend(days);
        
        Map<String, Long> countMap = new HashMap<>();
        for (Object[] row : rawData) {
            String dateStr = String.valueOf(row[0]);
            Long count = ((Number) row[1]).longValue();
            countMap.put(dateStr, count);
        }
        
        List<SummaryTrendItemResponse> result = new ArrayList<>();
        LocalDate endDate = com.datn.dms.utils.DateTimeUtils.today();
        LocalDate startDate = endDate.minusDays(Math.max(0, days - 1));
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            String dateStr = date.format(formatter);
            long count = countMap.getOrDefault(dateStr, 0L);
            result.add(SummaryTrendItemResponse.builder()
                    .date(dateStr)
                    .count(count)
                    .build());
        }
        
        return result;
    }

    public InputTypeStatisticsResponse getInputTypeStatistics() {
        List<Object[]> rawData = summaryRepository.countInputTypesGrouped();
        
        long fileCount = 0;
        long textCount = 0;
        
        for (Object[] row : rawData) {
            String type = String.valueOf(row[0]);
            long count = ((Number) row[1]).longValue();
            
            if ("FILE".equalsIgnoreCase(type)) {
                fileCount += count;
            } else if ("TEXT".equalsIgnoreCase(type)) {
                textCount += count;
            }
        }
        
        long total = fileCount + textCount;
        double filePercent = 0.0;
        double textPercent = 0.0;
        
        if (total > 0) {
            filePercent = Math.round(((double) fileCount / total * 100.0) * 100.0) / 100.0;
            textPercent = Math.round(((double) textCount / total * 100.0) * 100.0) / 100.0;
        }
        
        return InputTypeStatisticsResponse.builder()
                .total(total)
                .fileCount(fileCount)
                .textCount(textCount)
                .filePercent(filePercent)
                .textPercent(textPercent)
                .build();
    }

    public SummaryHistoryPageResponse getSummaryHistory(int page, int size, String inputType, String status, String startDateStr, String endDateStr) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<SummaryEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (inputType != null && !inputType.equalsIgnoreCase("ALL") && !inputType.isEmpty()) {
                predicates.add(cb.equal(root.get("summaryType"), inputType));
            }

            if (status != null && !status.equalsIgnoreCase("ALL") && !status.isEmpty()) {
                String dbStatus = status;
                if ("COMPLETED".equalsIgnoreCase(status)) {
                    dbStatus = "SUCCESS";
                }
                predicates.add(cb.equal(root.get("status"), dbStatus));
            }

            if (startDateStr != null && !startDateStr.isEmpty()) {
                LocalDate startDate = LocalDate.parse(startDateStr);
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startDate.atStartOfDay()));
            }

            if (endDateStr != null && !endDateStr.isEmpty()) {
                LocalDate endDate = LocalDate.parse(endDateStr);
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endDate.atTime(LocalTime.MAX)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<SummaryEntity> entityPage = summaryRepository.findAll(spec, pageable);

        List<SummaryHistoryItemResponse> items = entityPage.getContent().stream()
                .map(summaryMapper::toSummaryHistoryItemResponse)
                .collect(Collectors.toList());

        SummaryHistoryPageResponse.PaginationMeta pagination = SummaryHistoryPageResponse.PaginationMeta.builder()
                .page(entityPage.getNumber() + 1)
                .size(entityPage.getSize())
                .totalItems(entityPage.getTotalElements())
                .totalPages(entityPage.getTotalPages())
                .hasNext(entityPage.hasNext())
                .hasPrevious(entityPage.hasPrevious())
                .build();

        return SummaryHistoryPageResponse.builder()
                .items(items)
                .pagination(pagination)
                .build();
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    public SummaryHistoryDetailResponse getSummaryHistoryDetail(Long id) {
        SummaryEntity summaryEntity = summaryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUMMARY_NOT_FOUND));
        return summaryMapper.toSummaryHistoryDetailResponse(summaryEntity);
    }

    public Map<String, Object> pingAiServer() {
        try {
            String url = aiBaseUrl + "/api/ping";
            WebClient webClient = WebClient.create();
            
            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(java.time.Duration.ofSeconds(5));
            
            Map<String, Object> result = new HashMap<>();
            result.put("status", "success");
            result.put("url", url);
            result.put("response", response);
            return result;
        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("status", "failed");
            result.put("url", aiBaseUrl + "/api/ping");
            result.put("error", e.getMessage());
            return result;
        }
    }
}
