package com.zilla.eproc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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

    // --- NEW FIELDS ---

    /**
     * Remaining budget for the assigned project (or specific work package if
     * supported later).
     */
    private BigDecimal remainingBudget;
    private BigDecimal totalBudget;

    /** Expected upcoming deliveries tied to the engineer's requests. */
    private List<ExpectedDeliverySummary> expectedDeliveries;

    /** Upcoming milestones for the assigned project. */
    private List<ManagerDashboardDTO.RecentMilestoneSummary> projectMilestones;

    /** Recent request status changes or log events. */
    private List<ActivityFeedItem> activityFeed;

    /** Actionable alerts (e.g. rejected requests needing attention). */
    private List<AccountantDashboardDTO.DashboardAlert> alerts;

    // -------------------------------------------------------------------------
    // Nested DTOs Specific to Engineer
    // -------------------------------------------------------------------------

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExpectedDeliverySummary {
        private Long deliveryId;
        private String deliveryRef;
        private Long requestId;
        private String requestTitle;
        private String siteName;
        private LocalDateTime expectedDate;
        private String status;
        private String vendorName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityFeedItem {
        private Long id; // Audit log ID
        private Long requestId;
        private String requestTitle;
        private String action; // e.g., "STATUS_CHANGED", "CREATED"
        private String description; // e.g., "Request #123 was Approved by John"
        private LocalDateTime timestamp;
        private String actorName;
    }
}
