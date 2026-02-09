package com.zilla.eproc.controller;

import com.zilla.eproc.dto.ProjectDTO;
import com.zilla.eproc.dto.UpdateProjectStatusDTO;
import com.zilla.eproc.dto.UserSummaryDTO;
import com.zilla.eproc.model.ProjectStatus;
import com.zilla.eproc.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for project operations.
 * Updated for Role Model Overhaul: boss → owner, PROJECT_MANAGER →
 * PROJECT_OWNER
 */
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    /**
     * Get projects visible to the current user.
     * PROJECT_OWNER: sees only their own projects.
     * ENGINEER: sees projects they have assignments on.
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ProjectDTO>> getProjects(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(projectService.getProjectsForUser(email));
    }

    /**
     * Get a specific project by ID (with authorization check).
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectDTO> getProjectById(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(projectService.getProjectById(id, email));
    }

    /**
     * Create a new project.
     * Current user becomes the project owner.
     * Only PROJECT_OWNER can create projects.
     */
    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ProjectDTO> createProject(
            @Valid @RequestBody ProjectDTO dto,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(projectService.createProject(dto, email));
    }

    /**
     * Update an existing project.
     * Only PROJECT_OWNER can update.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ProjectDTO> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectDTO dto,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(projectService.updateProject(id, dto, email));
    }

    /**
     * Update project status.
     * Only the project owner can update status.
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ProjectDTO> updateProjectStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProjectStatusDTO dto,
            Authentication authentication) {
        String email = authentication.getName();
        ProjectStatus newStatus = ProjectStatus.valueOf(dto.getStatus());
        return ResponseEntity.ok(projectService.updateProjectStatus(id, newStatus, email));
    }

    /**
     * Get list of engineers available for assignment.
     * Only PROJECT_OWNER can access this.
     */
    @GetMapping("/available-engineers")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<UserSummaryDTO>> getAvailableEngineers() {
        return ResponseEntity.ok(projectService.getAvailableEngineers());
    }
}
