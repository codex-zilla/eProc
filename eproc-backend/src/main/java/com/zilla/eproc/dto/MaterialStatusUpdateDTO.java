package com.zilla.eproc.dto;

import com.zilla.eproc.model.MaterialStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating material item status.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaterialStatusUpdateDTO {

    @NotNull(message = "Status is required")
    private MaterialStatus status;

    private String comment;
}
