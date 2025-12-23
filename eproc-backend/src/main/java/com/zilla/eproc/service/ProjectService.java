package com.zilla.eproc.service;

import com.zilla.eproc.dto.ProjectDTO;
import com.zilla.eproc.dto.UserSummaryDTO;
import com.zilla.eproc.exception.ForbiddenException;
import com.zilla.eproc.exception.ResourceNotFoundException;
import com.zilla.eproc.model.Project;
import com.zilla.eproc.model.ProjectStatus;
import com.zilla.eproc.model.Role;
import com.zilla.eproc.model.User;
import com.zilla.eproc.repository.ProjectRepository;
import com.zilla.eproc.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for project operations with project-centric authorization.
 * Implements ADR: Project-Based Access Control.
 */
@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    /**
     * Get projects visible to the current user based on their role.
     * - PROJECT_MANAGER: sees only projects they own (boss_id = user.id)
     * - ENGINEER: sees only projects they are assigned to (engineer_id = user.id)
     * - ACCOUNTANT: sees projects from bosses they are linked to (future
     * enhancement)
     */
    @Transactional(readOnly = true)
    public List<ProjectDTO> getProjectsForUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Project> projects;

        if (user.getRole() == Role.PROJECT_MANAGER) {
            // Boss sees only their own projects
            projects = projectRepository.findByBossIdAndIsActiveTrue(user.getId());
        } else if (user.getRole() == Role.ENGINEER) {
            // Engineer sees only projects they are assigned to
            projects = projectRepository.findByEngineerIdAndIsActiveTrue(user.getId());
        } else {
            // Accountant and others - for now show all active (future: scope by linked
            // boss)
            projects = projectRepository.findByIsActiveTrue();
        }

        return projects.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Create a new project with the authenticated user as the boss.
     * Only PROJECT_MANAGER can create projects.
     */
    @SuppressWarnings("deprecation")
    @Transactional
    public ProjectDTO createProject(ProjectDTO dto, String bossEmail) {
        User boss = userRepository.findByEmail(bossEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (boss.getRole() != Role.PROJECT_MANAGER) {
            throw new ForbiddenException("Only Project Managers can create projects");
        }

        Project project = Project.builder()
                .name(dto.getName())
                .owner(boss.getEmail()) // deprecated but kept for backward compat
                .boss(boss)
                .currency(dto.getCurrency() != null ? dto.getCurrency() : "TZS")
                .budgetTotal(dto.getBudgetTotal())
                .description(dto.getDescription())
                .siteLocation(dto.getSiteLocation())
                .region(dto.getRegion())
                .district(dto.getDistrict())
                .ward(dto.getWard())
                .status(ProjectStatus.ACTIVE)
                .isActive(true)
                .build();

        Project saved = projectRepository.save(project);
        return mapToDTO(saved);
    }

    /**
     * Assign an engineer to a project.
     * Validates:
     * 1. Boss owns the project
     * 2. Engineer has no ACTIVE project assignment
     */
    @Transactional
    public ProjectDTO assignEngineer(Long projectId, Long engineerId, String bossEmail) {
        User boss = userRepository.findByEmail(bossEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // Authorization: only project owner can assign engineers
        if (!project.isBoss(boss)) {
            throw new ForbiddenException("Only the project owner can assign engineers");
        }

        User engineer = userRepository.findById(engineerId)
                .orElseThrow(() -> new ResourceNotFoundException("Engineer not found"));

        // Validate engineer role
        if (engineer.getRole() != Role.ENGINEER) {
            throw new IllegalArgumentException("User is not an engineer");
        }

        // Check engineer is not already assigned to an ACTIVE project
        Optional<Project> existingAssignment = projectRepository
                .findByEngineerIdAndStatus(engineerId, ProjectStatus.ACTIVE);

        if (existingAssignment.isPresent() && !existingAssignment.get().getId().equals(projectId)) {
            throw new IllegalStateException(
                    "Engineer is already assigned to an active project: " +
                            existingAssignment.get().getName());
        }

        project.setEngineer(engineer);
        Project saved = projectRepository.save(project);
        return mapToDTO(saved);
    }

    /**
     * Update project status.
     * Validates boss ownership.
     * When project is COMPLETED or CANCELLED, engineer becomes available.
     */
    @Transactional
    public ProjectDTO updateProjectStatus(Long projectId, ProjectStatus newStatus, String bossEmail) {
        User boss = userRepository.findByEmail(bossEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // Authorization: only project owner can update status
        if (!project.isBoss(boss)) {
            throw new ForbiddenException("Only the project owner can update project status");
        }

        project.setStatus(newStatus);

        // If project is no longer active, also mark isActive to false
        if (newStatus != ProjectStatus.ACTIVE) {
            project.setIsActive(false);
        }

        Project saved = projectRepository.save(project);
        return mapToDTO(saved);
    }

    /**
     * Get list of engineers available for assignment.
     * An engineer is available if they are not assigned to any ACTIVE project.
     */
    @Transactional(readOnly = true)
    public List<UserSummaryDTO> getAvailableEngineers() {
        return userRepository.findAvailableEngineers().stream()
                .map(this::mapUserToSummaryDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get a project by ID with authorization check.
     */
    @Transactional(readOnly = true)
    public ProjectDTO getProjectById(Long projectId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // Authorization check
        if (user.getRole() == Role.PROJECT_MANAGER && !project.isBoss(user)) {
            throw new ForbiddenException("You can only view your own projects");
        }
        if (user.getRole() == Role.ENGINEER && !project.isEngineer(user)) {
            throw new ForbiddenException("You can only view projects you are assigned to");
        }

        return mapToDTO(project);
    }

    // ==================== Legacy Methods (for backward compatibility)
    // ====================

    /**
     * @deprecated Use {@link #getProjectsForUser(String)} instead
     */
    @Deprecated
    @Transactional(readOnly = true)
    public List<ProjectDTO> getAllProjects() {
        return projectRepository.findByIsActiveTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // ==================== Private Helper Methods ====================

    @SuppressWarnings("deprecation")
    private ProjectDTO mapToDTO(Project project) {
        ProjectDTO.ProjectDTOBuilder builder = ProjectDTO.builder()
                .id(project.getId())
                .name(project.getName())
                .owner(project.getOwner())
                .currency(project.getCurrency())
                .budgetTotal(project.getBudgetTotal())
                .description(project.getDescription())
                .siteLocation(project.getSiteLocation())
                .region(project.getRegion())
                .district(project.getDistrict())
                .ward(project.getWard())
                .isActive(project.getIsActive())
                .createdAt(project.getCreatedAt())
                .status(project.getStatus() != null ? project.getStatus().name() : null);

        // Map boss info
        if (project.getBoss() != null) {
            builder.bossId(project.getBoss().getId())
                    .bossName(project.getBoss().getName())
                    .bossEmail(project.getBoss().getEmail());
        }

        // Map engineer info
        if (project.getEngineer() != null) {
            builder.engineerId(project.getEngineer().getId())
                    .engineerName(project.getEngineer().getName())
                    .engineerEmail(project.getEngineer().getEmail());
        }

        return builder.build();
    }

    private UserSummaryDTO mapUserToSummaryDTO(User user) {
        return UserSummaryDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
