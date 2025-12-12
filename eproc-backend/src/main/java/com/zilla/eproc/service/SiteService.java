package com.zilla.eproc.service;

import com.zilla.eproc.dto.SiteDTO;
import com.zilla.eproc.model.Project;
import com.zilla.eproc.model.Site;
import com.zilla.eproc.repository.ProjectRepository;
import com.zilla.eproc.repository.SiteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SiteService {

    private final SiteRepository siteRepository;
    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public List<SiteDTO> getAllSites() {
        return siteRepository.findByIsActiveTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public SiteDTO createSite(SiteDTO dto) {
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Site site = Site.builder()
                .project(project)
                .name(dto.getName())
                .location(dto.getLocation())
                .budgetCap(dto.getBudgetCap())
                .gpsCenter(dto.getGpsCenter())
                .isActive(true)
                .build();

        Site saved = siteRepository.save(site);
        return mapToDTO(saved);
    }

    private SiteDTO mapToDTO(Site site) {
        return SiteDTO.builder()
                .id(site.getId())
                .projectId(site.getProject().getId())
                .name(site.getName())
                .location(site.getLocation())
                .budgetCap(site.getBudgetCap())
                .gpsCenter(site.getGpsCenter())
                .isActive(site.getIsActive())
                .createdAt(site.getCreatedAt())
                .build();
    }
}
