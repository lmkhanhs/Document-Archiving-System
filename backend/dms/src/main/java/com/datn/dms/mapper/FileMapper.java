package com.datn.dms.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.Mapping;

import com.datn.dms.dtos.color.response.ColorResponse;
import com.datn.dms.dtos.files.response.FileResponse;
import com.datn.dms.entities.ColorEntity;
import com.datn.dms.entities.FileEntity;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public abstract class FileMapper {
    @Mapping(target = "folderId", source = "folder.id")
    @Mapping(target = "colorCode", source = "color.hexCode")
    @Mapping(target = "ownerName", source = "owner.username")
    @Mapping(target = "ownerAvatar", source = "owner.thumbnailUrl")
    public abstract FileResponse toFileResponse(FileEntity fileEntity);

    protected ColorResponse toColorResponse(ColorEntity colorEntity) {
        if (colorEntity == null) {
            return null;
        }

        return ColorResponse.builder()
                .id(colorEntity.getId())
                .name(colorEntity.getName())
                .hexCode(colorEntity.getHexCode())
                .position(colorEntity.getPosition())
                .isDeleted(colorEntity.isDeleted())
                .build();
    }
}
