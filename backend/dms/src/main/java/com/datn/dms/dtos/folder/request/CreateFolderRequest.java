package com.datn.dms.dtos.folder.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateFolderRequest {
	String name;
	Long parentId;
}
