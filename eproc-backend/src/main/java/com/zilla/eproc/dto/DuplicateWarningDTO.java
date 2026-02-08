package com.zilla.eproc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for warning about potential duplicate requests.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DuplicateWarningDTO {
    private Long requestId;
    private String requestTitle;
    private String boqReferenceCode;
    private LocalDateTime plannedStartDate;
    private LocalDateTime plannedEndDate;
    private List<String> overlappingMaterials;
    private Double timelineOverlapPercentage;
    private String status;
    private String siteName;
}
