package com.datn.dms.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

import com.datn.dms.dtos.country.response.CountryResponse;
import com.datn.dms.entities.CountryEntity;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public abstract class CountryMapper {
    public abstract CountryResponse toCountryResponse(CountryEntity countryEntity);
}
