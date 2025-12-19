package com.zilla.eproc.service;

import com.zilla.eproc.dto.ApprovalActionDTO;
import com.zilla.eproc.dto.CreateMaterialRequestDTO;
import com.zilla.eproc.dto.MaterialRequestResponseDTO;
import com.zilla.eproc.dto.RequestAuditDTO;
import com.zilla.eproc.exception.ForbiddenException;
import com.zilla.eproc.exception.ResourceNotFoundException;
import com.zilla.eproc.model.*;
import com.zilla.eproc.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for material request operations with permission and validation
 * checks.
 */
@Service
@RequiredArgsConstructor
public class MaterialRequestService {

    private final MaterialRequestRepository materialRequestRepository;
    private final SiteRepository siteRepository;
    private final MaterialRepository materialRepository;
    private final UserRepository userRepository;
    private final RequestAuditLogRepository auditLogRepository;

    /**
     * Create a new material request.
     * ADR: Engineer can only create requests for projects they are assigned to.
     */
    @Transactional
    public MaterialRequestResponseDTO createRequest(CreateMaterialRequestDTO dto, String requesterEmail) {
        // Validate dates
        validateUsageWindow(dto.getPlannedUsageStart(), dto.getPlannedUsageEnd());

        // Get requester
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Get site
        Site site = siteRepository.findById(dto.getSiteId())
                .orElseThrow(() -> new ResourceNotFoundException("Site not found with ID: " + dto.getSiteId()));

        // ADR Authorization: Engineer can only create requests for their assigned
        // project
        if (requester.getRole() == Role.ENGINEER) {
            Project project = site.getProject();
            if (project.getEngineer() == null || !project.isEngineer(requester)) {
                throw new ForbiddenException(
                        "You can only create requests for projects you are assigned to");
            }
            if (!project.isActiveProject()) {
                throw new ForbiddenException(
                        "Cannot create requests for inactive projects");
            }
        }

        // Check for duplicates
        checkForDuplicates(dto, null);

        // Build request entity
        MaterialRequest request = MaterialRequest.builder()
                .site(site)
                .quantity(dto.getQuantity())
                .plannedUsageStart(dto.getPlannedUsageStart())
                .plannedUsageEnd(dto.getPlannedUsageEnd())
                .emergencyFlag(dto.getEmergencyFlag() != null ? dto.getEmergencyFlag() : false)
                .requestedBy(requester)
                .status(RequestStatus.PENDING)
                .build();

        // Set material (catalog) or manual entry
        if (dto.getMaterialId() != null) {
            Material material = materialRepository.findById(dto.getMaterialId())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Material not found with ID: " + dto.getMaterialId()));
            request.setMaterial(material);
        } else {
            request.setManualMaterialName(dto.getManualMaterialName());
            request.setManualUnit(dto.getManualUnit());
            request.setManualEstimatedPrice(dto.getManualEstimatedPrice());
        }

        MaterialRequest saved = materialRequestRepository.save(request);

        // Log audit: CREATED
        logAudit(saved, requester, RequestAuditAction.CREATED, null);

        return mapToResponseDTO(saved);
    }

    /**
     * Update a rejected request (resubmit).
     * Only the original requester can update, and only if status is REJECTED.
     */
    @Transactional
    public MaterialRequestResponseDTO updateRequest(Long requestId, CreateMaterialRequestDTO dto,
            String requesterEmail) {
        MaterialRequest request = materialRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with ID: " + requestId));

        // Permission check: only owner can update
        if (!request.getRequestedBy().getEmail().equals(requesterEmail)) {
            throw new ForbiddenException("Only the requester can edit this request");
        }

        // Status check: only REJECTED requests can be updated
        if (request.getStatus() != RequestStatus.REJECTED) {
            throw new IllegalStateException(
                    "Only rejected requests can be edited. Current status: " + request.getStatus());
        }

        // Validate dates
        validateUsageWindow(dto.getPlannedUsageStart(), dto.getPlannedUsageEnd());

        // Check for duplicates (excluding current request)
        checkForDuplicates(dto, requestId);

        // Update fields
        request.setQuantity(dto.getQuantity());
        request.setPlannedUsageStart(dto.getPlannedUsageStart());
        request.setPlannedUsageEnd(dto.getPlannedUsageEnd());
        request.setEmergencyFlag(dto.getEmergencyFlag() != null ? dto.getEmergencyFlag() : false);

        // Update material
        if (dto.getMaterialId() != null) {
            Material material = materialRepository.findById(dto.getMaterialId())
                    .orElseThrow(() -> new ResourceNotFoundException("Material not found"));
            request.setMaterial(material);
            request.setManualMaterialName(null);
            request.setManualUnit(null);
            request.setManualEstimatedPrice(null);
        } else {
            request.setMaterial(null);
            request.setManualMaterialName(dto.getManualMaterialName());
            request.setManualUnit(dto.getManualUnit());
            request.setManualEstimatedPrice(dto.getManualEstimatedPrice());
        }

        // Reset to PENDING and clear rejection comment
        request.setStatus(RequestStatus.PENDING);
        request.setRejectionComment(null);

        MaterialRequest saved = materialRequestRepository.save(request);

        // Get requester for audit
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Log audit: RESUBMITTED (editing rejected and resubmitting)
        logAudit(saved, requester, RequestAuditAction.RESUBMITTED, null);

        return mapToResponseDTO(saved);
    }

