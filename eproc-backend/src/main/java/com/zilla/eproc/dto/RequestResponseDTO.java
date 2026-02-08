package com.zilla.eproc.dto;

import com.zilla.eproc.model.Priority;
import com.zilla.eproc.model.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for Request response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestResponseDTO {

    private Long id;
    private Long projectId;
    private String projectName;
    private Long siteId;
    private String siteName;
    private String title;
    private LocalDateTime plannedStartDate;
    private LocalDateTime plannedEndDate;
    private Priority priority;
    private RequestStatus status;
    private String additionalDetails;
    private String boqReferenceCode;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer materialCount;
    private Double totalValue;
    private Boolean isDuplicateFlagged;
    private String duplicateExplanation;
    private Long duplicateOfRequestId;
    private String duplicateOfRequestTitle;
    private List<DuplicateMaterialInfoDTO> duplicateDetails;

    // Optional: Include materials for detailed view
    private List<MaterialItemResponseDTO> materials;
}
