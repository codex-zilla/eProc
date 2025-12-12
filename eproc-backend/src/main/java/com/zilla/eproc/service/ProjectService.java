package com.zilla.eproc.service;

import com.zilla.eproc.dto.ProjectDTO;
import com.zilla.eproc.model.Project;
import com.zilla.eproc.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public List<ProjectDTO> getAllProjects() {
        return projectRepository.findByIsActiveTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectDTO createProject(ProjectDTO dto) {
        Project project = Project.builder()
                .name(dto.getName())
                .owner(dto.getOwner())
                .currency(dto.getCurrency() != null ? dto.getCurrency() : "TZS")
                .budgetTotal(dto.getBudgetTotal())
                .isActive(true)
                .build();

        Project saved = projectRepository.save(project);
        return mapToDTO(saved);
    }

    private ProjectDTO mapToDTO(Project project) {
        return ProjectDTO.builder()
                .id(project.getId())
                .name(project.getName())
                .owner(project.getOwner())
                .currency(project.getCurrency())
                .budgetTotal(project.getBudgetTotal())
                .isActive(project.getIsActive())
                .createdAt(project.getCreatedAt())
                .build();
    }
}