    /**
     * Approve or reject a request.
     * Only PROJECT_MANAGER can perform this action.
     * ADR: Boss can only approve/reject requests from their own projects.
     */
    @Transactional
    public MaterialRequestResponseDTO processApproval(Long requestId, ApprovalActionDTO dto, String approverEmail) {
        MaterialRequest request = materialRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with ID: " + requestId));

        User approver = userRepository.findByEmail(approverEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Permission check: only PROJECT_MANAGER can approve/reject
        if (approver.getRole() != Role.PROJECT_MANAGER) {
            throw new ForbiddenException("Only Project Managers can approve or reject requests");
        }

        // ADR Authorization: Boss can only approve/reject requests from their projects
        Project project = request.getSite().getProject();
        if (!project.isBoss(approver)) {
            throw new ForbiddenException(
                    "You can only approve/reject requests from your own projects");
        }

        // Status transition check: only PENDING requests can be approved/rejected
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException(
                    "Only pending requests can be approved/rejected. Current status: " + request.getStatus());
        }

        // Apply the action
        request.setStatus(dto.getStatus());
        if (dto.getStatus() == RequestStatus.REJECTED) {
            request.setRejectionComment(dto.getComment());
        }

        MaterialRequest saved = materialRequestRepository.save(request);

        // Log audit: APPROVED or REJECTED
        RequestAuditAction auditAction = dto.getStatus() == RequestStatus.APPROVED
                ? RequestAuditAction.APPROVED
                : RequestAuditAction.REJECTED;
        logAudit(saved, approver, auditAction, dto.getComment());

        return mapToResponseDTO(saved);
    }

    /**
     * Get a request by ID.
     */
    @Transactional(readOnly = true)
    public MaterialRequestResponseDTO getRequestById(Long requestId) {
        MaterialRequest request = materialRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with ID: " + requestId));
        return mapToResponseDTO(request);
    }

