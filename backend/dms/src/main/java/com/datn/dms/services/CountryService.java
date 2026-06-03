package com.datn.dms.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.datn.dms.dtos.country.response.AdminCountryResponse;
import com.datn.dms.dtos.country.response.CountryResponse;
import com.datn.dms.dtos.country.response.CountryStatisticsResponse;
import com.datn.dms.entities.CountryEntity;
import com.datn.dms.entities.UserEntity;
import com.datn.dms.mapper.CountryMapper;
import com.datn.dms.repositories.CountryRepository;
import com.datn.dms.repositories.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CountryService {
    CountryRepository countryRepository;
    UserRepository userRepository;
    CountryMapper countryMapper;

    public CountryStatisticsResponse getStatistics() {
        long totalSupportedCountries = countryRepository.count();
        long activeCountries = countryRepository.countByActiveTrue();
        long usedCountries = userRepository.countDistinctCountryUsedByUsers();

        int userCoverageRate = totalSupportedCountries == 0
                ? 0
                : (int) Math.round((usedCountries * 100.0) / totalSupportedCountries);

        CountryStatisticsResponse.LatestRegisteredCountry latestRegisteredCountry =
                countryRepository.findFirstByOrderByCreatedAtDesc()
                        .map(country -> CountryStatisticsResponse.LatestRegisteredCountry.builder()
                                .id(country.getId())
                                .name(country.getName())
                                .code(country.getCode())
                                .thumbnailUrl(country.getThumbnailUrl())
                                .build())
                        .orElse(null);

        return CountryStatisticsResponse.builder()
                .totalSupportedCountries(totalSupportedCountries)
                .activeCountries(activeCountries)
                .userCoverageRate(userCoverageRate)
                .latestRegisteredCountry(latestRegisteredCountry)
                .build();
    }

    public List<CountryResponse> getAllCountriesIsActive() {
        return countryRepository.findAllByActiveTrue().stream()
                .map(countryMapper::toCountryResponse)
                .collect(Collectors.toList());
    }

    public Page<AdminCountryResponse> getAdminCountries(int page, int size, String keyword) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CountryEntity> countryPage = countryRepository.searchAdminCountries(keyword, pageable);

        return countryPage.map(c -> AdminCountryResponse.builder()
                .id(c.getId())
                .flag(c.getThumbnailUrl())
                .isoCode(c.getCode())
                .name(c.getName())
                .userCount(c.getUsers() != null ? c.getUsers().size() : 0)
                .active(c.getActive())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build());
    }
}
