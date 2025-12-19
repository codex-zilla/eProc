package com.zilla.eproc.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO for assigning an engineer to a project.
 */
@Data
public class AssignEngineerDTO {

    @NotNull(message = "Engineer ID is required")
    private Long engineerId;
}
