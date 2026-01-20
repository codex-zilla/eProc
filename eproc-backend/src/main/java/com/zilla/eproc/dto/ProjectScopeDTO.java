package com.zilla.eproc.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for ProjectScope entity.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectScopeDTO {
    private Long id;
    private Long projectId;
    private String category; // ScopeCategory enum as string
    private String description;
    private Boolean isIncluded;
    private String notes;
    private LocalDateTime createdAt;
}
