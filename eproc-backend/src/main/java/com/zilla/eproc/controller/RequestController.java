package com.zilla.eproc.controller;

import com.zilla.eproc.dto.ApprovalActionDTO;
import com.zilla.eproc.dto.CreateMaterialRequestDTO;
import com.zilla.eproc.dto.MaterialRequestResponseDTO;
import com.zilla.eproc.model.RequestStatus;
import com.zilla.eproc.service.MaterialRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for material request operations.
 */
@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {

    private final MaterialRequestService materialRequestService;

    /**
     * Create a new material request.
     * Only ENGINEER role can create requests.
     */
    @PostMapping
    @PreAuthorize("hasRole('ENGINEER')")
    public ResponseEntity<MaterialRequestResponseDTO> createRequest(
            @Valid @RequestBody CreateMaterialRequestDTO dto,
            Authentication authentication) {
        String email = authentication.getName();
        MaterialRequestResponseDTO response = materialRequestService.createRequest(dto, email);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all requests with optional filters.
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MaterialRequestResponseDTO>> getRequests(
            @RequestParam(required = false) RequestStatus status,
            @RequestParam(required = false) Long siteId,
            @RequestParam(required = false, defaultValue = "false") boolean myRequests,
            Authentication authentication) {

        String userEmail = myRequests ? authentication.getName() : null;
        List<MaterialRequestResponseDTO> requests = materialRequestService.getAllRequests(status, siteId, userEmail);
        return ResponseEntity.ok(requests);
    }

    /**
     * Get pending requests for approval queue.
     * Only PROJECT_MANAGER can access this.
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('PROJECT_MANAGER')")
    public ResponseEntity<List<MaterialRequestResponseDTO>> getPendingRequests(Authentication authentication) {
        String email = authentication.getName();
        List<MaterialRequestResponseDTO> requests = materialRequestService.getPendingRequests(email);
        return ResponseEntity.ok(requests);
    }

    /**
     * Get requests by the current user.
     */
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MaterialRequestResponseDTO>> getMyRequests(Authentication authentication) {
        String email = authentication.getName();
        List<MaterialRequestResponseDTO> requests = materialRequestService.getRequestsByUser(email);
        return ResponseEntity.ok(requests);
    }

    /**
     * Get a single request by ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MaterialRequestResponseDTO> getRequestById(@PathVariable Long id) {
        MaterialRequestResponseDTO request = materialRequestService.getRequestById(id);
        return ResponseEntity.ok(request);
    }

    /**
     * Update a rejected request (resubmit).
     * Only ENGINEER who owns the request can update.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ENGINEER')")
    public ResponseEntity<MaterialRequestResponseDTO> updateRequest(
            @PathVariable Long id,
            @Valid @RequestBody CreateMaterialRequestDTO dto,
            Authentication authentication) {
        String email = authentication.getName();
        MaterialRequestResponseDTO response = materialRequestService.updateRequest(id, dto, email);
        return ResponseEntity.ok(response);
    }

    /**
     * Approve or reject a request.
     * Only PROJECT_MANAGER can perform this action.
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('PROJECT_MANAGER')")
    public ResponseEntity<MaterialRequestResponseDTO> processApproval(
            @PathVariable Long id,
            @Valid @RequestBody ApprovalActionDTO dto,
            Authentication authentication) {
        String email = authentication.getName();
        MaterialRequestResponseDTO response = materialRequestService.processApproval(id, dto, email);
        return ResponseEntity.ok(response);
    }
}
