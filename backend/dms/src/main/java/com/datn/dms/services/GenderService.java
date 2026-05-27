package com.datn.dms.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.datn.dms.dtos.gender.response.GenderResponse;
import com.datn.dms.mapper.GenderMapper;
import com.datn.dms.repositories.GenderRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GenderService {
    GenderRepository genderRepository;
    GenderMapper genderMapper;

    public List<GenderResponse> getAllGenders() {
        return genderRepository.findAll().stream()
                .map(genderMapper::toGenderResponse)
                .collect(Collectors.toList());
    }
}