    /**
     * Get all pending requests (for approval queue).
     * ADR: Scoped to boss's projects only.
     */
    @Transactional(readOnly = true)
    public List<MaterialRequestResponseDTO> getPendingRequests(String approverEmail) {
        User approver = userRepository.findByEmail(approverEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // ADR: Boss sees only pending requests from their own projects
        if (approver.getRole() == Role.PROJECT_MANAGER) {
            return materialRequestRepository.findByProjectBossIdAndStatus(approver.getId(), RequestStatus.PENDING)
                    .stream()
                    .map(this::mapToResponseDTO)
                    .collect(Collectors.toList());
        }

        // Other roles see all pending (or could be further restricted)
        return materialRequestRepository.findByStatus(RequestStatus.PENDING).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get requests by site.
     */
    @Transactional(readOnly = true)
    public List<MaterialRequestResponseDTO> getRequestsBySite(Long siteId) {
        return materialRequestRepository.findBySiteId(siteId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get requests by requester (for "My Requests" view).
     */
    @Transactional(readOnly = true)
    public List<MaterialRequestResponseDTO> getRequestsByUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return materialRequestRepository.findByRequestedById(user.getId()).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all requests with optional filters.
     */
    @Transactional(readOnly = true)
    public List<MaterialRequestResponseDTO> getAllRequests(RequestStatus status, Long siteId, String userEmail) {
        List<MaterialRequest> requests;

        if (siteId != null && status != null) {
            requests = materialRequestRepository.findBySiteIdAndStatus(siteId, status);
        } else if (siteId != null) {
            requests = materialRequestRepository.findBySiteId(siteId);
        } else if (status != null) {
            requests = materialRequestRepository.findByStatus(status);
        } else if (userEmail != null) {
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            requests = materialRequestRepository.findByRequestedById(user.getId());
        } else {
            requests = materialRequestRepository.findAll();
        }

        return requests.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    // ========== Private Helper Methods ==========

    private void validateUsageWindow(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            throw new IllegalArgumentException("Planned usage start and end are required");
        }
        if (!start.isBefore(end)) {
            throw new IllegalArgumentException("Planned usage start must be before end");
        }
        if (start.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Planned usage start cannot be in the past");
        }
    }

    private void checkForDuplicates(CreateMaterialRequestDTO dto, Long excludeId) {
        List<MaterialRequest> duplicates;

        if (dto.getMaterialId() != null) {
            duplicates = materialRequestRepository.findCatalogDuplicatesWithOverlappingWindow(
                    dto.getSiteId(),
                    dto.getMaterialId(),
                    dto.getPlannedUsageStart(),
                    dto.getPlannedUsageEnd(),
                    excludeId);
        } else {
            duplicates = materialRequestRepository.findManualDuplicatesWithOverlappingWindow(
                    dto.getSiteId(),
                    dto.getManualMaterialName(),
                    dto.getPlannedUsageStart(),
                    dto.getPlannedUsageEnd(),
                    excludeId);
        }

        if (!duplicates.isEmpty()) {
            throw new IllegalArgumentException(
                    "A similar request already exists for this material at this site with an overlapping usage window. "
                            +
                            "Existing request ID: " + duplicates.get(0).getId());
        }
    }

    private MaterialRequestResponseDTO mapToResponseDTO(MaterialRequest request) {
        MaterialRequestResponseDTO.MaterialRequestResponseDTOBuilder builder = MaterialRequestResponseDTO.builder()
                .id(request.getId())
                .siteId(request.getSite().getId())
                .siteName(request.getSite().getName())
                .quantity(request.getQuantity())
                .status(request.getStatus())
                .rejectionComment(request.getRejectionComment())
                .emergencyFlag(request.getEmergencyFlag())
                .plannedUsageStart(request.getPlannedUsageStart())
                .plannedUsageEnd(request.getPlannedUsageEnd())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt());

        // Material info
        if (request.getMaterial() != null) {
            builder.materialId(request.getMaterial().getId())
                    .materialName(request.getMaterial().getName());
        } else {
            builder.manualMaterialName(request.getManualMaterialName())
                    .manualUnit(request.getManualUnit())
                    .manualEstimatedPrice(request.getManualEstimatedPrice());
        }

        // Work package (optional)
        if (request.getWorkPackage() != null) {
            builder.workPackageId(request.getWorkPackage().getId())
                    .workPackageName(request.getWorkPackage().getName());
        }

        // Requester info
        if (request.getRequestedBy() != null) {
            builder.requestedById(request.getRequestedBy().getId())
                    .requestedByName(request.getRequestedBy().getName())
                    .requestedByEmail(request.getRequestedBy().getEmail());
        }

        return builder.build();
    }

    /**
     * Get the audit history for a request.
     */
    @Transactional(readOnly = true)
    public List<RequestAuditDTO> getRequestHistory(Long requestId) {
        // Verify request exists
        if (!materialRequestRepository.existsById(requestId)) {
            throw new ResourceNotFoundException("Request not found with ID: " + requestId);
        }

        return auditLogRepository.findByRequestIdOrderByCreatedAtAsc(requestId).stream()
                .map(this::mapAuditToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Log an audit entry for a request action.
     */
    private void logAudit(MaterialRequest request, User actor, RequestAuditAction action, String comment) {
        RequestAuditLog log = RequestAuditLog.builder()
                .request(request)
                .actor(actor)
                .action(action)
                .statusSnapshot(request.getStatus())
                .comment(comment)
                .build();
        auditLogRepository.save(log);
    }

    private RequestAuditDTO mapAuditToDTO(RequestAuditLog log) {
        return RequestAuditDTO.builder()
                .id(log.getId())
                .action(log.getAction().name())
                .statusSnapshot(log.getStatusSnapshot() != null ? log.getStatusSnapshot().name() : null)
                .comment(log.getComment())
                .timestamp(log.getCreatedAt())
                .actorId(log.getActor().getId())
                .actorName(log.getActor().getName())
                .actorEmail(log.getActor().getEmail())
                .actorRole(log.getActor().getRole().name())
                .build();
    }
}
