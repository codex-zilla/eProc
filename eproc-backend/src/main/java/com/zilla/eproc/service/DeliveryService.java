package com.zilla.eproc.service;

import com.zilla.eproc.dto.CreateDeliveryDTO;
import com.zilla.eproc.dto.DeliveryResponseDTO;
import com.zilla.eproc.exception.ResourceNotFoundException;
import com.zilla.eproc.model.*;
import com.zilla.eproc.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing Deliveries and updating Request statuses.
 * Implements complex status logic: DELIVERED only if Delivered >= Ordered >=
 * Requested.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DeliveryService extends BaseProjectService {

        private final DeliveryRepository deliveryRepository;
        private final DeliveryItemRepository deliveryItemRepository;
        private final PurchaseOrderRepository purchaseOrderRepository;
        private final PurchaseOrderItemRepository purchaseOrderItemRepository;
        private final RequestRepository requestRepository;
        private final UserRepository userRepository;
        // private final MaterialRepository materialRepository; // Reserved for future
        // use

        /**
         * Record a new delivery.
         * Only Engineers can verify deliveries (enforced by checkAccess).
         */
        @Transactional
        public DeliveryResponseDTO recordDelivery(CreateDeliveryDTO dto, String userEmail) {
                log.info("Recording delivery for PO {} by user {}", dto.getPurchaseOrderId(), userEmail);

                // Get purchase order first to get Project ID
                PurchaseOrder po = purchaseOrderRepository.findById(dto.getPurchaseOrderId())
                                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found"));

                // Validate Access - Enforce ENGINEER role (or Owner override)
                checkAccess(userEmail, po.getProject().getId(), ProjectRole.PROJECT_SITE_ENGINEER,
                                ProjectRole.PROJECT_LEAD_ENGINEER,
                                ProjectRole.PROJECT_CONSULTANT_ENGINEER);

                // Get user (still need user entity for 'receivedBy')
                User receiver = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                // Create delivery
                Delivery delivery = Delivery.builder()
                                .purchaseOrder(po)
                                .receivedBy(receiver)
                                .deliveredDate(dto.getDeliveredDate() != null ? dto.getDeliveredDate()
                                                : LocalDateTime.now())
                                .notes(dto.getNotes())
                                .build();

                // Create delivery items
                for (CreateDeliveryDTO.DeliveryItemDTO itemDto : dto.getItems()) {
                        PurchaseOrderItem poItem = purchaseOrderItemRepository
                                        .findById(itemDto.getPurchaseOrderItemId())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Purchase order item not found"));

                        // Validate poItem belongs to this PO
                        if (!poItem.getPurchaseOrder().getId().equals(po.getId())) {
                                throw new IllegalStateException("PO item does not belong to this purchase order");
                        }

                        DeliveryItem deliveryItem = DeliveryItem.builder()
                                        .delivery(delivery)
                                        .purchaseOrderItem(poItem)
                                        .quantityDelivered(itemDto.getQuantityDelivered())
                                        .condition(itemDto.getCondition() != null ? itemDto.getCondition()
                                                        : DeliveryCondition.GOOD)
                                        .notes(itemDto.getNotes())
                                        .build();

                        delivery.getItems().add(deliveryItem);
                }

                // Save delivery
                delivery = deliveryRepository.save(delivery);

                // Update request statuses for all affected requests
                updateRequestStatuses(po);

                // Check if PO is fully delivered
                updatePurchaseOrderStatus(po);

                log.info("Recorded delivery {} with {} items", delivery.getId(), delivery.getItems().size());

                return mapToResponseDTO(delivery);
        }

        /**
         * Update request statuses based on delivery progress.
         * 
         * Status logic:
         * - ORDERED: delivered == 0 && ordered > 0
         * - PARTIALLY_DELIVERED: (delivered > 0 && delivered < ordered) OR (delivered
         * >= ordered && ordered < requested)
         * - DELIVERED: delivered >= ordered && ordered >= requested
         */
        private void updateRequestStatuses(PurchaseOrder po) {
                // Get all unique requests from this PO
                List<Request> requests = po.getItems().stream()
                                .map(PurchaseOrderItem::getRequest)
                                .distinct()
                                .collect(Collectors.toList());

                for (Request request : requests) {
                        updateRequestStatus(request);
                }
        }

        /**
         * Update a single request's status based on ordered and delivered quantities.
         */
        private void updateRequestStatus(Request request) {
                // Calculate requested quantity (sum of all material quantities in request)
                BigDecimal requestedQty = request.getMaterials().stream()
                                .map(Material::getQuantity)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                // Calculate total ordered quantity for this request
                BigDecimal orderedQty = purchaseOrderItemRepository.sumOrderedQtyByRequestId(request.getId());

                // Calculate total delivered quantity for this request
                BigDecimal deliveredQty = deliveryItemRepository.sumDeliveredQtyByRequestId(request.getId());

                log.debug("Request {}: Requested={}, Ordered={}, Delivered={}",
                                request.getId(), requestedQty, orderedQty, deliveredQty);

                RequestStatus newStatus;

                if (deliveredQty.compareTo(BigDecimal.ZERO) == 0 && orderedQty.compareTo(BigDecimal.ZERO) > 0) {
                        // No deliveries yet, but order placed
                        newStatus = RequestStatus.ORDERED;
                } else if (deliveredQty.compareTo(BigDecimal.ZERO) > 0
                                && deliveredQty.compareTo(orderedQty) < 0) {
                        // Some delivered, but less than ordered
                        newStatus = RequestStatus.PARTIALLY_DELIVERED;
                } else if (deliveredQty.compareTo(orderedQty) >= 0
                                && orderedQty.compareTo(requestedQty) < 0) {
                        // Delivered all that was ordered, but under-ordered (ordered < requested)
                        newStatus = RequestStatus.PARTIALLY_DELIVERED;
                        log.warn("Request {} under-ordered: Requested={}, Ordered={}",
                                        request.getId(), requestedQty, orderedQty);
                } else if (deliveredQty.compareTo(orderedQty) >= 0
                                && orderedQty.compareTo(requestedQty) >= 0) {
                        // Fully delivered: delivered >= ordered >= requested
                        newStatus = RequestStatus.DELIVERED;
                } else {
                        // Default to current status if logic doesn't match
                        newStatus = request.getStatus();
                }

                if (request.getStatus() != newStatus) {
                        log.info("Updating request {} status from {} to {}",
                                        request.getId(), request.getStatus(), newStatus);
                        request.setStatus(newStatus);
                        requestRepository.save(request);
                }
        }

        /**
         * Update PO status to CLOSED if all items are fully delivered.
         */
        private void updatePurchaseOrderStatus(PurchaseOrder po) {
                boolean allItemsDelivered = po.getItems().stream()
                                .allMatch(PurchaseOrderItem::isFullyDelivered);

                if (allItemsDelivered && po.getStatus() == PurchaseOrderStatus.OPEN) {
                        po.setStatus(PurchaseOrderStatus.CLOSED);
                        purchaseOrderRepository.save(po);
                        log.info("Purchase order {} marked as CLOSED", po.getPoNumber());
                }
        }

        /**
         * Get all deliveries for a purchase order.
         */
        @Transactional(readOnly = true)
        public List<DeliveryResponseDTO> getDeliveriesForPO(Long poId, String userEmail) {
                PurchaseOrder po = purchaseOrderRepository.findById(poId)
                                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found"));

                // Verify access
                checkAccess(userEmail, po.getProject().getId());

                List<Delivery> deliveries = deliveryRepository.findByPurchaseOrderIdOrderByDeliveredDateDesc(poId);

                return deliveries.stream()
                                .map(this::mapToResponseDTO)
                                .collect(Collectors.toList());
        }

        /**
         * Map Delivery to response DTO.
         */
        private DeliveryResponseDTO mapToResponseDTO(Delivery delivery) {
                List<DeliveryResponseDTO.DeliveryItemResponseDTO> itemDtos = delivery.getItems().stream()
                                .map(item -> DeliveryResponseDTO.DeliveryItemResponseDTO.builder()
                                                .id(item.getId())
                                                .purchaseOrderItemId(item.getPurchaseOrderItem().getId())
                                                .materialDisplayName(
                                                                item.getPurchaseOrderItem().getMaterialDisplayName())
                                                .quantityDelivered(item.getQuantityDelivered())
                                                .condition(item.getCondition())
                                                .notes(item.getNotes())
                                                .build())
                                .collect(Collectors.toList());

                return DeliveryResponseDTO.builder()
                                .id(delivery.getId())
                                .purchaseOrderId(delivery.getPurchaseOrder().getId())
                                .poNumber(delivery.getPurchaseOrder().getPoNumber())
                                .deliveredDate(delivery.getDeliveredDate())
                                .notes(delivery.getNotes())
                                .createdAt(delivery.getCreatedAt())
                                .receivedByName(delivery.getReceivedBy().getName())
                                .receivedById(delivery.getReceivedBy().getId())
                                .items(itemDtos)
                                .build();
        }
}
