package com.zilla.eproc.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for ProjectAssignment entity.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectAssignmentDTO {
    private Long id;
    private Long projectId;
    private String projectName;
    private Long userId;
    private String userName;
    private String userEmail;
    private String role; // ProjectRole enum as string
    private String responsibilityLevel; // ResponsibilityLevel enum as string
    private String reportingLine;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
