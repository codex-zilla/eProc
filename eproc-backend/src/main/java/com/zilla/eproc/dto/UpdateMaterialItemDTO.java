package com.zilla.eproc.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for updating material details (quantity, rate, etc.).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMaterialItemDTO {

    @Positive(message = "Quantity must be positive")
    private BigDecimal quantity;

    @Pattern(regexp = "^(m³|m²|m|kg|No|LS|ton|bag|bundle|trip|drum|pcs|Days)$", message = "Invalid measurement unit")
    private String measurementUnit;

    @DecimalMin(value = "0.00", message = "Rate estimate must be non-negative")
    private BigDecimal rateEstimate;

    @Pattern(regexp = "^(ENGINEER_ESTIMATE|MARKET_RATE)$", message = "Invalid rate type")
    private String rateEstimateType;
}
