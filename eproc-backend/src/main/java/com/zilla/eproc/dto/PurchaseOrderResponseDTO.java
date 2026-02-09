package com.zilla.eproc.dto;

import com.zilla.eproc.model.PurchaseOrderStatus;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for Purchase Order response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderResponseDTO {

    private Long id;
    private String poNumber;
    private Long projectId;
    private String projectName;
    private Long siteId;
    private String siteName;
    private PurchaseOrderStatus status;
    private String vendorName;
    private String notes;
    private BigDecimal totalValue;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdByName;
    private Long createdById;

    private List<PurchaseOrderItemResponseDTO> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurchaseOrderItemResponseDTO {
        private Long id;
        private Long requestId;
        private String requestTitle;
        private String materialDisplayName;
        private BigDecimal orderedQty;
        private String unit;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
        private BigDecimal totalDelivered;
        private boolean fullyDelivered;
    }
}
