package com.zilla.eproc.service;

import com.zilla.eproc.dto.ProjectDTO;
import com.zilla.eproc.dto.UserSummaryDTO;
import com.zilla.eproc.exception.ForbiddenException;
import com.zilla.eproc.exception.ResourceNotFoundException;
import com.zilla.eproc.model.Project;
import com.zilla.eproc.model.ProjectAssignment;
import com.zilla.eproc.model.ProjectRole;
import com.zilla.eproc.model.ProjectStatus;
import com.zilla.eproc.model.Role;
import com.zilla.eproc.model.User;
import com.zilla.eproc.repository.ProjectAssignmentRepository;
import com.zilla.eproc.repository.ProjectRepository;
import com.zilla.eproc.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for project operations with project-centric authorization.
 * Updated for Role Model Overhaul: boss → owner, engineer field removed.
 */
@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectAssignmentRepository projectAssignmentRepository;

    /**
     * Get projects visible to the current user based on their role.
     * - PROJECT_OWNER: sees only projects they own (owner_id = user.id)
     * - ENGINEER: sees projects where they have a ProjectAssignment
     */
    @Transactional(readOnly = true)
    public List<ProjectDTO> getProjectsForUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Project> projects;

        if (user.getRole() == Role.PROJECT_OWNER) {
            // Owner sees their own projects
            projects = projectRepository.findByOwnerIdAndIsActiveTrue(user.getId());
        } else if (user.getRole() == Role.ENGINEER) {
            // Engineer sees projects via team assignments
            List<Long> projectIds = projectAssignmentRepository.findByUserIdAndIsActiveTrue(user.getId())
                    .stream()
                    .map(pa -> pa.getProject().getId())
                    .collect(Collectors.toList());
            projects = projectRepository.findAllById(projectIds).stream()
                    .filter(p -> Boolean.TRUE.equals(p.getIsActive()))
                    .collect(Collectors.toList());
        } else {
            // SYSTEM_ADMIN and others - show all active
            projects = projectRepository.findByIsActiveTrue();
        }

        return projects.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Create a new project with the authenticated user as the owner.
     * Only PROJECT_OWNER can create projects.
     * Automatically creates an OWNER assignment for the creator.
     */
    @SuppressWarnings("deprecation")
    @Transactional
    public ProjectDTO createProject(ProjectDTO dto, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (owner.getRole() != Role.PROJECT_OWNER) {
            throw new ForbiddenException("Only Project Owners can create projects");
        }

        Project project = Project.builder()
                .name(dto.getName())
                .ownerEmail(owner.getEmail()) // deprecated legacy field
                .owner(owner)
                .currency(dto.getCurrency() != null ? dto.getCurrency() : "TZS")
                .budgetTotal(dto.getBudgetTotal())
                .description(dto.getDescription())
                .siteLocation(dto.getSiteLocation())
                .region(dto.getRegion())
                .district(dto.getDistrict())
                .ward(dto.getWard())
                .status(ProjectStatus.ACTIVE)
                .isActive(true)
                // Core Identification
                .code(dto.getCode())
                .industry(dto.getIndustry() != null ? com.zilla.eproc.model.Industry.valueOf(dto.getIndustry()) : null)
                .projectType(
                        dto.getProjectType() != null ? com.zilla.eproc.model.ProjectType.valueOf(dto.getProjectType())
                                : null)
                // Owner Rep
                .ownerRepName(dto.getOwnerRepName())
                .ownerRepContact(dto.getOwnerRepContact())
                // Location Details
                .plotNumber(dto.getPlotNumber())
                .gpsCoordinates(dto.getGpsCoordinates())
                .titleDeedAvailable(dto.getTitleDeedAvailable())
                .siteAccessNotes(dto.getSiteAccessNotes())
                // Project Context
                .keyObjectives(dto.getKeyObjectives())
                .expectedOutput(dto.getExpectedOutput())
                // Timeline
                .startDate(dto.getStartDate())
                .expectedCompletionDate(dto.getExpectedCompletionDate())
                // Contractual
                .contractType(dto.getContractType() != null
                        ? com.zilla.eproc.model.ContractType.valueOf(dto.getContractType())
                        : null)
                .defectsLiabilityPeriod(dto.getDefectsLiabilityPeriod())
                .performanceSecurityRequired(dto.getPerformanceSecurityRequired())
                .build();

        Project saved = projectRepository.save(project);

        // Auto-create OWNER assignment (immutable)
        ProjectAssignment ownerAssignment = ProjectAssignment.builder()
                .project(saved)
                .user(owner)
                .role(ProjectRole.OWNER)
                .startDate(LocalDate.now())
                .isActive(true)
                .build();
        projectAssignmentRepository.save(ownerAssignment);

        return mapToDTO(saved);
    }

    /**
     * Update project status.
     * Validates owner ownership.
     */
    @Transactional
    public ProjectDTO updateProjectStatus(Long projectId, ProjectStatus newStatus, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // Authorization: only project owner can update status
        if (!project.isOwner(owner)) {
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
     * An engineer is available based on system role (actual availability
     * logic can be enhanced later based on assignment count, etc.).
     */
    @Transactional(readOnly = true)
    public List<UserSummaryDTO> getAvailableEngineers() {
        return userRepository.findByRoleAndActiveTrue(Role.ENGINEER).stream()
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
        if (user.getRole() == Role.PROJECT_OWNER && !project.isOwner(user)) {
            throw new ForbiddenException("You can only view your own projects");
        }
        if (user.getRole() == Role.ENGINEER) {
            // Check if user has an assignment on this project
            boolean hasAssignment = projectAssignmentRepository
                    .findByProjectIdAndUserIdAndIsActiveTrue(projectId, user.getId())
                    .isPresent();
            if (!hasAssignment) {
                throw new ForbiddenException("You can only view projects you are assigned to");
            }
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
                .ownerEmail(project.getOwnerEmail())
                .currency(project.getCurrency())
                .budgetTotal(project.getBudgetTotal())
                .description(project.getDescription())
                .siteLocation(project.getSiteLocation())
                .region(project.getRegion())
                .district(project.getDistrict())
                .ward(project.getWard())
                .isActive(project.getIsActive())
                .createdAt(project.getCreatedAt())
                .status(project.getStatus() != null ? project.getStatus().name() : null)
                // Core Identification
                .code(project.getCode())
                .industry(project.getIndustry() != null ? project.getIndustry().name() : null)
                .projectType(project.getProjectType() != null ? project.getProjectType().name() : null)
                // Owner Rep
                .ownerRepName(project.getOwnerRepName())
                .ownerRepContact(project.getOwnerRepContact())
                // Location Details
                .plotNumber(project.getPlotNumber())
                .gpsCoordinates(project.getGpsCoordinates())
                .titleDeedAvailable(project.getTitleDeedAvailable())
                .siteAccessNotes(project.getSiteAccessNotes())
                // Project Context
                .keyObjectives(project.getKeyObjectives())
                .expectedOutput(project.getExpectedOutput())
                // Timeline
                .startDate(project.getStartDate())
                .expectedCompletionDate(project.getExpectedCompletionDate())
                // Contractual
                .contractType(project.getContractType() != null ? project.getContractType().name() : null)
                .defectsLiabilityPeriod(project.getDefectsLiabilityPeriod())
                .performanceSecurityRequired(project.getPerformanceSecurityRequired())
                // Summary counts
                .teamCount(project.getTeamAssignments() != null ? project.getTeamAssignments().size() : 0)
                .scopeCount(project.getScopes() != null ? project.getScopes().size() : 0)
                .milestoneCount(project.getMilestones() != null ? project.getMilestones().size() : 0)
                .documentCount(project.getDocuments() != null ? project.getDocuments().size() : 0);

        // Map owner info
        if (project.getOwner() != null) {
            builder.ownerId(project.getOwner().getId())
                    .ownerName(project.getOwner().getName());
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
