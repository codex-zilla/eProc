package com.zilla.eproc.service;

import com.zilla.eproc.dto.*;
import com.zilla.eproc.exception.ForbiddenException;
import com.zilla.eproc.exception.ResourceNotFoundException;
import com.zilla.eproc.model.*;
import com.zilla.eproc.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service for managing Requests (BOQ Requests).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RequestService {

        private final RequestRepository requestRepository;
        private final ProjectRepository projectRepository;
        private final SiteRepository siteRepository;
        private final UserRepository userRepository;
        private final RequestAuditLogRepository auditLogRepository;
        private final MaterialRepository materialRepository;
        private final DuplicateDetectionService duplicateDetectionService;

        /**
         * Create multiple requests at once.
         */
        @Transactional
        public List<RequestResponseDTO> createRequests(List<CreateRequestDTO> dtos, String userEmail) {
                log.info("Creating {} requests by user {}", dtos.size(), userEmail);

                User requester = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                List<Request> requests = new ArrayList<>();
                Set<String> usedBoqCodes = new HashSet<>();

                for (CreateRequestDTO dto : dtos) {
                        Request request = createSingleRequest(dto, requester, usedBoqCodes);
                        requests.add(request);
                }

                // Save all requests
                requests = requestRepository.saveAll(requests);

                log.info("Created {} requests successfully", requests.size());

                return requests.stream()
                                .map(r -> mapToResponseDTO(r, true))
                                .collect(Collectors.toList());
        }

        /**
         * Create a single request.
         */
        private Request createSingleRequest(CreateRequestDTO dto, User requester, Set<String> usedBoqCodes) {
                // Validate project access
                Project project = projectRepository.findById(dto.getProjectId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Project not found with ID: " + dto.getProjectId()));

                boolean isAssigned = project.getTeamAssignments().stream()
                                .anyMatch(assignment -> assignment.getUser().getId().equals(requester.getId())
                                                && (assignment.getRole() == ProjectRole.LEAD_ENGINEER
                                                                || assignment.getRole() == ProjectRole.SITE_ENGINEER
                                                                || assignment.getRole() == ProjectRole.CONSULTANT_ENGINEER));

                if (!isAssigned && requester.getRole() != Role.PROJECT_OWNER) {
                        throw new ForbiddenException("You are not assigned to this project");
                }

                // Get site
                Site site = siteRepository.findById(dto.getSiteId())
                                .orElseThrow(() -> new ResourceNotFoundException("Site not found"));

                // Determine priority from emergency flag
                Priority priority = Boolean.TRUE.equals(dto.getEmergencyFlag()) ? Priority.HIGH : Priority.NORMAL;

                // Create request
                Request request = Request.builder()
                                .project(project)
                                .site(site)
                                .createdBy(requester)
                                .title(dto.getTitle())
                                .plannedStartDate(dto.getPlannedStartDate())
                                .plannedEndDate(dto.getPlannedEndDate())
                                .priority(priority)
                                .status(RequestStatus.PENDING)
                                .additionalDetails(dto.getAdditionalDetails())
                                .build();

                // Generate BOQ reference code
                String boqCode = generateBoqReferenceCode(usedBoqCodes);
                request.setBoqReferenceCode(boqCode);
                usedBoqCodes.add(boqCode);

                // DUPLICATE DETECTION: Check for overlapping requests
                List<String> materialNames = dto.getItems().stream()
                                .map(CreateMaterialItemDTO::getName)
                                .distinct()
                                .collect(Collectors.toList());

                List<DuplicateWarningDTO> potentialDuplicates = duplicateDetectionService
                                .findPotentialDuplicates(
                                                dto.getSiteId(),
                                                materialNames,
                                                dto.getPlannedStartDate(),
                                                dto.getPlannedEndDate());

                if (!potentialDuplicates.isEmpty()) {
                        // If duplicates found and no explanation provided, throw exception
                        if (dto.getDuplicateExplanation() == null ||
                                        dto.getDuplicateExplanation().trim().isEmpty()) {

                                log.warn("Duplicate request detected for site {} without explanation",
                                                dto.getSiteId());
                                throw new com.zilla.eproc.exception.DuplicateRequestException(
                                                "Duplicate request detected. Please provide an explanation.",
                                                potentialDuplicates);
                        }

                        // If explanation provided, flag as duplicate
                        log.info("Duplicate request detected but explanation provided: {}",
                                        dto.getDuplicateExplanation());
                        request.setIsDuplicateFlagged(true);
                        request.setDuplicateExplanation(dto.getDuplicateExplanation());
                        request.setDuplicateOfRequestId(potentialDuplicates.get(0).getRequestId());
                }

                // Create materials
                List<Material> materials = dto.getItems().stream()
                                .map(itemDto -> createMaterialFromDTO(itemDto, request))
                                .collect(Collectors.toList());

                request.setMaterials(materials);

                // Create audit log entry
                RequestAuditLog auditLog = RequestAuditLog.builder()
                                .request(request)
                                .action("CREATED")
                                .performedBy(requester)
                                .details("Request created with " + materials.size() + " items")
                                .build();

                request.getAuditLogs().add(auditLog);

                return request;
        }

        /**
         * Generate unique BOQ reference code in format: BOQ-{YEAR}-{SEQUENCE}
         * 
         * @param usedBoqCodes Set of codes already generated in this transaction
         */
        private String generateBoqReferenceCode(Set<String> usedBoqCodes) {
                int currentYear = Year.now().getValue();
                int sequence = 1;
                String boqCode;

                // Find next available sequence number for this year
                do {
                        boqCode = String.format("BOQ-%d-%03d", currentYear, sequence);
                        sequence++;
                } while (requestRepository.existsByBoqReferenceCode(boqCode) || usedBoqCodes.contains(boqCode));

                return boqCode;
        }

        /**
         * Create Material entity from DTO.
         */
        private Material createMaterialFromDTO(CreateMaterialItemDTO dto, Request request) {
                return Material.builder()
                                .request(request)
                                .name(dto.getName())
                                .quantity(dto.getQuantity())
                                .measurementUnit(dto.getMeasurementUnit())
                                .rateEstimate(dto.getRateEstimate())
                                .rateEstimateType(RateEstimateType.valueOf(dto.getRateEstimateType()))
                                .resourceType(ResourceType.valueOf(dto.getResourceType()))
                                .status(MaterialStatus.PENDING)
                                .revisionNumber(1)
                                .build();
        }

        /**
         * Get request by ID.
         */
        @Transactional(readOnly = true)
        public RequestResponseDTO getRequestById(Long requestId, String userEmail) {
                Request request = requestRepository.findById(requestId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Request not found with ID: " + requestId));

                // Authorization check
                User requester = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                boolean canView = request.getCreatedBy().getId().equals(requester.getId())
                                || request.getProject().getOwner().getId().equals(requester.getId());

                if (!canView) {
                        throw new ForbiddenException("You do not have permission to view this request");
                }

                return mapToResponseDTO(request, true);
        }

        /**
         * Get all requests created by the current user.
         */
        @Transactional(readOnly = true)
        public List<RequestResponseDTO> getMyRequests(String userEmail) {
                User requester = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                List<Request> requests = requestRepository.findByCreatedByIdOrderByCreatedAtDesc(requester.getId());

                return requests.stream()
                                .map(r -> mapToResponseDTO(r, false))
                                .collect(Collectors.toList());
        }

        /**
         * Get all requests for a project (for project owners).
         */
        @Transactional(readOnly = true)
        public List<RequestResponseDTO> getProjectRequests(Long projectId, String userEmail) {
                User requester = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

                // Authorization: Only project owner can view all requests
                if (!project.getOwner().getId().equals(requester.getId())) {
                        throw new ForbiddenException("Only project owner can view all requests");
                }

                List<Request> requests = requestRepository.findByProjectIdOrderByCreatedAtDesc(projectId);

                return requests.stream()
                                .map(r -> mapToResponseDTO(r, false))
                                .collect(Collectors.toList());
        }

        /**
         * Get all pending requests for projects owned by the current user.
         */
        @Transactional(readOnly = true)
        public List<RequestResponseDTO> getPendingRequests(String userEmail) {
                User owner = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                // Only project owners can view pending requests
                if (owner.getRole() != Role.PROJECT_OWNER) {
                        throw new ForbiddenException("Only project owners can view pending requests");
                }

                List<Request> requests = requestRepository.findByStatusAndProjectOwnerIdOrderByCreatedAtDesc(
                                RequestStatus.PENDING, owner.getId());

                return requests.stream()
                                .map(r -> mapToResponseDTO(r, true))
                                .collect(Collectors.toList());
        }

        /**
         * Get all requests for projects owned by the current user.
         */
        @Transactional(readOnly = true)
        public List<RequestResponseDTO> getAllManagerRequests(String userEmail) {
                User owner = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                // Only project owners can view all requests
                if (owner.getRole() != Role.PROJECT_OWNER) {
                        throw new ForbiddenException("Only project owners can view requests");
                }

                List<Request> requests = requestRepository.findByProjectOwnerIdOrderByCreatedAtDesc(owner.getId());

                return requests.stream()
                                .map(r -> mapToResponseDTO(r, true))
                                .collect(Collectors.toList());
        }

        /**
         * Map Request entity to response DTO.
         */
        private RequestResponseDTO mapToResponseDTO(Request request, boolean includeMaterials) {
                RequestResponseDTO dto = RequestResponseDTO.builder()
                                .id(request.getId())
                                .projectId(request.getProject().getId())
                                .projectName(request.getProject().getName())
                                .siteId(request.getSite().getId())
                                .siteName(request.getSite().getName())
                                .title(request.getTitle())
                                .plannedStartDate(request.getPlannedStartDate())
                                .plannedEndDate(request.getPlannedEndDate())
                                .priority(request.getPriority())
                                .status(request.getStatus())
                                .additionalDetails(request.getAdditionalDetails())
                                .boqReferenceCode(request.getBoqReferenceCode())
                                .createdById(request.getCreatedBy().getId())
                                .createdByName(request.getCreatedBy().getName())
                                .createdAt(request.getCreatedAt())
                                .updatedAt(request.getUpdatedAt())
                                .materialCount(request.getMaterialCount())
                                .totalValue(request.getTotalValue())
                                .build();

                if (includeMaterials) {
                        List<MaterialItemResponseDTO> materialDTOs = request.getMaterials().stream()
                                        .map(this::mapMaterialToDTO)
                                        .collect(Collectors.toList());
                        dto.setMaterials(materialDTOs);
                }

                return dto;
        }

        /**
         * Map Material entity to DTO.
         */
        private MaterialItemResponseDTO mapMaterialToDTO(Material material) {
                return MaterialItemResponseDTO.builder()
                                .id(material.getId())
                                .name(material.getName())
                                .quantity(material.getQuantity())
                                .measurementUnit(material.getMeasurementUnit())
                                .rateEstimate(material.getRateEstimate())
                                .rateEstimateType(material.getRateEstimateType())
                                .resourceType(material.getResourceType())
                                .status(material.getStatus())
                                .comment(material.getComment())
                                .revisionNumber(material.getRevisionNumber())
                                .totalEstimate(material.getTotalEstimate())
                                .createdAt(material.getCreatedAt())
                                .build();
        }

        /**
         * Get audit history for a request.
         */
        public List<RequestAuditLogDTO> getRequestHistory(Long requestId, String userEmail) {
                // Verify request exists and user has access
                Request request = requestRepository.findById(requestId)
                                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));

                User user = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                // Verify access
                boolean hasAccess = request.getCreatedBy().getId().equals(user.getId())
                                || user.getRole() == Role.PROJECT_OWNER;

                if (!hasAccess) {
                        throw new ForbiddenException("You don't have access to this request");
                }

                // Get audit logs
                List<RequestAuditLog> auditLogs = auditLogRepository.findByRequestIdOrderByTimestampDesc(requestId);

                return auditLogs.stream()
                                .map(this::mapAuditLogToDTO)
                                .collect(Collectors.toList());
        }

        /**
         * Map RequestAuditLog to DTO.
         */
        private RequestAuditLogDTO mapAuditLogToDTO(RequestAuditLog auditLog) {
                return RequestAuditLogDTO.builder()
                                .id(auditLog.getId())
                                .action(auditLog.getAction())
                                .comment(auditLog.getDetails())
                                .timestamp(auditLog.getTimestamp())
                                .actorName(auditLog.getPerformedBy().getName())
                                .actorEmail(auditLog.getPerformedBy().getEmail())
                                .actorRole(auditLog.getPerformedBy().getRole().name())
                                .build();
        }

        /**
         * Update material status (approve/reject individual material item).
         */
        @Transactional
        public MaterialItemResponseDTO updateMaterialStatus(Long requestId, Long materialId,
                        MaterialStatusUpdateDTO dto,
                        String userEmail) {
                User owner = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                Request request = requestRepository.findById(requestId)
                                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));

                // Only project owner can approve/reject materials
                if (!request.getProject().getOwner().getId().equals(owner.getId())) {
                        throw new ForbiddenException("Only project owner can approve/reject materials");
                }

                Material material = materialRepository.findById(materialId)
                                .orElseThrow(() -> new ResourceNotFoundException("Material not found"));

                // Verify material belongs to this request
                if (!material.getRequest().getId().equals(requestId)) {
                        throw new ForbiddenException("Material does not belong to this request");
                }

                // Update material status
                material.setStatus(dto.getStatus());
                if (dto.getComment() != null && !dto.getComment().isBlank()) {
                        material.setComment(dto.getComment());
                }
                materialRepository.save(material);

                // Log audit entry
                RequestAuditLog auditLog = RequestAuditLog.builder()
                                .request(request)
                                .action("MATERIAL_" + dto.getStatus().name())
                                .details("Material '" + material.getName() + "' " + dto.getStatus().name().toLowerCase()
                                                + (dto.getComment() != null ? ": " + dto.getComment() : ""))
                                .performedBy(owner)
                                .build();
                auditLogRepository.save(auditLog);

                // Update parent request status based on material statuses
                updateRequestStatusFromMaterials(request);

                return mapMaterialToDTO(material);
        }

        /**
         * Update request status based on material statuses.
         */
        private void updateRequestStatusFromMaterials(Request request) {
                List<Material> materials = materialRepository.findByRequestId(request.getId());

                if (materials.isEmpty()) {
                        return;
                }

                long approvedCount = materials.stream()
                                .filter(m -> m.getStatus() == MaterialStatus.APPROVED)
                                .count();
                long rejectedCount = materials.stream()
                                .filter(m -> m.getStatus() == MaterialStatus.REJECTED)
                                .count();
                long pendingCount = materials.stream()
                                .filter(m -> m.getStatus() == MaterialStatus.PENDING)
                                .count();
                long totalCount = materials.size();

                if (pendingCount > 0) {
                        // Any pending material -> Request is PENDING
                        // Note: User specified "submitted" requests become "pending" if they have
                        // pending items.
                        // We will use PENDING as the status for requests under review.
                        request.setStatus(RequestStatus.PENDING);
                } else if (approvedCount == totalCount) {
                        // All materials approved -> APPROVED
                        request.setStatus(RequestStatus.APPROVED);
                } else if (rejectedCount == totalCount) {
                        // All materials rejected -> REJECTED
                        request.setStatus(RequestStatus.REJECTED);
                } else {
                        // usage: (pending == 0) && (rejected > 0) && (approved > 0)
                        // Mixed approved/rejected -> PARTIALLY_APPROVED
                        request.setStatus(RequestStatus.PARTIALLY_APPROVED);
                }

                requestRepository.save(request);
        }

        /**
         * Update material details (quantity, rate, etc.).
         */
        @Transactional
        public MaterialItemResponseDTO updateMaterialDetails(Long requestId, Long materialId,
                        UpdateMaterialItemDTO dto,
                        String userEmail) {
                User user = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                Request request = requestRepository.findById(requestId)
                                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));

                Material material = materialRepository.findById(materialId)
                                .orElseThrow(() -> new ResourceNotFoundException("Material not found"));

                // Verify material belongs to this request
                if (!material.getRequest().getId().equals(requestId)) {
                        throw new ForbiddenException("Material does not belong to this request");
                }

                // Authorization: Only Creator (Engineer) or Project Owner can update
                boolean isCreator = request.getCreatedBy().getId().equals(user.getId());
                boolean isProjectOwner = request.getProject().getOwner().getId().equals(user.getId());

                if (!isCreator && !isProjectOwner) {
                        throw new ForbiddenException("You don't have permission to update this material");
                }

                // Update fields
                if (dto.getQuantity() != null)
                        material.setQuantity(dto.getQuantity());
                if (dto.getMeasurementUnit() != null)
                        material.setMeasurementUnit(dto.getMeasurementUnit());
                if (dto.getRateEstimate() != null)
                        material.setRateEstimate(dto.getRateEstimate());
                if (dto.getRateEstimateType() != null)
                        material.setRateEstimateType(RateEstimateType.valueOf(dto.getRateEstimateType()));

                // If material was REJECTED, reset to PENDING and increment revision
                // If material is already PENDING/APPROVED, we just update it (maybe it's a
                // correction before approval)
                if (material.getStatus() == MaterialStatus.REJECTED) {
                        material.setStatus(MaterialStatus.PENDING);
                        material.setRevisionNumber(material.getRevisionNumber() + 1);

                        // If parent Request was REJECTED, check if we can move it back to SUBMITTED
                        if (request.getStatus() == RequestStatus.REJECTED) {
                                // Check if any other materials are still REJECTED
                                boolean anyRejected = request.getMaterials().stream()
                                                .anyMatch(m -> !m.getId().equals(materialId)
                                                                && m.getStatus() == MaterialStatus.REJECTED);

                                if (!anyRejected) {
                                        request.setStatus(RequestStatus.PENDING);
                                }
                        }
                }

                materialRepository.save(material);
                requestRepository.save(request);

                // Audit log
                RequestAuditLog auditLog = RequestAuditLog.builder()
                                .request(request)
                                .action("MATERIAL_UPDATED")
                                .details("Material '" + material.getName() + "' updated")
                                .performedBy(user)
                                .build();
                auditLogRepository.save(auditLog);

                return mapMaterialToDTO(material);
        }
}
