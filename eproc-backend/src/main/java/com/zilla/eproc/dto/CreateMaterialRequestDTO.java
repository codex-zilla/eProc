package com.zilla.eproc.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for creating a new material request.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateMaterialRequestDTO {

    @NotNull(message = "Site ID is required")
    private Long siteId;

    private Long workPackageId;

    // Either materialId or manualMaterialName must be provided (XOR)
    private Long materialId;
    private String manualMaterialName;
    private String manualUnit;
    private BigDecimal manualEstimatedPrice;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private BigDecimal quantity;

    @NotNull(message = "Planned usage start is required")
    private LocalDateTime plannedUsageStart;

    @NotNull(message = "Planned usage end is required")
    private LocalDateTime plannedUsageEnd;

    @Builder.Default
    private Boolean emergencyFlag = false;

    /**
     * Validates that either materialId or manualMaterialName is provided, not both.
     */
    @AssertTrue(message = "Either materialId or manualMaterialName must be provided, not both")
    public boolean isValidMaterialChoice() {
        boolean hasCatalog = materialId != null;
        boolean hasManual = manualMaterialName != null && !manualMaterialName.trim().isEmpty();
        return hasCatalog ^ hasManual; // XOR - exactly one must be true
    }

    /**
     * Validates that manual entries have a unit specified.
     */
    @AssertTrue(message = "Manual material entry requires a unit")
    public boolean isManualUnitProvided() {
        if (manualMaterialName != null && !manualMaterialName.trim().isEmpty()) {
            return manualUnit != null && !manualUnit.trim().isEmpty();
        }
        return true;
    }

    /**
     * Validates that usage start is before usage end.
     */
    @AssertTrue(message = "Planned usage start must be before end")
    public boolean isValidUsageWindow() {
        if (plannedUsageStart != null && plannedUsageEnd != null) {
            return plannedUsageStart.isBefore(plannedUsageEnd);
        }
        return true;
    }
}
