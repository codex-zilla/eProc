package com.zilla.eproc.repository;

import com.zilla.eproc.model.PurchaseOrder;
import com.zilla.eproc.model.PurchaseOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
            "LEFT JOIN FETCH po.items i " +
            "LEFT JOIN FETCH i.request r " +
            "LEFT JOIN FETCH r.site " +
            "WHERE po.id = :id")
    Optional<PurchaseOrder> findByIdWithDetails(@Param("id") Long id);
}
