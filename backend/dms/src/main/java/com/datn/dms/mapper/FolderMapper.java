package com.datn.dms.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.datn.dms.dtos.folder.request.UpdateFolderRequest;
import com.datn.dms.dtos.folder.response.FolderResponse;
import com.datn.dms.entities.FolderEntity;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public abstract class FolderMapper {
    @Mapping(target = "parentId", source = "parent.id")
    public abstract FolderResponse toFolderResponse(FolderEntity folderEntity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    public abstract void updateFolderFromRequest(UpdateFolderRequest request, @MappingTarget FolderEntity target);
}
