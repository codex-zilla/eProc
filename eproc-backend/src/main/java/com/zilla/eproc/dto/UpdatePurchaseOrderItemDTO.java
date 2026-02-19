package com.zilla.eproc.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePurchaseOrderItemDTO {

    @NotBlank(message = "Material display name is required")
    private String materialDisplayName;

    @NotNull(message = "Ordered quantity is required")
    @DecimalMin(value = "0.0", message = "Ordered quantity must be non-negative")
    private BigDecimal orderedQty;

    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.0", message = "Unit price must be non-negative")
    private BigDecimal unitPrice;

    @NotBlank(message = "Unit is required")
    private String unit;
}
