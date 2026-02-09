package com.zilla.eproc.repository;

import com.zilla.eproc.model.PurchaseOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PurchaseOrderItemRepository extends JpaRepository<PurchaseOrderItem, Long> {

    /**
     * Find all items for a purchase order.
     */
    List<PurchaseOrderItem> findByPurchaseOrderId(Long purchaseOrderId);

    /**
     * Find all items linked to a request.
     */
    List<PurchaseOrderItem> findByRequestId(Long requestId);

    /**
     * Calculate total ordered quantity for a request.
     */
    @Query("SELECT COALESCE(SUM(poi.orderedQty), 0) FROM PurchaseOrderItem poi WHERE poi.request.id = :requestId")
    BigDecimal sumOrderedQtyByRequestId(@Param("requestId") Long requestId);
}
