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
 * DTO for creating a Delivery.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDeliveryDTO {

    private Long purchaseOrderId;
    private LocalDateTime deliveredDate;
    private String notes;
    private List<DeliveryItemDTO> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeliveryItemDTO {
        private Long purchaseOrderItemId;
        private BigDecimal quantityDelivered;
        private DeliveryCondition condition;
        private String notes;
    }
}
