package com.datn.dms.dtos.summary.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SummaryTrendItemResponse {
    private String date;
    private Long count;
}
