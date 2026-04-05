package com.datn.dms.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.datn.dms.dtos.color.request.CreateColorRequest;
import com.datn.dms.dtos.color.request.UpdateColorRequest;
import com.datn.dms.dtos.color.response.ColorResponse;
import com.datn.dms.entities.ColorEntity;
import com.datn.dms.exception.AppException;
import com.datn.dms.exception.ErrorCode;
import com.datn.dms.mapper.ColorMapper;
import com.datn.dms.repositories.ColorRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ColorService {
    ColorRepository colorRepository;
    ColorMapper colorMapper;

    public ColorResponse createColor(CreateColorRequest request) {
        if (colorRepository.findByHexCode(request.getHexCode()).isPresent()) {
            throw new AppException(ErrorCode.COLOR_EXISTED);
        }

        ColorEntity colorEntity = colorMapper.toColorEntity(request);
        colorEntity.setPosition((int)colorRepository.count() + 1);
        
        colorEntity = colorRepository.save(colorEntity);

        return colorMapper.toColorResponse(colorEntity);
    }

    public ColorResponse updateColor(UpdateColorRequest request) {
        ColorEntity colorEntity = colorRepository.findById(request.getId())
                .orElseThrow(() -> new AppException(ErrorCode.COLOR_NOT_FOUND));

        colorMapper.updateColorEntity(request, colorEntity);

        colorEntity = colorRepository.save(colorEntity);

        return colorMapper.toColorResponse(colorEntity);
    }

    public void deleteColor(Long id) {
        ColorEntity colorEntity = colorRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COLOR_NOT_FOUND));

        colorEntity.setDeleted(true);

        colorRepository.save(colorEntity);
    }

    public List<ColorResponse> getAllColors(Pageable pageable) {
        List<ColorEntity> colors = colorRepository.findAllByIsDeletedFalse(pageable).getContent();
        return colors.stream()
                .map(colorMapper::toColorResponse)
                .collect(Collectors.toList());
    }

    // restone 
    public void restoreColor(Long id) {
        ColorEntity colorEntity = colorRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COLOR_NOT_FOUND));

        colorEntity.setDeleted(false);

        colorRepository.save(colorEntity);
    }

    // get all deleted colors
    public List<ColorResponse> getAllDeletedColors() {
        return colorRepository.findAll().stream()
                .filter(ColorEntity::isDeleted)
                .map(colorMapper::toColorResponse)
                .collect(Collectors.toList());
    }
}
