package com.datn.dms.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import com.datn.dms.dtos.country.response.AdminCountryResponse;
import com.datn.dms.dtos.country.response.CountryResponse;
import com.datn.dms.entities.CountryEntity;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public abstract class CountryMapper {
    public abstract CountryResponse toCountryResponse(CountryEntity countryEntity);

    @Mapping(target = "flag", source = "thumbnailUrl")
    @Mapping(target = "isoCode", source = "code")
    @Mapping(target = "userCount", expression = "java(countryEntity.getUsers() != null ? countryEntity.getUsers().size() : 0)")
    public abstract AdminCountryResponse toAdminCountryResponse(CountryEntity countryEntity);
}
