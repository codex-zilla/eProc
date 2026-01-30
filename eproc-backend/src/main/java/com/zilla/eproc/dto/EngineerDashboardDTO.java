package com.zilla.eproc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Dashboard statistics for Engineer role.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EngineerDashboardDTO {
    private Long assignedProjectId;
    private String assignedProjectName;
    private String projectStatus;
    private String ownerName;
    private String ownerEmail;

    private int pendingRequests;
    private int approvedRequests;
    private int rejectedRequests;
    private int totalRequests;
}
