package com.zilla.eproc.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePurchaseOrderDTO {

    @NotBlank(message = "Vendor name is required")
    private String vendorName;

    private String notes;

    @Valid
    private List<UpdatePurchaseOrderItemDTO> items;
}
