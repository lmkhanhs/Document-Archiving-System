package com.datn.dms.services;

import org.springframework.stereotype.Service;

import com.datn.dms.repositories.FileRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminDocumentService {
    FileRepository fileRepository;

    public long getTotalDocuments() {
        return fileRepository.count();
    }

    public long getDeletedDocuments() {
        return fileRepository.countByIsDeletedTrue();
    }
}
