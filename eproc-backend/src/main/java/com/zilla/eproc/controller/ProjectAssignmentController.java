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
 * Controller for managing project team assignments.
 * Endpoints:
 * GET /projects/{projectId}/team - Get all active assignments
 * POST /projects/{projectId}/team - Add a team member
 * DELETE /projects/{projectId}/team/{assignmentId} - Remove a team member
 */
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectAssignmentController {

    private final ProjectAssignmentService assignmentService;

    @GetMapping("/{projectId}/team")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ProjectAssignmentDTO>> getProjectTeam(
            @PathVariable Long projectId,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(assignmentService.getProjectTeam(projectId, email));
    }

    @PostMapping("/{projectId}/team")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ProjectAssignmentDTO> addTeamMember(
            @PathVariable Long projectId,
            @Valid @RequestBody CreateAssignmentRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(assignmentService.addTeamMember(projectId, request, email));
    }

    @DeleteMapping("/{projectId}/team/{assignmentId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> removeTeamMember(
            @PathVariable Long projectId,
            @PathVariable Long assignmentId,
            Authentication authentication) {
        String email = authentication.getName();
        assignmentService.removeTeamMember(projectId, assignmentId, email);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{projectId}/team/{assignmentId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ProjectAssignmentDTO> updateTeamMember(
            @PathVariable Long projectId,
            @PathVariable Long assignmentId,
            @Valid @RequestBody CreateAssignmentRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(assignmentService.updateTeamMember(projectId, assignmentId, request, email));
    }
}
