package com.zilla.eproc.repository;

import com.zilla.eproc.model.PurchaseOrder;
import com.zilla.eproc.model.PurchaseOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
