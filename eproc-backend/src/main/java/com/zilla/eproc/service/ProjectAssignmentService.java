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

        // Check if user already has this role on project
        if (assignmentRepository.existsByProjectIdAndUserIdAndRoleAndIsActiveTrue(projectId, member.getId(), role)) {
            throw new IllegalStateException("User already has this role on the project");
        }

        // Validate ERB number for engineer roles
        if (isEngineerRole(role) && (member.getErbNumber() == null || member.getErbNumber().isBlank())) {
            throw new IllegalArgumentException("Engineer must have a valid ERB number");
        }

        // Parse responsibility level (default to FULL)
        ResponsibilityLevel responsibilityLevel = ResponsibilityLevel.FULL;
        if (request.getResponsibilityLevel() != null && !request.getResponsibilityLevel().isBlank()) {
            try {
                responsibilityLevel = ResponsibilityLevel.valueOf(request.getResponsibilityLevel());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid responsibility level: " + request.getResponsibilityLevel());
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

        if (!project.isOwner(owner)) {
            throw new ForbiddenException("Only the project owner can remove team members");
        }

        ProjectAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        if (!assignment.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("Assignment does not belong to this project");
        }

        assignment.setIsActive(false);
        assignment.setEndDate(java.time.LocalDate.now());
        assignmentRepository.save(assignment);
    }

    // ==================== Private Helper Methods ====================

    private boolean isEngineerRole(ProjectRole role) {
        return role == ProjectRole.LEAD_ENGINEER ||
                role == ProjectRole.CIVIL_ENGINEER ||
                role == ProjectRole.ELECTRICAL_ENGINEER ||
                role == ProjectRole.MECHANICAL_ENGINEER ||
                role == ProjectRole.SITE_ENGINEER;
    }

    private ProjectAssignmentDTO mapToDTO(ProjectAssignment assignment) {
        ProjectAssignmentDTO.ProjectAssignmentDTOBuilder builder = ProjectAssignmentDTO.builder()
                .id(assignment.getId())
                .projectId(assignment.getProject().getId())
                .projectName(assignment.getProject().getName())
                .userId(assignment.getUser().getId())
                .userName(assignment.getUser().getName())
                .userEmail(assignment.getUser().getEmail())
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
