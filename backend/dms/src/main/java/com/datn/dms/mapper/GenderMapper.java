package com.datn.dms.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

import com.datn.dms.dtos.gender.response.GenderResponse;
import com.datn.dms.entities.GenderEntity;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public abstract class GenderMapper {
    public abstract GenderResponse toGenderResponse(GenderEntity genderEntity);
}
