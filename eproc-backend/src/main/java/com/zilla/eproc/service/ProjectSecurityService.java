package com.zilla.eproc.service;

import com.zilla.eproc.model.ProjectAssignment;
import com.zilla.eproc.model.ProjectRole;
import com.zilla.eproc.model.Role;
import com.zilla.eproc.model.User;
import com.zilla.eproc.repository.ProjectAssignmentRepository;
import com.zilla.eproc.repository.ProjectRepository;
import com.zilla.eproc.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;

@Service
@RequiredArgsConstructor
public class ProjectSecurityService {

    private final ProjectAssignmentRepository projectAssignmentRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    /**
     * Validate that a user has access to a project with one of the required roles.
     * Enforces:
     * 1. User exists and is active.
     * 2. User is Project Owner (System Role) OR has a valid ProjectAssignment.
     * 3. Assignment is active and within date range.
     * 4. Assignment matches one of the required roles.
     */
    @Transactional(readOnly = true)
    public void validateProjectAccess(String email, Long projectId, ProjectRole... requiredRoles) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new RuntimeException("User account is inactive");
        }

        // Check if Project exists
        if (!projectRepository.existsById(projectId)) {
            throw new RuntimeException("Project not found");
        }

        // 1. Check if user is PROJECT_OWNER (System Role) - usually has access to
        // everything
        if (user.getRole() == Role.OWNER) {
            // Further check: Is this owner actually the owner of the project?
            // Depends on business Logic. Usually Owner can access all their projects.
            // For now, if system role is OWNER, we might check if they own THIS project.
            // Implementing strict check:
            boolean isOwner = projectRepository.findById(projectId)
                    .map(p -> p.getOwner() != null && p.getOwner().getId().equals(user.getId()))
                    .orElse(false);
            if (isOwner)
                return;
        }

        // 2. Check Project Assignment
        ProjectAssignment assignment = projectAssignmentRepository.findByUserEmailAndProjectId(email, projectId)
                .orElseThrow(() -> new RuntimeException("User is not assigned to this project"));

        // 3. Validate Assignment Status and Dates
        if (!Boolean.TRUE.equals(assignment.getIsActive())) {
            throw new RuntimeException("Project assignment is inactive");
        }

        LocalDate now = LocalDate.now();
        if (assignment.getStartDate() != null && now.isBefore(assignment.getStartDate())) {
            throw new RuntimeException("Project assignment has not started yet");
        }
        if (assignment.getEndDate() != null && now.isAfter(assignment.getEndDate())) {
            throw new RuntimeException("Project assignment has expired");
        }

        // 4. Validate Role
        if (requiredRoles.length > 0) {
            boolean hasRole = Arrays.stream(requiredRoles)
                    .anyMatch(role -> role == assignment.getRole());
            if (!hasRole) {
                throw new RuntimeException(
                        "User does not have required project role: " + Arrays.toString(requiredRoles));
            }
        }
    }

    public boolean hasProjectAccess(String email, Long projectId) {
        try {
            validateProjectAccess(email, projectId);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public void validateProjectOwner(String email, Long projectId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isOwner = projectRepository.findById(projectId)
                .map(p -> p.getOwner() != null && p.getOwner().getId().equals(user.getId()))
                .orElse(false);

        if (!isOwner) {
            throw new RuntimeException("User is not the owner of this project");
        }
    }
}
