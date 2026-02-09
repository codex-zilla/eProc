package com.zilla.eproc.controller;

import com.zilla.eproc.dto.CreateDeliveryDTO;
import com.zilla.eproc.dto.DeliveryResponseDTO;
import com.zilla.eproc.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * Controller for Delivery management.
 */
@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    /**
     * Record a new delivery.
     */
    @PostMapping
    public ResponseEntity<DeliveryResponseDTO> recordDelivery(
            @Valid @RequestBody CreateDeliveryDTO dto,
            Authentication authentication) {
        String userEmail = authentication.getName();
        DeliveryResponseDTO response = deliveryService.recordDelivery(dto, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all deliveries for a purchase order.
     */
    @GetMapping("/purchase-order/{poId}")
    public ResponseEntity<List<DeliveryResponseDTO>> getDeliveriesForPO(
            @PathVariable Long poId,
            Authentication authentication) {
        String userEmail = authentication.getName();
        List<DeliveryResponseDTO> response = deliveryService.getDeliveriesForPO(poId, userEmail);
        return ResponseEntity.ok(response);
    }
}
