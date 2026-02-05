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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing BOQ Batches.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BoqBatchService {

    private final BoqBatchRepository boqBatchRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final SiteRepository siteRepository;
    private final MaterialRepository materialRepository;
    private final MaterialRequestRepository materialRequestRepository;

    /**
     * Create a new batch with multiple items.
     */
    @Transactional
    public BoqBatchResponseDTO createBatch(CreateBoqBatchDTO dto, String userEmail) {
        log.info("Creating batch '{}' for project {} by user {}", dto.getTitle(), dto.getProjectId(), userEmail);

        // Get the requester
        User requester = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Get the project
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + dto.getProjectId()));

        // Authorization: Only engineers assigned to this project can create batches
        boolean isAssigned = project.getTeamAssignments().stream()
                .anyMatch(assignment -> assignment.getUser().getId().equals(requester.getId())
                        && (assignment.getRole() == ProjectRole.LEAD_ENGINEER
                                || assignment.getRole() == ProjectRole.SITE_ENGINEER
                                || assignment.getRole() == ProjectRole.CONSULTANT_ENGINEER));

        if (!isAssigned && requester.getRole() != Role.PROJECT_OWNER) {
            throw new ForbiddenException("You are not assigned to this project");
        }

        // Create the batch
        BoqBatch batch = BoqBatch.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .status(BatchStatus.DRAFT)
                .project(project)
                .createdBy(requester)
                .build();

        // Save batch first to get ID
        batch = boqBatchRepository.save(batch);

        // Create material requests for each item
        List<MaterialRequest> requests = new ArrayList<>();
        for (CreateMaterialRequestDTO itemDto : dto.getItems()) {
            MaterialRequest request = createRequestFromDTO(itemDto, requester, batch);
            requests.add(request);
        }

        // Save all requests
        materialRequestRepository.saveAll(requests);
        batch.setItems(requests);

        log.info("Batch created with ID {} containing {} items", batch.getId(), requests.size());

        return mapToResponseDTO(batch, true);
    }

    /**
     * Submit a batch for approval (change status from DRAFT to SUBMITTED).
     */
    @Transactional
    public BoqBatchResponseDTO submitBatch(Long batchId, String userEmail) {
        log.info("Submitting batch {} by user {}", batchId, userEmail);

        BoqBatch batch = boqBatchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with ID: " + batchId));

        // Authorization
        User requester = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!batch.getCreatedBy().getId().equals(requester.getId())) {
            throw new ForbiddenException("You can only submit your own batches");
        }

        if (batch.getStatus() != BatchStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT batches can be submitted");
        }

        if (batch.getItems().isEmpty()) {
            throw new IllegalStateException("Cannot submit empty batch");
        }

        // Update status
        batch.setStatus(BatchStatus.SUBMITTED);
        batch.setSubmittedAt(LocalDateTime.now());

        // Update all items to PENDING status
        batch.getItems().forEach(item -> item.setStatus(RequestStatus.PENDING));

        batch = boqBatchRepository.save(batch);

        log.info("Batch {} submitted successfully", batchId);

        return mapToResponseDTO(batch, true);
    }

    /**
     * Get batch by ID.
     */
    @Transactional(readOnly = true)
    public BoqBatchResponseDTO getBatchById(Long batchId, String userEmail) {
        BoqBatch batch = boqBatchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with ID: " + batchId));

        // Authorization: Can view if created by user or user is project owner
        User requester = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean canView = batch.getCreatedBy().getId().equals(requester.getId())
                || batch.getProject().getOwner().getId().equals(requester.getId());

        if (!canView) {
            throw new ForbiddenException("You do not have permission to view this batch");
        }

        return mapToResponseDTO(batch, true);
    }

    /**
     * Get all batches created by the current user.
     */
    @Transactional(readOnly = true)
    public List<BoqBatchResponseDTO> getMyBatches(String userEmail) {
        User requester = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<BoqBatch> batches = boqBatchRepository.findByCreatedByIdOrderByCreatedAtDesc(requester.getId());

        return batches.stream()
                .map(batch -> mapToResponseDTO(batch, false))
                .collect(Collectors.toList());
    }

    /**
     * Get all batches for a project (for project owners).
     */
    @Transactional(readOnly = true)
    public List<BoqBatchResponseDTO> getProjectBatches(Long projectId, String userEmail) {
        User requester = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // Authorization: Only project owner can view all batches
        if (!project.getOwner().getId().equals(requester.getId())) {
            throw new ForbiddenException("Only project owner can view all batches");
        }

        List<BoqBatch> batches = boqBatchRepository.findByProjectIdOrderByCreatedAtDesc(projectId);

        return batches.stream()
                .map(batch -> mapToResponseDTO(batch, false))
                .collect(Collectors.toList());
    }

    /**
     * Helper: Create MaterialRequest from DTO.
     */
    private MaterialRequest createRequestFromDTO(CreateMaterialRequestDTO dto, User requester, BoqBatch batch) {
        Site site = siteRepository.findById(dto.getSiteId())
                .orElseThrow(() -> new ResourceNotFoundException("Site not found"));

        MaterialRequest request = MaterialRequest.builder()
                .site(site)
                .requestedBy(requester)
                .quantity(dto.getQuantity())
                .emergencyFlag(dto.getEmergencyFlag() != null && dto.getEmergencyFlag())
                .plannedUsageStart(dto.getPlannedUsageStart())
                .plannedUsageEnd(dto.getPlannedUsageEnd())
                .status(RequestStatus.PENDING) // Will be submitted immediately with batch
                .batch(batch)
                .build();

        // BOQ fields
        if (dto.getBoqReferenceCode() != null) {
            request.setBoqReferenceCode(dto.getBoqReferenceCode());
            request.setWorkDescription(dto.getWorkDescription());
            request.setMeasurementUnit(dto.getMeasurementUnit());
            request.setRateEstimate(dto.getRateEstimate());
            request.setRateType(dto.getRateType() != null ? dto.getRateType() : "ENGINEER_ESTIMATE");
        }

        // Material (catalog or manual)
        if (dto.getMaterialId() != null) {
            Material material = materialRepository.findById(dto.getMaterialId())
                    .orElseThrow(() -> new ResourceNotFoundException("Material not found"));
            request.setMaterial(material);
        } else {
            request.setManualMaterialName(dto.getManualMaterialName());
            request.setManualUnit(dto.getManualUnit());
            request.setManualEstimatedPrice(dto.getManualEstimatedPrice());
        }

        return request;
    }

    /**
     * Helper: Map entity to response DTO.
     */
    private BoqBatchResponseDTO mapToResponseDTO(BoqBatch batch, boolean includeItems) {
        BoqBatchResponseDTO dto = BoqBatchResponseDTO.builder()
                .id(batch.getId())
                .title(batch.getTitle())
                .description(batch.getDescription())
                .status(batch.getStatus())
                .projectId(batch.getProject().getId())
                .projectName(batch.getProject().getName())
                .createdById(batch.getCreatedBy().getId())
                .createdByName(batch.getCreatedBy().getName())
                .createdAt(batch.getCreatedAt())
                .updatedAt(batch.getUpdatedAt())
                .submittedAt(batch.getSubmittedAt())
                .itemCount(batch.getItemCount())
                .totalValue(batch.getTotalValue())
                .build();

        if (includeItems && batch.getItems() != null) {
            // Map items (simplified - you may want to use MaterialRequestService for full
            // mapping)
            List<MaterialRequestResponseDTO> itemDTOs = batch.getItems().stream()
                    .map(this::mapRequestToDTO)
                    .collect(Collectors.toList());
            dto.setItems(itemDTOs);
        }

        return dto;
    }

    /**
     * Helper: Simplified request to DTO mapping.
     */
    private MaterialRequestResponseDTO mapRequestToDTO(MaterialRequest request) {
        return MaterialRequestResponseDTO.builder()
                .id(request.getId())
                .siteId(request.getSite().getId())
                .siteName(request.getSite().getName())
                .boqReferenceCode(request.getBoqReferenceCode())
                .workDescription(request.getWorkDescription())
                .measurementUnit(request.getMeasurementUnit())
                .quantity(request.getQuantity())
                .rateEstimate(request.getRateEstimate())
                .rateType(request.getRateType())
                .status(request.getStatus())
                .createdAt(request.getCreatedAt())
                .build();
    }
}
