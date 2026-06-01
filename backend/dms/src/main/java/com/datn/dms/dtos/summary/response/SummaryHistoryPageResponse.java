package com.datn.dms.dtos.summary.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class SummaryHistoryPageResponse {
    private List<SummaryHistoryItemResponse> items;
    private PaginationMeta pagination;

    @Data
    @Builder
    public static class PaginationMeta {
        private int page;
        private int size;
        private long totalItems;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
    }
}
