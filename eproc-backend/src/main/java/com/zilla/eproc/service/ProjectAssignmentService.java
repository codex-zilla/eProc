package com.zilla.eproc.service;

import com.zilla.eproc.dto.CreateAssignmentRequest;
import com.zilla.eproc.dto.ProjectAssignmentDTO;
import com.zilla.eproc.exception.ForbiddenException;
import com.zilla.eproc.exception.ResourceNotFoundException;
import com.zilla.eproc.model.*;
import com.zilla.eproc.repository.ProjectAssignmentRepository;
import com.zilla.eproc.repository.ProjectRepository;
import com.zilla.eproc.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing project team assignments.
 * Handles adding/removing users to projects with specific roles.
 * Updated for Role Model Overhaul: boss → owner
 */
@Service
@RequiredArgsConstructor
public class ProjectAssignmentService {

    private final ProjectAssignmentRepository assignmentRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    /**
     * Get all active assignments for a project.
     */
    @Transactional(readOnly = true)
    public List<ProjectAssignmentDTO> getProjectTeam(Long projectId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // Authorization: must be owner or assigned to project
        if (!project.isOwner(user)
                && !assignmentRepository.existsByProjectIdAndUserIdAndIsActiveTrue(projectId, user.getId())) {
            throw new ForbiddenException("You do not have access to this project");
        }

        return assignmentRepository.findByProjectIdAndIsActiveTrue(projectId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Add a user to a project with a specific role.
     * Only the project owner can add team members.
     */
    @Transactional
    public ProjectAssignmentDTO addTeamMember(Long projectId, CreateAssignmentRequest request, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // Authorization: only project owner can add team members
        if (!project.isOwner(owner)) {
            throw new ForbiddenException("Only the project owner can add team members");
        }

        User member = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Parse role
        ProjectRole role;
        try {
            role = ProjectRole.valueOf(request.getRole());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + request.getRole());
        }

        // Validate system role to project role compatibility
        validateRoleCompatibility(member, role);

        // Parse responsibility level (default to FULL)
        ResponsibilityLevel responsibilityLevel = ResponsibilityLevel.FULL;
        if (request.getResponsibilityLevel() != null && !request.getResponsibilityLevel().isBlank()) {
            try {
                responsibilityLevel = ResponsibilityLevel.valueOf(request.getResponsibilityLevel());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid responsibility level: " + request.getResponsibilityLevel());
            }
        }

        // Validate ERB number for engineer roles
        if (isEngineerRole(role) && (member.getErbNumber() == null || member.getErbNumber().isBlank())) {
            throw new IllegalArgumentException("Engineer must have a valid ERB number");
        }

        // Check if user already has an assignment with this role (Active or Inactive)
        // If inactive, reactivate it. If active, throw error.
        java.util.Optional<ProjectAssignment> existingAssignment = assignmentRepository
                .findByProjectIdAndUserIdAndRole(projectId, member.getId(), role);

        if (existingAssignment.isPresent()) {
            ProjectAssignment assignment = existingAssignment.get();
            if (assignment.getIsActive()) {
                throw new IllegalArgumentException("User already has this role on the project");
            } else {
                // Reactivate existing soft-deleted assignment
                assignment.setIsActive(true);
                assignment.setResponsibilityLevel(responsibilityLevel);
                assignment.setReportingLine(request.getReportingLine());
                assignment.setStartDate(request.getStartDate());
                assignment.setEndDate(null); // Clear end date

                ProjectAssignment saved = assignmentRepository.save(assignment);
                return mapToDTO(saved);
            }
        }
        ProjectAssignment assignment = ProjectAssignment.builder()
                .project(project)
                .user(member)
                .role(role)
                .responsibilityLevel(responsibilityLevel)
                .reportingLine(request.getReportingLine())
                .startDate(request.getStartDate())
                .isActive(true)
                .build();

        ProjectAssignment saved = assignmentRepository.save(assignment);
        return mapToDTO(saved);
    }

    /**
     * Remove a user from a project (end their assignment).
     */
    @Transactional
    public void removeTeamMember(Long projectId, Long assignmentId, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // Authorization: only project owner can remove team members
        if (!project.isOwner(owner)) {
            throw new ForbiddenException("Only the project owner can remove team members");
        }

        ProjectAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        if (!assignment.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("Assignment does not belong to this project");
        }

        // Prevent self-removal (Owner cannot remove themselves via this method)
        if (assignment.getUser() != null && assignment.getUser().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Project Owner cannot be removed from the project");
        }

        assignment.setIsActive(false);
        assignment.setEndDate(java.time.LocalDate.now());
        assignmentRepository.save(assignment);
    }

    /**
     * Update an existing team member's assignment details.
     */
    @Transactional
    public ProjectAssignmentDTO updateTeamMember(Long projectId, Long assignmentId, CreateAssignmentRequest request,
            String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // Authorization: only project owner can update team members
        if (!project.isOwner(owner)) {
            throw new ForbiddenException("Only the project owner can update team members");
        }

        ProjectAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        if (!assignment.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("Assignment does not belong to this project");
        }

        // Prevent updating self (Owner) role
        if (assignment.getUser() != null && assignment.getUser().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Project Owner assignment cannot be modified");
        }

        // Parse role
        if (request.getRole() != null) {
            try {
                ProjectAssignment.class.getDeclaredField("role"); // Quick check if field exists, actual enum check
                                                                  // below
                ProjectRole role = ProjectRole.valueOf(request.getRole());

                // Validate ERB if switching to engineer role
                if (isEngineerRole(role) && !isEngineerRole(assignment.getRole())) {
                    if (assignment.getUser() == null || assignment.getUser().getErbNumber() == null
                            || assignment.getUser().getErbNumber().isBlank()) {
                        throw new IllegalArgumentException("Cannot assign Engineer role: User has missing ERB number");
                    }
                }
                assignment.setRole(role);
            } catch (IllegalArgumentException | NoSuchFieldException e) {
                throw new IllegalArgumentException("Invalid role: " + request.getRole());
            }
        }

        // Parse responsibility level
        if (request.getResponsibilityLevel() != null) {
            try {
                assignment.setResponsibilityLevel(ResponsibilityLevel.valueOf(request.getResponsibilityLevel()));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid responsibility level: " + request.getResponsibilityLevel());
            }
        }

        if (request.getReportingLine() != null) {
            assignment.setReportingLine(request.getReportingLine());
        }

        // Note: Start Date usually shouldn't change for an existing assignment log,
        // but can be updated if correction is needed.
        if (request.getStartDate() != null) {
            assignment.setStartDate(request.getStartDate());
        }

        ProjectAssignment saved = assignmentRepository.save(assignment);
        return mapToDTO(saved);
    }

    // ==================== Private Helper Methods ====================

    private boolean isEngineerRole(ProjectRole role) {
        return role == ProjectRole.PROJECT_LEAD_ENGINEER ||
                role == ProjectRole.PROJECT_SITE_ENGINEER ||
                role == ProjectRole.PROJECT_CONSULTANT_ENGINEER;
    }

    /**
     * Validates that a user's System Role is compatible with the target Project
     * Role.
     * Enforces strict mapping:
     * - System ENGINEER -> ProjectRole.PROJECT_*_ENGINEER
     * - System MANAGER -> ProjectRole.PROJECT_MANAGER
     * - System ACCOUNTANT -> ProjectRole.PROJECT_ACCOUNTANT
     * - System OWNER -> ProjectRole.PROJECT_OWNER (usually automatic)
     */
    private void validateRoleCompatibility(User user, ProjectRole targetRole) {
        Role systemRole = user.getRole();
        boolean isCompatible = switch (systemRole) {
            case ENGINEER -> isEngineerRole(targetRole);
            case MANAGER -> targetRole == ProjectRole.PROJECT_MANAGER;
            case ACCOUNTANT -> targetRole == ProjectRole.PROJECT_ACCOUNTANT;
            case OWNER -> targetRole == ProjectRole.PROJECT_OWNER;
            case ADMIN -> true; // Admin can be assigned any role
        };

        if (!isCompatible) {
            throw new IllegalArgumentException(
                    String.format("User with system role %s cannot be assigned project role %s",
                            systemRole, targetRole));
        }
    }

    private ProjectAssignmentDTO mapToDTO(ProjectAssignment assignment) {
        // Handle null user (e.g., user was deleted)
        Long userId = null;
        String userName = "[Deleted User]";
        String userEmail = null;

        if (assignment.getUser() != null) {
            userId = assignment.getUser().getId();
            userName = assignment.getUser().getName();
            userEmail = assignment.getUser().getEmail();
        } else if (assignment.getDeletedUserSnapshot() != null) {
            userName = assignment.getDeletedUserSnapshot().getDeletedUserEmail() + " (deleted)";
        }

        ProjectAssignmentDTO.ProjectAssignmentDTOBuilder builder = ProjectAssignmentDTO.builder()
                .id(assignment.getId())
                .projectId(assignment.getProject().getId())
                .projectName(assignment.getProject().getName())
                .userId(userId)
                .userName(userName)
                .userEmail(userEmail)
                .role(assignment.getRole().name())
                .responsibilityLevel(assignment.getResponsibilityLevel().name())
                .reportingLine(assignment.getReportingLine())
                .startDate(assignment.getStartDate())
                .endDate(assignment.getEndDate())
                .isActive(assignment.getIsActive())
                .createdAt(assignment.getCreatedAt());

        return builder.build();
    }
}
