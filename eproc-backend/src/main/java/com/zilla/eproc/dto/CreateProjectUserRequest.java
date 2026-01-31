package com.zilla.eproc.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request DTO for creating a new project-bound user.
 * Used by project owners to create PROJECT_MANAGER or PROJECT_ACCOUNTANT users.
 */
@Data
public class CreateProjectUserRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Role is required")
    private String role; // PROJECT_MANAGER or PROJECT_ACCOUNTANT

    @NotNull(message = "Project ID is required for initial assignment")
    private Long projectId;

    private String phoneNumber;

    @NotBlank(message = "Start date is required")
    private String startDate; // Format: YYYY-MM-DD

    private String responsibilityLevel; // FULL, PARTIAL, ADVISORY - defaults to FULL
}
