package com.zilla.eproc.repository;

import com.zilla.eproc.model.PurchaseOrder;
import com.zilla.eproc.model.PurchaseOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

        /**
         * Find PO by PO number.
         */
        Optional<PurchaseOrder> findByPoNumber(String poNumber);

        /**
         * Find all POs for a project.
         */
        List<PurchaseOrder> findByProjectIdOrderByCreatedAtDesc(Long projectId);

        /**
         * Find all POs by status.
         */
        List<PurchaseOrder> findByStatusOrderByCreatedAtDesc(PurchaseOrderStatus status);

        /**
         * Find all POs for a project by status.
         */
        List<PurchaseOrder> findByProjectIdAndStatusOrderByCreatedAtDesc(Long projectId, PurchaseOrderStatus status);

        /**
         * Check if PO number exists.
         */
        boolean existsByPoNumber(String poNumber);

        /**
         * Find PO by ID with full details (items, delivery items, project, site,
         * creator, request).
         * Prevents N+1 queries.
         */
        @Query("SELECT po FROM PurchaseOrder po " +
                        "LEFT JOIN FETCH po.project " +
                        "LEFT JOIN FETCH po.site " +
                        "LEFT JOIN FETCH po.createdBy " +
                        "LEFT JOIN FETCH po.request r " +
                        "LEFT JOIN FETCH r.site " +
                        "LEFT JOIN FETCH po.items i " +
                        "WHERE po.id = :id")
        Optional<PurchaseOrder> findByIdWithDetails(@Param("id") Long id);

        /**
         * Find all request IDs that have an associated purchase order.
         */
        @Query("SELECT po.request.id FROM PurchaseOrder po WHERE po.request.id IS NOT NULL")
        List<Long> findAllRequestIds();

        /**
         * Fetch all POs with their project eagerly loaded (avoids N+1 on list queries).
         * Used by the accountant dashboard to compute stats and budget overview.
         */
        @Query("SELECT po FROM PurchaseOrder po " +
                        "LEFT JOIN FETCH po.project " +
                        "LEFT JOIN FETCH po.site " +
                        "LEFT JOIN FETCH po.createdBy " +
                        "ORDER BY po.createdAt DESC")
        List<PurchaseOrder> findAllWithProjectAndSite();

        /**
         * Fetch all POs with items and their delivery items, used to compute
         * over/under delivery alerts. Separate query to avoid
         * MultipleBagFetchException.
         */
        @Query("SELECT DISTINCT po FROM PurchaseOrder po " +
                        "LEFT JOIN FETCH po.items i")
        List<PurchaseOrder> findAllWithItemsAndDeliveries();

        /**
         * Find OPEN or PARTIALLY_DELIVERED POs whose expected delivery date has passed.
         * Used to generate delayed-delivery alerts on Manager and Accountant
         * dashboards.
         */
        @Query("SELECT po FROM PurchaseOrder po " +
                        "LEFT JOIN FETCH po.project " +
                        "LEFT JOIN FETCH po.site " +
                        "WHERE po.status IN ('OPEN', 'PARTIALLY_DELIVERED') " +
                        "AND po.expectedDeliveryDate IS NOT NULL " +
                        "AND po.expectedDeliveryDate < :now " +
                        "ORDER BY po.expectedDeliveryDate ASC")
        List<PurchaseOrder> findOverdueDeliveries(@Param("now") LocalDateTime now);
}
