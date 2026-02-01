package com.zilla.eproc.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for creating a new material request (BOQ Item Request).
 * Phase 1: Added BOQ fields for structured work item requests.
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

    // BOQ (Bill of Quantities) fields - Phase 1

    /**
     * BOQ reference code following pattern: BOQ-{section}-{trade}-{sequence}
     * Example: BOQ-03-RC-001
     */
    @Pattern(regexp = "^BOQ-\\d{2}-[A-Z]{2,4}-\\d{3}$", message = "BOQ code must follow pattern: BOQ-{section}-{trade}-{sequence} (e.g., BOQ-03-RC-001)")
    private String boqReferenceCode;

    /**
     * Detailed work description. Mandatory when BOQ code is provided.
     */
    @Size(min = 10, max = 5000, message = "Work description must be between 10 and 5000 characters")
    private String workDescription;

    /**
     * Standard measurement unit from constrained vocabulary.
     */
    @Pattern(regexp = "^(m³|m²|m|kg|No|LS|ton|bag|bundle|trip|drum|pcs)$", message = "Invalid measurement unit. Allowed: m³, m², m, kg, No, LS, ton, bag, bundle, trip, drum, pcs")
    private String measurementUnit;

    /**
     * Rate estimate per measurement unit.
     */
    @DecimalMin(value = "0.00", message = "Rate estimate must be non-negative")
    private BigDecimal rateEstimate;

    /**
     * Type of rate estimate. Defaults to ENGINEER_ESTIMATE.
     * Allowed: ENGINEER_ESTIMATE, MARKET_RATE, TENDER_RATE
     */
    @Pattern(regexp = "^(ENGINEER_ESTIMATE|MARKET_RATE|TENDER_RATE)$", message = "Invalid rate type. Allowed: ENGINEER_ESTIMATE, MARKET_RATE, TENDER_RATE")
    private String rateType;

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

    /**
     * Validates BOQ field dependencies:
     * If boqReferenceCode is provided, workDescription and measurementUnit MUST be
     * provided.
     */
    @AssertTrue(message = "When BOQ code is provided, work description and measurement unit are required")
    public boolean isValidBoqFields() {
        if (boqReferenceCode != null && !boqReferenceCode.trim().isEmpty()) {
            boolean hasDescription = workDescription != null && workDescription.trim().length() >= 10;
            boolean hasUnit = measurementUnit != null && !measurementUnit.trim().isEmpty();
            return hasDescription && hasUnit;
        }
        return true;
    }
}
