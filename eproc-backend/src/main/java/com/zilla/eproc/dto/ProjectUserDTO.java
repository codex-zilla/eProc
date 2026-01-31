package com.zilla.eproc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for project-bound user with their assignments.
 * Shows a user created by a project owner and all their project assignments.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectUserDTO {

    private Long id;
    private String name;
    private String email;
    private String role; // System role: PROJECT_MANAGER or PROJECT_ACCOUNTANT
    private String phoneNumber;
    private Integer activeProjectCount;
    private List<ProjectAssignmentDTO> projects;
    private Long createdBy;
    private LocalDateTime createdAt;
    private Boolean requirePasswordChange;
    private Boolean active;
}
