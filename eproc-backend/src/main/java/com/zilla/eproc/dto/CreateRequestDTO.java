package com.zilla.eproc.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for creating a new Request (BOQ request).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRequestDTO {

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotNull(message = "Site ID is required")
    private Long siteId;

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 500, message = "Title must be between 3 and 500 characters")
    private String title;

    @NotNull(message = "Planned start date is required")
    private LocalDateTime plannedStartDate;

    @NotNull(message = "Planned end date is required")
    private LocalDateTime plannedEndDate;

    @Builder.Default
    private Boolean emergencyFlag = false;

    @Size(max = 5000, message = "Additional details cannot exceed 5000 characters")
    private String additionalDetails;

    /**
     * List of material/labour items in this request.
     */
    @NotNull(message = "Items list is required")
    @Size(min = 1, message = "Request must contain at least one item")
    private List<CreateMaterialItemDTO> items;

    /**
     * Validates that plannedStartDate is before plannedEndDate.
     */
    @AssertTrue(message = "Planned start date must be before end date")
    public boolean isValidDateRange() {
        if (plannedStartDate != null && plannedEndDate != null) {
            return plannedStartDate.isBefore(plannedEndDate);
        }
        return true;
    }
}
