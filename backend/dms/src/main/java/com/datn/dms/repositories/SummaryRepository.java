package com.datn.dms.repositories;

import com.datn.dms.entities.SummaryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface SummaryRepository extends JpaRepository<SummaryEntity, Long> {

    // 1. Total summaries
    @Query("SELECT COUNT(s) FROM SummaryEntity s")
    long countTotalSummaries();

    // Total summaries up to end of last month
    @Query(value = "SELECT COUNT(*) FROM summaries WHERE created_at < DATE_FORMAT(CURDATE(), '%Y-%m-01')", nativeQuery = true)
    long countTotalSummariesUpToLastMonth();

    // 3. Today summaries
    @Query(value = "SELECT COUNT(*) FROM summaries WHERE DATE(created_at) = CURDATE()", nativeQuery = true)
    long countTodaySummaries();

    // Yesterday summaries
    @Query(value = "SELECT COUNT(*) FROM summaries WHERE DATE(created_at) = CURDATE() - INTERVAL 1 DAY", nativeQuery = true)
    long countYesterdaySummaries();

    // 5. Success rate overall - count success
    @Query("SELECT COUNT(s) FROM SummaryEntity s WHERE s.status = 'SUCCESS'")
    long countSuccessSummaries();

    // Success summaries current week
    @Query(value = "SELECT COUNT(*) FROM summaries WHERE status = 'SUCCESS' AND YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)", nativeQuery = true)
    long countSuccessSummariesCurrentWeek();

    // Total summaries current week
    @Query(value = "SELECT COUNT(*) FROM summaries WHERE YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)", nativeQuery = true)
    long countTotalSummariesCurrentWeek();

    // Success summaries previous week
    @Query(value = "SELECT COUNT(*) FROM summaries WHERE status = 'SUCCESS' AND YEARWEEK(created_at, 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1)", nativeQuery = true)
    long countSuccessSummariesPreviousWeek();

    // Total summaries previous week
    @Query(value = "SELECT COUNT(*) FROM summaries WHERE YEARWEEK(created_at, 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1)", nativeQuery = true)
    long countTotalSummariesPreviousWeek();

    // 7. Average processing time overall
    @Query("SELECT AVG(s.duration) FROM SummaryEntity s WHERE s.status = 'SUCCESS'")
    Double getAverageProcessingTime();

    // Average processing time current month
    @Query(value = "SELECT AVG(duration) FROM summaries WHERE status = 'SUCCESS' AND DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')", nativeQuery = true)
    Double getAverageProcessingTimeCurrentMonth();

    // Average processing time previous month
    @Query(value = "SELECT AVG(duration) FROM summaries WHERE status = 'SUCCESS' AND DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m')", nativeQuery = true)
    Double getAverageProcessingTimePreviousMonth();
}
