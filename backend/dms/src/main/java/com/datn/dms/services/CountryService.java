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
import com.datn.dms.exception.AppException;
import com.datn.dms.exception.ErrorCode;
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

        CountryStatisticsResponse.LatestRegisteredCountry latestRegisteredCountry = countryRepository
                .findFirstByOrderByCreatedAtDesc()
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

        return countryPage.map(countryMapper::toAdminCountryResponse);
    }

    public AdminCountryResponse createAdminCountry(String name, String code, Boolean active,
            org.springframework.web.multipart.MultipartFile file) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("name không được trống");
        }
        if (code == null || code.trim().isEmpty()) {
            throw new IllegalArgumentException("code không được trống");
        }
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("file không được trống");
        }

        String contentType = file.getContentType();
        if (contentType == null || !(contentType.equals("image/jpeg") || contentType.equals("image/png")
                || contentType.equals("image/webp"))) {
            throw new IllegalArgumentException("file chỉ cho phép JPG, JPEG, PNG, WEBP");
        }

        if (file.getSize() > 50 * 1024 * 1024) {
            throw new IllegalArgumentException("dung lượng file tối đa 50MB");
        }

        String upperCode = code.toUpperCase();
        if (countryRepository.existsByCode(upperCode)) {
            throw new AppException(ErrorCode.COUNTRY_EXISTED);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.lastIndexOf(".") != -1) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String uniqueFilename = upperCode.toLowerCase() + "-" + java.util.UUID.randomUUID().toString() + extension;
        String uploadDir = "uploads/public/flags";
        java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);

        try {
            if (!java.nio.file.Files.exists(uploadPath)) {
                java.nio.file.Files.createDirectories(uploadPath);
            }
            java.nio.file.Path filePath = uploadPath.resolve(uniqueFilename);
            java.nio.file.Files.copy(file.getInputStream(), filePath,
                    java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        } catch (java.io.IOException e) {
            throw new RuntimeException("Lỗi khi lưu ảnh cờ", e);
        }

        String thumbnailUrl = "/" + uploadDir + "/" + uniqueFilename;

        CountryEntity country = new CountryEntity();
        country.setName(name);
        country.setCode(upperCode);
        country.setThumbnailUrl(thumbnailUrl);
        country.setActive(active != null ? active : true);

        country = countryRepository.save(country);

        return countryMapper.toAdminCountryResponse(country);
    }

    public AdminCountryResponse updateAdminCountry(Long id, String name, String code, Boolean active,
            org.springframework.web.multipart.MultipartFile file) {
        CountryEntity country = countryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COUNTRY_NOT_FOUND));

        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("name không được trống");
        }
        if (code == null || code.trim().isEmpty()) {
            throw new IllegalArgumentException("code không được trống");
        }

        String upperCode = code.toUpperCase();
        if (countryRepository.existsByCodeAndIdNot(upperCode, id)) {
            throw new AppException(ErrorCode.COUNTRY_EXISTED);
        }

        country.setName(name);
        country.setCode(upperCode);
        country.setActive(active != null ? active : true);

        if (file != null && !file.isEmpty()) {
            String contentType = file.getContentType();
            if (contentType == null || !(contentType.equals("image/jpeg") || contentType.equals("image/png")
                    || contentType.equals("image/webp"))) {
                throw new IllegalArgumentException("file chỉ cho phép JPG, JPEG, PNG, WEBP");
            }

            if (file.getSize() > 50 * 1024 * 1024) {
                throw new IllegalArgumentException("dung lượng file tối đa 50MB");
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.lastIndexOf(".") != -1) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String uniqueFilename = upperCode.toLowerCase() + "-" + java.util.UUID.randomUUID().toString() + extension;
            String uploadDir = "uploads/public/flags";
            java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);

            try {
                if (!java.nio.file.Files.exists(uploadPath)) {
                    java.nio.file.Files.createDirectories(uploadPath);
                }
                java.nio.file.Path filePath = uploadPath.resolve(uniqueFilename);
                java.nio.file.Files.copy(file.getInputStream(), filePath,
                        java.nio.file.StandardCopyOption.REPLACE_EXISTING);

                country.setThumbnailUrl("/" + uploadDir + "/" + uniqueFilename);
            } catch (java.io.IOException e) {
                throw new RuntimeException("Lỗi khi lưu ảnh cờ", e);
            }
        }

        country = countryRepository.save(country);
        return countryMapper.toAdminCountryResponse(country);
    }
}
