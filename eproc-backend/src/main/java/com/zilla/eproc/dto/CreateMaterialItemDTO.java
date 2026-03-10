package com.zilla.eproc.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * DTO for creating a Material item (material or labour line item).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateMaterialItemDTO {

    @NotBlank(message = "Material/labour name is required")
    @Size(max = 200, message = "Name cannot exceed 200 characters")
    private String name;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private BigDecimal quantity;

    @NotBlank(message = "Measurement unit is required")
    @Pattern(regexp = "^(m³|m²|m|kg|No|LS|ton|bag|bundle|trip|drum|pcs|Days)$", message = "Invalid measurement unit")
    private String measurementUnit;

    @NotNull(message = "Rate estimate is required")
    @DecimalMin(value = "0.00", message = "Rate estimate must be non-negative")
    private BigDecimal rateEstimate;

    @NotNull(message = "Rate estimate type is required")
    @Pattern(regexp = "^(ENGINEER_ESTIMATE|MARKET_RATE)$", message = "Invalid rate type. Allowed: ENGINEER_ESTIMATE, MARKET_RATE")
    @Builder.Default
    private String rateEstimateType = "ENGINEER_ESTIMATE";

    @NotNull(message = "Resource type is required")
    @Pattern(regexp = "^(MATERIAL|LABOUR)$", message = "Invalid resource type. Allowed: MATERIAL, LABOUR")
    @Builder.Default
    private String resourceType = "MATERIAL";

    // ── Labour-only fields (ignored for MATERIAL items) ──────────────────────

    /**
     * Number of workers/labourers required. Used only when resourceType = LABOUR.
     */
    @Min(value = 1, message = "Number of labourers must be at least 1")
    private Integer numberOfLabourers;

    /** Number of working days required. Used only when resourceType = LABOUR. */
    @DecimalMin(value = "0.5", message = "Number of days must be at least 0.5")
    private BigDecimal numberOfDays;

    /**
     * Computes the effective quantity for LABOUR items: numberOfLabourers *
     * numberOfDays.
     * For MATERIAL items, returns the raw quantity.
     */
    public BigDecimal getEffectiveQuantity() {
        if ("LABOUR".equals(resourceType)
                && numberOfLabourers != null
                && numberOfDays != null) {
            return BigDecimal.valueOf(numberOfLabourers)
                    .multiply(numberOfDays)
                    .setScale(2, RoundingMode.HALF_UP);
        }
        return quantity;
    }
}
