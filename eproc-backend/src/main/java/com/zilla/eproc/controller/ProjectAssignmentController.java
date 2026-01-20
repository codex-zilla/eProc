package com.zilla.eproc.controller;

import com.zilla.eproc.dto.CreateAssignmentRequest;
import com.zilla.eproc.dto.ProjectAssignmentDTO;
import com.zilla.eproc.service.ProjectAssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for project team assignment operations.
 */
@RestController
@RequestMapping("/api/projects/{projectId}/team")
@RequiredArgsConstructor
public class ProjectAssignmentController {

    private final ProjectAssignmentService assignmentService;

    /**
     * Get all active team members for a project.
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ProjectAssignmentDTO>> getProjectTeam(
            @PathVariable Long projectId,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(assignmentService.getProjectTeam(projectId, email));
    }

    /**
     * Add a team member to the project.
     * Only the project boss can add members.
     */
    @PostMapping
    @PreAuthorize("hasRole('PROJECT_MANAGER')")
    public ResponseEntity<ProjectAssignmentDTO> addTeamMember(
            @PathVariable Long projectId,
            @Valid @RequestBody CreateAssignmentRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(assignmentService.addTeamMember(projectId, request, email));
    }

    /**
     * Remove a team member from the project.
     * Only the project boss can remove members.
     */
    @DeleteMapping("/{assignmentId}")
    @PreAuthorize("hasRole('PROJECT_MANAGER')")
    public ResponseEntity<Void> removeTeamMember(
            @PathVariable Long projectId,
            @PathVariable Long assignmentId,
            Authentication authentication) {
        String email = authentication.getName();
        assignmentService.removeTeamMember(projectId, assignmentId, email);
        return ResponseEntity.noContent().build();
    }
}
