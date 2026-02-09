package com.zilla.eproc.dto;

import com.zilla.eproc.model.DeliveryCondition;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for Delivery response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryResponseDTO {

    private Long id;
    private Long purchaseOrderId;
    private String poNumber;
    private LocalDateTime deliveredDate;
    private String notes;
    private LocalDateTime createdAt;
    private String receivedByName;
    private Long receivedById;

    private List<DeliveryItemResponseDTO> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeliveryItemResponseDTO {
        private Long id;
        private Long purchaseOrderItemId;
        private String materialDisplayName;
        private BigDecimal quantityDelivered;
        private DeliveryCondition condition;
        private String notes;
    }
}
