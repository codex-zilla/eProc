package com.zilla.eproc.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO for updating project status.
 */
@Data
public class UpdateProjectStatusDTO {

    @NotNull(message = "Status is required")
    private String status; // ACTIVE, COMPLETED, CANCELLED
}
