package com.zilla.eproc.dto;

import com.zilla.eproc.model.BatchStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for returning BOQ batch information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoqBatchResponseDTO {

    private Long id;
    private String title;
    private String description;
    private BatchStatus status;
    private Long projectId;
    private String projectName;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime submittedAt;

    // Computed fields
    private Integer itemCount;
    private Double totalValue;

    // Optional: Include items in the response
    private List<MaterialRequestResponseDTO> items;

    // Optional: Include attachments
    private List<AttachmentDTO> attachments;
}
