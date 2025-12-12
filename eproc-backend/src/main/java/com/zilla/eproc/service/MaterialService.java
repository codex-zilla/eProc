package com.zilla.eproc.service;

import com.zilla.eproc.dto.MaterialDTO;
import com.zilla.eproc.model.Material;
import com.zilla.eproc.repository.MaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialRepository materialRepository;

    @Transactional(readOnly = true)
    public List<MaterialDTO> getAllMaterials() {
        return materialRepository.findByIsActiveTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MaterialDTO> searchMaterials(String query) {
        return materialRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(query).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private MaterialDTO mapToDTO(Material material) {
        return MaterialDTO.builder()
                .id(material.getId())
                .name(material.getName())
                .category(material.getCategory())
                .defaultUnit(material.getDefaultUnit())
                .unitType(material.getUnitType())
                .referencePrice(material.getReferencePrice())
                .isActive(material.getIsActive())
                .build();
    }
}
