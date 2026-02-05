package com.zilla.eproc.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for creating a new BOQ batch with multiple items.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBoqBatchDTO {

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotBlank(message = "Batch title is required")
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    private String title;

    @Size(max = 5000, message = "Description cannot exceed 5000 characters")
    private String description;

    /**
     * List of material request items to include in this batch.
     */
    @NotNull(message = "Items list is required")
    @Size(min = 1, message = "Batch must contain at least one item")
    private List<CreateMaterialRequestDTO> items;
}
