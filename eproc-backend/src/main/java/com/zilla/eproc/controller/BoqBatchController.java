package com.zilla.eproc.controller;

import com.zilla.eproc.dto.BoqBatchResponseDTO;
import com.zilla.eproc.dto.CreateBoqBatchDTO;
import com.zilla.eproc.service.BoqBatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for BOQ Batch operations.
 */
@RestController
@RequestMapping("/api/boq-batches")
@RequiredArgsConstructor
@Slf4j
public class BoqBatchController {

    private final BoqBatchService boqBatchService;

    /**
     * Create a new batch with multiple items.
     * POST /api/boq-batches
     */
    @PostMapping
    public ResponseEntity<?> createBatch(
            @Valid @RequestBody CreateBoqBatchDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            log.error("Authentication required - userDetails is null");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Authentication required. Please log in again."));
        }

        log.info("Creating new batch: {} by user: {}", dto.getTitle(), userDetails.getUsername());
        BoqBatchResponseDTO response = boqBatchService.createBatch(dto, userDetails.getUsername());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Submit a batch for approval (change status from DRAFT to SUBMITTED).
     * POST /api/boq-batches/{id}/submit
     */
    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submitBatch(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Authentication required. Please log in again."));
        }

        log.info("Submitting batch: {} by user: {}", id, userDetails.getUsername());
        BoqBatchResponseDTO response = boqBatchService.submitBatch(id, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * Get batch by ID with all items.
     * GET /api/boq-batches/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getBatchById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Authentication required. Please log in again."));
        }

        log.info("Fetching batch: {} for user: {}", id, userDetails.getUsername());
        BoqBatchResponseDTO response = boqBatchService.getBatchById(id, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * Get all batches created by the current user.
     * GET /api/boq-batches/my-batches
     */
    @GetMapping("/my-batches")
    public ResponseEntity<?> getMyBatches(
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Authentication required. Please log in again."));
        }

        log.info("Fetching batches for user: {}", userDetails.getUsername());
        List<BoqBatchResponseDTO> response = boqBatchService.getMyBatches(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * Get all batches for a specific project (for project owners).
     * GET /api/boq-batches/project/{projectId}
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getProjectBatches(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Authentication required. Please log in again."));
        }

        log.info("Fetching batches for project: {} by user: {}", projectId, userDetails.getUsername());
        List<BoqBatchResponseDTO> response = boqBatchService.getProjectBatches(projectId, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * Error response DTO for consistent error handling.
     */
    private record ErrorResponse(String message) {
    }
}
