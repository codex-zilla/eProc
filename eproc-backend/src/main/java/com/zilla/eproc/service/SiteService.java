package com.zilla.eproc.service;

import com.zilla.eproc.dto.SiteDTO;
import com.zilla.eproc.model.Project;
import com.zilla.eproc.model.Site;
import com.zilla.eproc.model.Role;
import com.zilla.eproc.model.User;
import com.zilla.eproc.repository.ProjectRepository;
import com.zilla.eproc.repository.SiteRepository;
import com.zilla.eproc.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for site operations.
 * Updated for Role Model Overhaul: boss → owner, engineer uses
 * ProjectAssignment.
 */
@Service
@RequiredArgsConstructor
public class SiteService extends BaseProjectService {

    private final SiteRepository siteRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<SiteDTO> getAllSites(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Site> sites;

        if (user.getRole() == Role.ENGINEER) {
            // Engineer sees sites via ProjectAssignment
            sites = siteRepository.findByUserAssignmentAndIsActiveTrue(user.getId());
        } else if (user.getRole() == Role.OWNER) {
            // Owner sees sites from their own projects
            sites = siteRepository.findByProjectOwnerIdAndIsActiveTrue(user.getId());
        } else {
            // SYSTEM_ADMIN and other roles see all active sites (or restrict as needed)
            sites = siteRepository.findByIsActiveTrue();
        }

        return sites.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SiteDTO> getSitesByProject(Long projectId, String userEmail) {
        checkAccess(userEmail, projectId);
        return siteRepository.findByProjectIdAndIsActiveTrue(projectId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public SiteDTO createSite(SiteDTO dto, String userEmail) {
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Validate Ownership
        checkOwner(userEmail, project.getId());

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

    @Transactional
    public SiteDTO updateSite(Long id, SiteDTO dto, String userEmail) {
        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Site not found"));

        // Validate Ownership of the project this site belongs to
        checkOwner(userEmail, site.getProject().getId());

        site.setName(dto.getName());
        site.setLocation(dto.getLocation());
        site.setBudgetCap(dto.getBudgetCap());
        site.setGpsCenter(dto.getGpsCenter());

        // Optional: Allow toggling active status via update
        if (dto.getIsActive() != null) {
            site.setIsActive(dto.getIsActive());
        }

        Site saved = siteRepository.save(site);
        return mapToDTO(saved);
    }

    @Transactional
    public void deleteSite(Long id, String userEmail) {
        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Site not found"));

        // Validate Ownership
        checkOwner(userEmail, site.getProject().getId());

        // Soft delete
        site.setIsActive(false);
        siteRepository.save(site);
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
