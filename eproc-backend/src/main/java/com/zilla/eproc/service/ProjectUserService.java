package com.zilla.eproc.service;

import com.zilla.eproc.dto.CreateProjectUserRequest;
import com.zilla.eproc.dto.ProjectAssignmentDTO;
import com.zilla.eproc.dto.ProjectUserDTO;
import com.zilla.eproc.exception.ForbiddenException;
import com.zilla.eproc.exception.ResourceNotFoundException;
import com.zilla.eproc.model.*;
import com.zilla.eproc.repository.ProjectAssignmentRepository;
import com.zilla.eproc.repository.ProjectRepository;
import com.zilla.eproc.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing project-bound users (PROJECT_MANAGER and
 * PROJECT_ACCOUNTANT).
 * Allows project owners to create user accounts and assign them to projects.
 */
@Service
@RequiredArgsConstructor
public class ProjectUserService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectAssignmentRepository assignmentRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String DEFAULT_PASSWORD = "123456";

    /**
     * Create a new project-bound user with a default password.
     * User will be required to change password on first login.
     */
    @Transactional
    public ProjectUserDTO createProjectUser(CreateProjectUserRequest request, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify owner has PROJECT_OWNER role
        if (owner.getRole() != Role.PROJECT_OWNER) {
            throw new ForbiddenException("Only project owners can create project-bound users");
        }

        // Verify the project belongs to this owner
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (!project.isOwner(owner)) {
            throw new ForbiddenException("You can only assign users to your own projects");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Validate role
        Role role;
        try {
            role = Role.valueOf(request.getRole());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + request.getRole());
        }

        if (role != Role.PROJECT_MANAGER && role != Role.PROJECT_ACCOUNTANT) {
            throw new IllegalArgumentException(
                    "Only PROJECT_MANAGER and PROJECT_ACCOUNTANT roles can be created this way");
        }

        // Create user with default password
        User user = User.builder()
                .email(request.getEmail())
                .name(request.getName())
                .role(role)
                .phoneNumber(request.getPhoneNumber())
                .passwordHash(passwordEncoder.encode(DEFAULT_PASSWORD))
                .createdBy(owner.getId())
                .requirePasswordChange(true)
                .active(true)
                .build();

        User savedUser = userRepository.save(user);

        // Create initial project assignment
        ResponsibilityLevel responsibilityLevel = ResponsibilityLevel.FULL;
        if (request.getResponsibilityLevel() != null && !request.getResponsibilityLevel().isBlank()) {
            try {
                responsibilityLevel = ResponsibilityLevel.valueOf(request.getResponsibilityLevel());
            } catch (IllegalArgumentException e) {
                // Use default FULL
            }
        }

        // Map system role to project role for assignment
        ProjectRole projectRole = mapToProjectRole(role);

        ProjectAssignment assignment = ProjectAssignment.builder()
                .project(project)
                .user(savedUser)
                .role(projectRole)
                .responsibilityLevel(responsibilityLevel)
                .startDate(LocalDate.parse(request.getStartDate()))
                .isActive(true)
                .build();

        assignmentRepository.save(assignment);

        return mapToProjectUserDTO(savedUser);
    }

    /**
     * Get all users created by the logged-in project owner.
     */
    @Transactional(readOnly = true)
    public List<ProjectUserDTO> getMyProjectUsers(String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Find all users created by this owner
        List<User> users = userRepository.findByCreatedBy(owner.getId());

        return users.stream()
                .map(this::mapToProjectUserDTO)
                .collect(Collectors.toList());
    }

    /**
     * Assign an existing project-bound user to another project.
     */
    @Transactional
    public ProjectUserDTO assignUserToProject(Long userId, Long projectId, String ownerEmail,
            String projectRoleStr, String startDateStr, String responsibilityLevelStr) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify this user was created by the owner
        if (!user.getCreatedBy().equals(owner.getId())) {
            throw new ForbiddenException("You can only manage users you created");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (!project.isOwner(owner)) {
            throw new ForbiddenException("You can only assign users to your own projects");
        }

        // Parse project role
        ProjectRole projectRole;
        try {
            projectRole = ProjectRole.valueOf(projectRoleStr);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid project role: " + projectRoleStr);
        }

        if (projectRole != ProjectRole.PROJECT_MANAGER && projectRole != ProjectRole.PROJECT_ACCOUNTANT) {
            throw new IllegalArgumentException("Can only assign PROJECT_MANAGER or PROJECT_ACCOUNTANT roles");
        }

        // Check if user already has an active assignment on this project
        if (assignmentRepository.existsByProjectIdAndUserIdAndIsActiveTrue(projectId, userId)) {
            throw new IllegalArgumentException("User is already assigned to this project");
        }

        // Check if there's an existing assignment with the same role (could be
        // inactive)
        var existingAssignment = assignmentRepository
                .findByProjectIdAndUserIdAndRole(projectId, userId, projectRole);

        ResponsibilityLevel responsibilityLevel = ResponsibilityLevel.FULL;
        if (responsibilityLevelStr != null && !responsibilityLevelStr.isBlank()) {
            try {
                responsibilityLevel = ResponsibilityLevel.valueOf(responsibilityLevelStr);
            } catch (IllegalArgumentException e) {
                // Use default
            }
        }

        if (existingAssignment.isPresent()) {
            // Reactivate existing assignment
            ProjectAssignment assignment = existingAssignment.get();
            assignment.setIsActive(true);
            assignment.setResponsibilityLevel(responsibilityLevel);
            assignment.setStartDate(LocalDate.parse(startDateStr));
            assignment.setEndDate(null); // Clear end date
            assignmentRepository.save(assignment);
        } else {
            // Create new assignment
            ProjectAssignment assignment = ProjectAssignment.builder()
                    .project(project)
                    .user(user)
                    .role(projectRole)
                    .responsibilityLevel(responsibilityLevel)
                    .startDate(LocalDate.parse(startDateStr))
                    .isActive(true)
                    .build();

            assignmentRepository.save(assignment);
        }

        return mapToProjectUserDTO(user);
    }

    /**
     * Remove a user from a project (soft delete the assignment).
     */
    @Transactional
    public void removeUserFromProject(Long userId, Long projectId, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify this user was created by the owner
        if (!user.getCreatedBy().equals(owner.getId())) {
            throw new ForbiddenException("You can only manage users you created");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (!project.isOwner(owner)) {
            throw new ForbiddenException("You can only manage your own projects");
        }

        // Find the active assignment
        ProjectAssignment assignment = assignmentRepository
                .findByProjectIdAndUserIdAndIsActiveTrue(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        // Soft delete
        assignment.setIsActive(false);
        assignment.setEndDate(LocalDate.now());
        assignmentRepository.save(assignment);
    }

    // ==================== Helper Methods ====================

    private ProjectRole mapToProjectRole(Role systemRole) {
        return switch (systemRole) {
            case PROJECT_MANAGER -> ProjectRole.PROJECT_MANAGER;
            case PROJECT_ACCOUNTANT -> ProjectRole.PROJECT_ACCOUNTANT;
            default -> throw new IllegalArgumentException("Cannot map system role " + systemRole + " to project role");
        };
    }

    private ProjectUserDTO mapToProjectUserDTO(User user) {
        // Get all active project assignments
        List<ProjectAssignment> assignments = assignmentRepository
                .findByUserIdAndIsActiveTrue(user.getId());

        List<ProjectAssignmentDTO> projectDTOs = assignments.stream()
                .map(this::mapAssignmentToDTO)
                .collect(Collectors.toList());

        return ProjectUserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .phoneNumber(user.getPhoneNumber())
                .activeProjectCount(projectDTOs.size())
                .projects(projectDTOs)
                .createdBy(user.getCreatedBy())
                .createdAt(user.getCreatedAt())
                .requirePasswordChange(user.getRequirePasswordChange())
                .active(user.getActive())
                .build();
    }

    private ProjectAssignmentDTO mapAssignmentToDTO(ProjectAssignment assignment) {
        return ProjectAssignmentDTO.builder()
                .id(assignment.getId())
                .projectId(assignment.getProject().getId())
                .projectName(assignment.getProject().getName())
                .userId(assignment.getUser().getId())
                .userName(assignment.getUser().getName())
                .userEmail(assignment.getUser().getEmail())
                .role(assignment.getRole().name())
                .responsibilityLevel(assignment.getResponsibilityLevel().name())
                .startDate(assignment.getStartDate())
                .endDate(assignment.getEndDate())
                .isActive(assignment.getIsActive())
                .createdAt(assignment.getCreatedAt())
                .build();
    }
}
