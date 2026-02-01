package com.zilla.eproc.controller;

import com.zilla.eproc.dto.CreateProjectUserRequest;
import com.zilla.eproc.dto.ProjectUserDTO;
import com.zilla.eproc.service.ProjectUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing project-bound users.
 * Endpoints for creating PROJECT_MANAGER and PROJECT_ACCOUNTANT users.
 */
@RestController
@RequestMapping("/api/project-users")
@RequiredArgsConstructor
public class ProjectUserController {

    private final ProjectUserService projectUserService;

    /**
     * Create a new project-bound user.
     * POST /api/project-users
     */
    @PostMapping
    @PreAuthorize("hasRole('PROJECT_OWNER')")
    public ResponseEntity<ProjectUserDTO> createProjectUser(
            @Valid @RequestBody CreateProjectUserRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        ProjectUserDTO result = projectUserService.createProjectUser(request, email);
        return ResponseEntity.ok(result);
    }

    /**
     * Get all users created by the logged-in project owner.
     * GET /api/project-users
     */
    @GetMapping
    @PreAuthorize("hasRole('PROJECT_OWNER')")
    public ResponseEntity<List<ProjectUserDTO>> getMyProjectUsers(Authentication authentication) {
        String email = authentication.getName();
        List<ProjectUserDTO> users = projectUserService.getMyProjectUsers(email);
        return ResponseEntity.ok(users);
    }

    /**
     * Assign an existing user to a project.
     * POST /api/project-users/{userId}/assign
     */
    @PostMapping("/{userId}/assign")
    @PreAuthorize("hasRole('PROJECT_OWNER')")
    public ResponseEntity<ProjectUserDTO> assignUserToProject(
            @PathVariable Long userId,
            @RequestParam Long projectId,
            @RequestParam String role,
            @RequestParam String startDate,
            @RequestParam(required = false, defaultValue = "FULL") String responsibilityLevel,
            Authentication authentication) {
        String email = authentication.getName();
        ProjectUserDTO result = projectUserService.assignUserToProject(
                userId, projectId, email, role, startDate, responsibilityLevel);
        return ResponseEntity.ok(result);
    }

    /**
     * Remove a user from a project.
     * DELETE /api/project-users/{userId}/projects/{projectId}
     */
    @DeleteMapping("/{userId}/projects/{projectId}")
    @PreAuthorize("hasRole('PROJECT_OWNER')")
    public ResponseEntity<Void> removeUserFromProject(
            @PathVariable Long userId,
            @PathVariable Long projectId,
            Authentication authentication) {
        String email = authentication.getName();
        projectUserService.removeUserFromProject(userId, projectId, email);
        return ResponseEntity.noContent().build();
    }

    /**
     * Update user details (name, email, phone).
     * PATCH /api/project-users/{userId}
     */
    @PatchMapping("/{userId}")
    @PreAuthorize("hasRole('PROJECT_OWNER')")
    public ResponseEntity<ProjectUserDTO> updateUser(
            @PathVariable Long userId,
            @RequestBody CreateProjectUserRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        ProjectUserDTO result = projectUserService.updateUser(userId, request, email);
        return ResponseEntity.ok(result);
    }

    /**
     * Delete a user completely (hard delete with audit trail).
     * Removes user from all active assignments, creates audit snapshot, and
     * permanently deletes user.
     * DELETE /api/project-users/{userId}
     */
    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('PROJECT_OWNER')")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long userId,
            Authentication authentication) {
        String email = authentication.getName();
        projectUserService.deleteUser(userId, email);
        return ResponseEntity.noContent().build();
    }
}
