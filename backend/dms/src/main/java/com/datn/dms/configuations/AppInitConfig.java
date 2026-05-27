package com.datn.dms.configuations;

import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.datn.dms.entities.RoleEntity;
import com.datn.dms.emuns.RoleEnums;
import com.datn.dms.repositories.RoleRepository;
import com.datn.dms.entities.UserEntity;
import com.datn.dms.repositories.UserRepository;
import com.datn.dms.entities.ColorEntity;
import com.datn.dms.emuns.ColorDefaultEnums;
import com.datn.dms.repositories.ColorRepository;
import com.datn.dms.entities.GenderEntity;
import com.datn.dms.emuns.GenderEnums;
import com.datn.dms.repositories.GenderRepository;
import com.datn.dms.entities.CountryEntity;
import com.datn.dms.emuns.CountryDefaultEnums;
import com.datn.dms.repositories.CountryRepository;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AppInitConfig {
    RoleRepository roleRepository;
    UserRepository userRepository;
    PasswordEncoder passwordEncoder;
    ColorRepository colorRepository;
    GenderRepository genderRepository;
    CountryRepository countryRepository;

    @NonFinal
    @Value("${app.storage.upload-dir:uploads}")
    String uploadDir;

    @Bean
    ApplicationRunner init() {
        return args -> {
            if (roleRepository.findByName(RoleEnums.ADMIN.name()).isEmpty()) {
                RoleEntity role = new RoleEntity();
                role.setName(RoleEnums.ADMIN.name());
                roleRepository.save(role);
            }
            if (roleRepository.findByName(RoleEnums.USER.name()).isEmpty()) {
                RoleEntity role = new RoleEntity();
                role.setName(RoleEnums.USER.name());
                roleRepository.save(role);
            }


            if (userRepository.findByUsername("admin").isEmpty()) {
                Set<RoleEntity> roles = new HashSet<>();
                roleRepository.findByName(RoleEnums.ADMIN.name()).ifPresent(roles::add);
                roleRepository.findByName(RoleEnums.USER.name()).ifPresent(roles::add);

                UserEntity user = UserEntity.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("12345678"))
                        .isActive(true)
                        .roles(roles)
                        .build();
                userRepository.save(user);
                log.info("Admin user has been created with default password and roles ADMIN, USER.");
            }

            for (ColorDefaultEnums colorEnum : ColorDefaultEnums.values()) {
                if (colorRepository.findByHexCode(colorEnum.getHexCode()).isEmpty()) {
                    ColorEntity color = new ColorEntity();
                    color.setName(colorEnum.getName());
                    color.setHexCode(colorEnum.getHexCode());
                    colorRepository.save(color);
                }
            }

            for (GenderEnums genderEnum : GenderEnums.values()) {
                Optional<GenderEntity> existingGenderOpt = genderRepository.findByName(genderEnum.getName());
                GenderEntity gender = existingGenderOpt.orElseGet(() -> {
                    GenderEntity g = new GenderEntity();
                    g.setName(genderEnum.getName());
                    return g;
                });
                gender.setThumbnailUrl(genderEnum.getThumbnailUrl());
                genderRepository.save(gender);
            }

            // Init countries with flag images
            Path flagsDir = Paths.get(uploadDir, "public", "flags").toAbsolutePath().normalize();
            Files.createDirectories(flagsDir);

            HttpClient httpClient = HttpClient.newHttpClient();

            for (CountryDefaultEnums countryEnum : CountryDefaultEnums.values()) {
                if (countryRepository.findByName(countryEnum.getName()).isEmpty()) {
                    String fileName = countryEnum.getCountryCode() + ".png";
                    Path flagFile = flagsDir.resolve(fileName);
                    String thumbnailUrl = "/uploads/public/flags/" + fileName;

                    // Download flag if file doesn't exist yet
                    if (!Files.exists(flagFile)) {
                        try {
                            HttpRequest request = HttpRequest.newBuilder()
                                    .uri(URI.create(countryEnum.getFlagUrl()))
                                    .GET()
                                    .build();
                            HttpResponse<InputStream> response = httpClient.send(
                                    request, HttpResponse.BodyHandlers.ofInputStream());

                            if (response.statusCode() == 200) {
                                Files.copy(response.body(), flagFile, StandardCopyOption.REPLACE_EXISTING);
                                log.info("Downloaded flag for {}", countryEnum.getName());
                            } else {
                                log.warn("Failed to download flag for {} (HTTP {})",
                                        countryEnum.getName(), response.statusCode());
                                thumbnailUrl = null;
                            }
                        } catch (Exception e) {
                            log.warn("Failed to download flag for {}: {}",
                                    countryEnum.getName(), e.getMessage());
                            thumbnailUrl = null;
                        }
                    }

                    CountryEntity country = new CountryEntity();
                    country.setName(countryEnum.getName());
                    country.setThumbnailUrl(thumbnailUrl);
                    countryRepository.save(country);
                    log.info("Created country: {}", countryEnum.getName());
                }
            }
        };
    }
}
