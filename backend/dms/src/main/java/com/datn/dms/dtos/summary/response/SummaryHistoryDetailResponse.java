package com.datn.dms.dtos.summary.response;

import java.time.LocalDateTime;

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
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SummaryHistoryDetailResponse {
    Long id;
    String title;
    String inputType;
    String username;
    String thumbnailUrl;
    
    String aiModel;
    String summaryType; // e.g. "Chi tiết", will map from Entity's summaryType or a static value if needed. From example it is "Chi tiết". In entity it's `summaryType` which seems to be "FILE" or "TEXT" for inputType. Wait, entity has `summaryType` for both?
    // Let's check SummaryEntity:
    // `summaryType`: length 20. The current mapper uses it for `inputType` (e.g. "FILE" or "TEXT").
    // The requirement says "aiModel": "Gemini 1.5 Pro", "summaryType": "Chi tiết".
    // I'll add `aiModel` and `summaryType` to DTO.
    // In Entity: `String model` is Gemini 1.5 Pro.
    // What is "Chi tiết"? It might be a fixed string or derived. For now I'll map `summaryType` to a derived value.
    
    LocalDateTime createdAt;
    String fileSize;
    String status;

    Double processingTimeSeconds;
    Integer originalLength;
    Integer summaryLength;
    Double compressionRate;
    String summaryContent;
}
