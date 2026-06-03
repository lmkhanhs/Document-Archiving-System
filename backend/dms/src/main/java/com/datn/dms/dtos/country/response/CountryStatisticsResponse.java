package com.datn.dms.dtos.country.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CountryStatisticsResponse {
    Long totalSupportedCountries;

    Long activeCountries;

    Integer userCoverageRate;

    LatestRegisteredCountry latestRegisteredCountry;

    @Getter
    @Setter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class LatestRegisteredCountry {
        Long id;
        String name;
        String code;
        String thumbnailUrl;
    }
}
