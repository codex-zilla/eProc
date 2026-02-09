package com.zilla.eproc.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Purchase Order Item entity - Individual item on a PO.
 * Links to a Request and tracks ordered quantity and pricing.
 */
@Entity
@Table(name = "purchase_order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrder purchaseOrder;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "request_id", nullable = false)
    private Request request;

    @Column(name = "material_display_name", nullable = false, length = 255)
    private String materialDisplayName;

    @Column(name = "ordered_qty", nullable = false, precision = 15, scale = 3)
    private BigDecimal orderedQty;

    @Column(name = "unit", nullable = false, length = 50)
    private String unit;

    @Column(name = "unit_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalPrice;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /**
     * Delivery items for this PO item.
     */
    @Builder.Default
    @OneToMany(mappedBy = "purchaseOrderItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DeliveryItem> deliveryItems = new ArrayList<>();

    /**
     * Calculate total delivered quantity for this item.
     */
    @Transient
    public BigDecimal getTotalDelivered() {
        return deliveryItems.stream()
                .map(DeliveryItem::getQuantityDelivered)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Check if this item is fully delivered.
     */
    @Transient
    public boolean isFullyDelivered() {
        return getTotalDelivered().compareTo(orderedQty) >= 0;
    }
}
