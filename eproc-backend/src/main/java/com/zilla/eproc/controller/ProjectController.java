package com.zilla.eproc.controller;

import com.zilla.eproc.dto.AssignEngineerDTO;
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
 * Implements ADR: Project-Centric Authorization.
 */
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    /**
     * Get projects visible to the current user.
     * PROJECT_MANAGER: sees only their own projects.
     * ENGINEER: sees only projects they are assigned to.
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
     * Current user becomes the project owner (boss).
     * Only PROJECT_MANAGER can create projects.
     */
    @PostMapping
    @PreAuthorize("hasRole('PROJECT_MANAGER')")
    public ResponseEntity<ProjectDTO> createProject(
            @Valid @RequestBody ProjectDTO dto,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(projectService.createProject(dto, email));
    }

    /**
     * Assign an engineer to a project.
     * Only the project owner (boss) can assign engineers.
     * Engineer must not be assigned to another ACTIVE project.
     */
    @PatchMapping("/{id}/engineer")
    @PreAuthorize("hasRole('PROJECT_MANAGER')")
    public ResponseEntity<ProjectDTO> assignEngineer(
            @PathVariable Long id,
            @Valid @RequestBody AssignEngineerDTO dto,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(projectService.assignEngineer(id, dto.getEngineerId(), email));
    }

    /**
     * Update project status.
     * Only the project owner (boss) can update status.
     * When status changes to COMPLETED or CANCELLED, engineer becomes available.
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('PROJECT_MANAGER')")
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
     * Only PROJECT_MANAGER can access this.
     */
    @GetMapping("/available-engineers")
    @PreAuthorize("hasRole('PROJECT_MANAGER')")
    public ResponseEntity<List<UserSummaryDTO>> getAvailableEngineers() {
        return ResponseEntity.ok(projectService.getAvailableEngineers());
    }
}
