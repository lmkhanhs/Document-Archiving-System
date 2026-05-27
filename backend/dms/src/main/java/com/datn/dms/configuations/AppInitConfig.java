package com.datn.dms.configuations;

import java.util.HashSet;
import java.util.Set;

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

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AppInitConfig {
    RoleRepository roleRepository;
    UserRepository userRepository;
    PasswordEncoder passwordEncoder;
    ColorRepository colorRepository;
    GenderRepository genderRepository;
    CountryRepository countryRepository;
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
                if (genderRepository.findByName(genderEnum.getName()).isEmpty()) {
                    GenderEntity gender = new GenderEntity();
                    gender.setName(genderEnum.getName());
                    genderRepository.save(gender);
                }
            }

            for (CountryDefaultEnums countryEnum : CountryDefaultEnums.values()) {
                if (countryRepository.findByName(countryEnum.getName()).isEmpty()) {
                    CountryEntity country = new CountryEntity();
                    country.setName(countryEnum.getName());
                    countryRepository.save(country);
                }
            }
        };
    }
}
