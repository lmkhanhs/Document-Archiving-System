package com.datn.dms.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.datn.dms.dtos.color.request.CreateColorRequest;
import com.datn.dms.dtos.color.request.UpdateColorRequest;
import com.datn.dms.dtos.color.response.ColorResponse;
import com.datn.dms.entities.ColorEntity;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public abstract class ColorMapper {
    public abstract ColorEntity toColorEntity(CreateColorRequest request);

    @Mapping(target = "isDeleted", source = "deleted")
    public abstract ColorResponse toColorResponse(ColorEntity colorEntity);

    // Update color
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    public abstract void updateColorEntity(UpdateColorRequest request, @MappingTarget ColorEntity entity);
}
