package com.zilla.eproc.repository;

import com.zilla.eproc.model.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    /**
     * Find all deliveries for a purchase order.
     */
    List<Delivery> findByPurchaseOrderIdOrderByDeliveredDateDesc(Long purchaseOrderId);

    /**
     * Find all deliveries received by a user.
     */
    List<Delivery> findByReceivedByIdOrderByDeliveredDateDesc(Long userId);
}
