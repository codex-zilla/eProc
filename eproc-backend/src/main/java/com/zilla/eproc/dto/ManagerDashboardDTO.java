package com.zilla.eproc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Dashboard statistics for Project Manager role.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManagerDashboardDTO {
    private int activeProjects;
    private int completedProjects;
    private int totalProjects;

    private int pendingRequests;
    private int approvedRequests;
    private int rejectedRequests;

    private int assignedEngineers;
    private int availableEngineers;
}
