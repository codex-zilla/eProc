package com.zilla.eproc.repository;

import com.zilla.eproc.model.DeliveryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface DeliveryItemRepository extends JpaRepository<DeliveryItem, Long> {

    /**
     * Find all delivery items for a delivery.
     */
    List<DeliveryItem> findByDeliveryId(Long deliveryId);

    /**
     * Find all delivery items for a PO item.
     */
    List<DeliveryItem> findByPurchaseOrderItemId(Long purchaseOrderItemId);

    /**
     * Calculate total delivered quantity for a PO item.
     */
    @Query("SELECT COALESCE(SUM(di.quantityDelivered), 0) FROM DeliveryItem di WHERE di.purchaseOrderItem.id = :poItemId")
    BigDecimal sumDeliveredQtyByPOItemId(@Param("poItemId") Long poItemId);

    /**
     * Calculate total delivered quantity for a request across all PO items.
     */
    @Query("SELECT COALESCE(SUM(di.quantityDelivered), 0) FROM DeliveryItem di " +
            "WHERE di.purchaseOrderItem.request.id = :requestId")
    BigDecimal sumDeliveredQtyByRequestId(@Param("requestId") Long requestId);
}
