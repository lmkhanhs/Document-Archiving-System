package com.datn.dms.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.Mapping;

import com.datn.dms.dtos.files.response.FileResponse;
import com.datn.dms.entities.FileEntity;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public abstract class FileMapper {
    @Mapping(target = "folderId", source = "folder.id")
    @Mapping(target = "colorCode", source = "color.hexCode")
    public abstract FileResponse toFileResponse(FileEntity fileEntity);
}
