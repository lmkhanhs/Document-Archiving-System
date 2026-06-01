package com.datn.dms.dtos.summary.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InputTypeStatisticsResponse {
    private Long total;
    private Long fileCount;
    private Long textCount;
    private Double filePercent;
    private Double textPercent;
}
