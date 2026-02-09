package com.zilla.eproc.service;

import com.zilla.eproc.dto.CreatePurchaseOrderDTO;
import com.zilla.eproc.dto.PurchaseOrderResponseDTO;
import com.zilla.eproc.exception.ForbiddenException;
import com.zilla.eproc.exception.ResourceNotFoundException;
import com.zilla.eproc.model.*;
import com.zilla.eproc.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing Purchase Orders.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProcurementService {

        private final PurchaseOrderRepository purchaseOrderRepository;
        // private final PurchaseOrderItemRepository purchaseOrderItemRepository; //
        // Reserved for future use
        private final RequestRepository requestRepository;
        private final ProjectRepository projectRepository;
        private final SiteRepository siteRepository;
        private final UserRepository userRepository;

        /**
         * Create a new Purchase Order.
         * Validates that requests are APPROVED and user has permission.
         */
        @Transactional
        public PurchaseOrderResponseDTO createPurchaseOrder(CreatePurchaseOrderDTO dto, String userEmail) {
                log.info("Creating purchase order for project {} by user {}", dto.getProjectId(), userEmail);

                // Get user
                User creator = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                // Validate project access
                Project project = projectRepository.findById(dto.getProjectId())
                                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

                boolean isOwner = project.getOwner() != null && project.getOwner().getId().equals(creator.getId());
                boolean isAccountant = project.getTeamAssignments().stream()
                                .anyMatch(assignment -> Boolean.TRUE.equals(assignment.getIsActive())
                                                && assignment.getUser() != null
                                                && assignment.getUser().getId().equals(creator.getId())
                                                && assignment.getRole() == ProjectRole.PROJECT_ACCOUNTANT);

                if (!isOwner && !isAccountant) {
                        throw new ForbiddenException("Only project owners and accountants can create purchase orders");
                }

                // Get site if specified
                Site site = null;
                if (dto.getSiteId() != null) {
                        site = siteRepository.findById(dto.getSiteId())
                                        .orElseThrow(() -> new ResourceNotFoundException("Site not found"));
                }

                // Create PO
                PurchaseOrder po = PurchaseOrder.builder()
                                .project(project)
                                .site(site)
                                .createdBy(creator)
                                .status(PurchaseOrderStatus.OPEN)
                                .vendorName(dto.getVendorName())
                                .notes(dto.getNotes())
                                .build();

                // Generate PO number
                String poNumber = generatePONumber();
                po.setPoNumber(poNumber);

                // Create items
                for (CreatePurchaseOrderDTO.PurchaseOrderItemDTO itemDto : dto.getItems()) {
                        Request request = requestRepository.findById(itemDto.getRequestId())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Request not found: " + itemDto.getRequestId()));

                        // Validate request is APPROVED
                        if (request.getStatus() != RequestStatus.APPROVED
                                        && request.getStatus() != RequestStatus.PARTIALLY_DELIVERED
                                        && request.getStatus() != RequestStatus.ORDERED) {
                                throw new IllegalStateException(
                                                "Request " + request.getId() + " is not approved for ordering");
                        }

                        // Calculate total price
                        BigDecimal totalPrice = itemDto.getOrderedQty().multiply(itemDto.getUnitPrice());

                        // Create PO item
                        PurchaseOrderItem poItem = PurchaseOrderItem.builder()
                                        .purchaseOrder(po)
                                        .request(request)
                                        .materialDisplayName(itemDto.getMaterialDisplayName())
                                        .orderedQty(itemDto.getOrderedQty())
                                        .unit(itemDto.getUnit())
                                        .unitPrice(itemDto.getUnitPrice())
                                        .totalPrice(totalPrice)
                                        .build();

                        po.getItems().add(poItem);

                        // Update request status to ORDERED if not already
                        updateRequestStatusAfterOrdering(request);
                }

                // Save PO
                po = purchaseOrderRepository.save(po);

                log.info("Created purchase order {} with {} items", po.getPoNumber(), po.getItems().size());

                return mapToResponseDTO(po);
        }

        /**
         * Update request status after creating a PO.
         * Status becomes ORDERED if there's at least one PO item.
         */
        private void updateRequestStatusAfterOrdering(Request request) {
                if (request.getStatus() == RequestStatus.APPROVED) {
                        request.setStatus(RequestStatus.ORDERED);
                        requestRepository.save(request);
                }
        }

        /**
         * Generate unique PO number in format: PO-{YEAR}-{SEQUENCE}
         */
        private String generatePONumber() {
                int currentYear = Year.now().getValue();
                int sequence = 1;
                String poNumber;

                do {
                        poNumber = String.format("PO-%d-%04d", currentYear, sequence);
                        sequence++;
                } while (purchaseOrderRepository.existsByPoNumber(poNumber));

                return poNumber;
        }

        /**
         * Get all purchase orders for a project.
         */
        @Transactional(readOnly = true)
        public List<PurchaseOrderResponseDTO> getProjectPurchaseOrders(Long projectId, String userEmail) {
                User user = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

                // Verify access - check if user is project owner or assigned to the project
                boolean isProjectOwner = project.getOwner() != null && project.getOwner().getId().equals(user.getId());
                boolean isTeamMember = project.getTeamAssignments().stream()
                                .anyMatch(assignment -> Boolean.TRUE.equals(assignment.getIsActive())
                                                && assignment.getUser() != null
                                                && assignment.getUser().getId().equals(user.getId()));
                boolean hasAccess = isProjectOwner || isTeamMember;

                if (!hasAccess) {
                        throw new ForbiddenException("You don't have access to this project");
                }

                List<PurchaseOrder> pos = purchaseOrderRepository.findByProjectIdOrderByCreatedAtDesc(projectId);

                return pos.stream()
                                .map(this::mapToResponseDTO)
                                .collect(Collectors.toList());
        }

        /**
         * Get a single purchase order by ID.
         */
        @Transactional(readOnly = true)
        public PurchaseOrderResponseDTO getPurchaseOrderById(Long id, String userEmail) {
                PurchaseOrder po = purchaseOrderRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found"));

                User user = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                // Verify access - check if user is project owner or assigned to the project
                Project project = po.getProject();
                boolean isProjectOwner = project.getOwner() != null && project.getOwner().getId().equals(user.getId());
                boolean isTeamMember = project.getTeamAssignments().stream()
                                .anyMatch(assignment -> Boolean.TRUE.equals(assignment.getIsActive())
                                                && assignment.getUser() != null
                                                && assignment.getUser().getId().equals(user.getId()));
                boolean hasAccess = isProjectOwner || isTeamMember;

                if (!hasAccess) {
                        throw new ForbiddenException("You don't have access to this purchase order");
                }

                return mapToResponseDTO(po);
        }

        /**
         * Map PO to response DTO.
         */
        private PurchaseOrderResponseDTO mapToResponseDTO(PurchaseOrder po) {
                List<PurchaseOrderResponseDTO.PurchaseOrderItemResponseDTO> itemDtos = po.getItems().stream()
                                .map(item -> PurchaseOrderResponseDTO.PurchaseOrderItemResponseDTO.builder()
                                                .id(item.getId())
                                                .requestId(item.getRequest().getId())
                                                .requestTitle(item.getRequest().getTitle())
                                                .materialDisplayName(item.getMaterialDisplayName())
                                                .orderedQty(item.getOrderedQty())
                                                .unit(item.getUnit())
                                                .unitPrice(item.getUnitPrice())
                                                .totalPrice(item.getTotalPrice())
                                                .totalDelivered(item.getTotalDelivered())
                                                .fullyDelivered(item.isFullyDelivered())
                                                .build())
                                .collect(Collectors.toList());

                return PurchaseOrderResponseDTO.builder()
                                .id(po.getId())
                                .poNumber(po.getPoNumber())
                                .projectId(po.getProject().getId())
                                .projectName(po.getProject().getName())
                                .siteId(po.getSite() != null ? po.getSite().getId() : null)
                                .siteName(po.getSite() != null ? po.getSite().getName() : null)
                                .status(po.getStatus())
                                .vendorName(po.getVendorName())
                                .notes(po.getNotes())
                                .totalValue(po.getTotalValue())
                                .createdAt(po.getCreatedAt())
                                .updatedAt(po.getUpdatedAt())
                                .createdByName(po.getCreatedBy().getName())
                                .createdById(po.getCreatedBy().getId())
                                .items(itemDtos)
                                .build();
        }
}
