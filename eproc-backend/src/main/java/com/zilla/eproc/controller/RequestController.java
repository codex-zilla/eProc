package com.zilla.eproc.controller;

import com.zilla.eproc.dto.CreateRequestDTO;
import com.zilla.eproc.dto.RequestResponseDTO;
import com.zilla.eproc.service.RequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for Request (BOQ Request) operations.
 */
@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RequestController {

    private final RequestService requestService;

    /**
     * Create one or more requests.
     * POST /api/requests
     */
    @PostMapping
    public ResponseEntity<List<RequestResponseDTO>> createRequests(
            @Valid @RequestBody List<CreateRequestDTO> dtos,
            @AuthenticationPrincipal UserDetails userDetails) {

        List<RequestResponseDTO> response = requestService.createRequests(dtos, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all requests for the current user (if project owner) or specific role
     * logic.
     * GET /api/requests
     */
    @GetMapping
    public ResponseEntity<List<RequestResponseDTO>> getAllRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        // This endpoint returns all requests for a Project Owner across all their
        // projects
        List<RequestResponseDTO> response = requestService.getAllManagerRequests(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * Get request by ID.
     * GET /api/requests/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<RequestResponseDTO> getRequestById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        RequestResponseDTO response = requestService.getRequestById(id, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * Get all requests created by the current user.
     * GET /api/requests/my-requests
     */
    @GetMapping("/my-requests")
    public ResponseEntity<List<RequestResponseDTO>> getMyRequests(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<RequestResponseDTO> response = requestService.getMyRequests(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * Get all requests for a specific project (for project owners).
     * GET /api/requests/project/{projectId}
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<RequestResponseDTO>> getProjectRequests(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserDetails userDetails) {

        List<RequestResponseDTO> response = requestService.getProjectRequests(projectId, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * Get audit history for a request.
     * GET /api/requests/{id}/history
     */
    @GetMapping("/{id}/history")
    public ResponseEntity<List<com.zilla.eproc.dto.RequestAuditLogDTO>> getRequestHistory(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        List<com.zilla.eproc.dto.RequestAuditLogDTO> response = requestService.getRequestHistory(id,
                userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * Get all pending (SUBMITTED) requests for the current project owner.
     * GET /api/requests/pending
     */
    @GetMapping("/pending")
    public ResponseEntity<List<RequestResponseDTO>> getPendingRequests(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<RequestResponseDTO> response = requestService.getPendingRequests(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * Update material status (approve/reject individual material).
     * PATCH /api/requests/{requestId}/materials/{materialId}/status
     */
    @PatchMapping("/{requestId}/materials/{materialId}/status")
    public ResponseEntity<com.zilla.eproc.dto.MaterialItemResponseDTO> updateMaterialStatus(
            @PathVariable Long requestId,
            @PathVariable Long materialId,
            @Valid @RequestBody com.zilla.eproc.dto.MaterialStatusUpdateDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        com.zilla.eproc.dto.MaterialItemResponseDTO response = requestService.updateMaterialStatus(
                requestId, materialId, dto, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }
}
