package com.zilla.eproc.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for creating a Purchase Order.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePurchaseOrderDTO {

    private Long projectId;
    private Long siteId;
    private String vendorName;
    private String notes;
    private List<PurchaseOrderItemDTO> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurchaseOrderItemDTO {
        private Long requestId;
        private String materialDisplayName;
        private BigDecimal orderedQty;
        private String unit;
        private BigDecimal unitPrice;
    }
}
