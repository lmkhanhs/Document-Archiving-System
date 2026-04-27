package com.datn.dms.dtos.files.response;

import java.util.List;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HomeDashboardResponse {
    List<HomeQuickAccessItemResponse> quickAccess;
    List<HomeRecentItemResponse> recent;
    List<HomeSuggestedItemResponse> suggested;
    HomeStorageStatusResponse storage;
}
