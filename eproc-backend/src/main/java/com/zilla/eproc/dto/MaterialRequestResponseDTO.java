package com.zilla.eproc.dto;

import com.zilla.eproc.model.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for material request responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaterialRequestResponseDTO {

    private Long id;

    // Site info
    private Long siteId;
    private String siteName;

    // Work package info (optional)
    private Long workPackageId;
    private String workPackageName;

    // Material info - either catalog or manual
    private Long materialId;
    private String materialName;
    private String manualMaterialName;
    private String manualUnit;
    private BigDecimal manualEstimatedPrice;

    private BigDecimal quantity;
    private RequestStatus status;
    private String rejectionComment;
    private Boolean emergencyFlag;

    // Usage window
    private LocalDateTime plannedUsageStart;
    private LocalDateTime plannedUsageEnd;

    // Requester info
    private Long requestedById;
    private String requestedByName;
    private String requestedByEmail;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Helper to get the effective material name (catalog or manual).
     */
    public String getEffectiveMaterialName() {
        return materialName != null ? materialName : manualMaterialName;
    }
}
