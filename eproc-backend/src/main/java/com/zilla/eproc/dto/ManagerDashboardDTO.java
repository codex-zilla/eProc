package com.zilla.eproc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Dashboard statistics for Project Manager role.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManagerDashboardDTO {
    // Basic Project Stats
    private int activeProjects;
    private int completedProjects;
    private int totalProjects;

    // Basic Request Stats
    private int pendingRequests;
    private int approvedRequests;
    private int rejectedRequests;

    // Resource Stats
    private int assignedEngineers;
    private int availableEngineers;

    // --- NEW FIELDS ---

    /** Procurement status counts and financial totals. */
    private AccountantDashboardDTO.ProcurementStats procurementStats;

    /** Budget vs committed breakdown per project. */
    private List<AccountantDashboardDTO.ProjectBudgetSummary> projectBudgets;

    /** Upcoming or overdue milestones across all projects. */
    private List<RecentMilestoneSummary> upcomingMilestones;

    /** Spend and request volume aggregated by site. */
    private List<SiteActivitySummary> siteActivity;

    /** Average time requests spend pending (in hours). */
    private Double averageApprovalTimeHours;

    /** Auto-computed risk alerts. */
    private List<AccountantDashboardDTO.DashboardAlert> alerts;

    /** Recent requests (PENDING first) for dashboard quick access. */
    private List<RequestSummary> pendingRequestSummaries;

    // -------------------------------------------------------------------------
    // Nested DTOs Specific to Manager
    // -------------------------------------------------------------------------

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RequestSummary {
        private Long id;
        private String title;
        private String projectName;
        private String siteName;
        private String createdByName;
        private String status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentMilestoneSummary {
        private Long id;
        private Long projectId;
        private String projectName;
        private String title;
        private LocalDateTime dueDate;
        private String status;
        private boolean isOverdue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SiteActivitySummary {
        private Long siteId;
        private String siteName;
        private String projectName;
        private int activeRequestsCount;
        private BigDecimal totalSpend; // Committed value at this site
    }
}
