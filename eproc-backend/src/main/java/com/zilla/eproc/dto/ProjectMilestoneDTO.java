package com.zilla.eproc.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for ProjectMilestone entity.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectMilestoneDTO {
    private Long id;
    private Long projectId;
    private String name;
    private LocalDate deadline;
    private String status; // MilestoneStatus enum as string
    private Boolean approvalRequired;
    private Long approvedById;
    private String approvedByName;
    private LocalDateTime approvedAt;
    private String notes;
    private LocalDateTime createdAt;
}
