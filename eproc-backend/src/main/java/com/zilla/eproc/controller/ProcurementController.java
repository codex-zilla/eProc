package com.zilla.eproc.controller;

import com.zilla.eproc.dto.CreatePurchaseOrderDTO;
import com.zilla.eproc.dto.PurchaseOrderResponseDTO;
import com.zilla.eproc.service.ProcurementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * Controller for Purchase Order management.
 */
@RestController
@RequestMapping("/api/purchase-orders")
@RequiredArgsConstructor
public class ProcurementController {

    private final ProcurementService procurementService;

    /**
     * Create a new purchase order.
     */
    @PostMapping
    public ResponseEntity<PurchaseOrderResponseDTO> createPurchaseOrder(
            @Valid @RequestBody CreatePurchaseOrderDTO dto,
            Authentication authentication) {
        String userEmail = authentication.getName();
        PurchaseOrderResponseDTO response = procurementService.createPurchaseOrder(dto, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all purchase orders for a project.
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<PurchaseOrderResponseDTO>> getProjectPurchaseOrders(
            @PathVariable Long projectId,
            Authentication authentication) {
        String userEmail = authentication.getName();
        List<PurchaseOrderResponseDTO> response = procurementService.getProjectPurchaseOrders(projectId, userEmail);
        return ResponseEntity.ok(response);
    }

    /**
     * Get a single purchase order by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderResponseDTO> getPurchaseOrder(
            @PathVariable Long id,
            Authentication authentication) {
        String userEmail = authentication.getName();
        PurchaseOrderResponseDTO response = procurementService.getPurchaseOrderById(id, userEmail);
        return ResponseEntity.ok(response);
    }
}
