package com.datn.dms.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.datn.dms.dtos.country.response.CountryResponse;
import com.datn.dms.mapper.CountryMapper;
import com.datn.dms.repositories.CountryRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CountryService {
    CountryRepository countryRepository;
    CountryMapper countryMapper;

    public List<CountryResponse> getAllCountries() {
        return countryRepository.findAll().stream()
                .map(countryMapper::toCountryResponse)
                .collect(Collectors.toList());
    }
}
