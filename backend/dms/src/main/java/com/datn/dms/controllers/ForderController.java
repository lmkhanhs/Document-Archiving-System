package com.datn.dms.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.datn.dms.dtos.ApiResponse;
import com.datn.dms.dtos.folder.request.CreateFolderRequest;
import com.datn.dms.dtos.folder.request.UpdateFolderRequest;
import com.datn.dms.dtos.folder.response.CreateFolderResponse;
import com.datn.dms.dtos.folder.response.FolderResponse;
import com.datn.dms.services.FolderService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;



@RestController
@RequestMapping("${app.prefix}/folders")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ForderController {
	FolderService folderService;

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ApiResponse<CreateFolderResponse> createFolder(@RequestBody CreateFolderRequest request) {
		return ApiResponse.<CreateFolderResponse>builder()
				.code(HttpStatus.CREATED.value())
				.message("Create folder successfully")
				.data(folderService.createFolder(request))
				.build();
	}

	@GetMapping
	public ApiResponse<List<FolderResponse>> getAllActiveFolders() {
		return ApiResponse.<List<FolderResponse>>builder()
				.code(HttpStatus.OK.value())
				.message("Get active folders successfully")
				.data(folderService.getAllActiveFolders())
				.build();
	}

	@GetMapping("/{folderId}")
	public ApiResponse<List<FolderResponse>> getActiveFoldersByParentId(@PathVariable Long folderId) {
		return ApiResponse.<List<FolderResponse>>builder()
				.code(HttpStatus.OK.value())
				.message("Get child folders by parent id successfully")
				.data(folderService.getActiveFoldersByParentId(folderId))
				.build();
	}

	@GetMapping("/root")
	public ApiResponse<List<FolderResponse>> getActiveRootFolders() {
		return ApiResponse.<List<FolderResponse>>builder()
				.code(HttpStatus.OK.value())
				.message("Get active root folders successfully")
				.data(folderService.getActiveRootFolders())
				.build();
	}
	

    @PutMapping("/{id}")
    public ApiResponse<FolderResponse> updateFolder(@PathVariable Long id, @RequestBody UpdateFolderRequest request) {
        return ApiResponse.<FolderResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Update folder successfully")
                .data(folderService.updateFolder(id, request))
                .build();
    }

	

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteFolder(@PathVariable Long id) {
        folderService.deleteFolder(id);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Delete folder successfully")
                .build();
    }

    @DeleteMapping("/{id}/force")
    public ApiResponse<Void> forceDeleteFolder(@PathVariable Long id) {
        folderService.forceDeleteFolder(id);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Force delete folder successfully")
                .build();
    }
    
    @PutMapping("restore/{id}")
    public ApiResponse<FolderResponse> restoreFolder(@PathVariable Long id) {
        return ApiResponse.<FolderResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Restore folder successfully")
                .data(folderService.restoreFolder(id))
                .build();
    }

	@GetMapping("/trash")
	public ApiResponse<List<FolderResponse>> getTrashFolders() {
		return ApiResponse.<List<FolderResponse>>builder()
				.code(HttpStatus.OK.value())
				.message("Get trash folders successfully")
				.data(folderService.getTrashFolders())
				.build();
	}
}
