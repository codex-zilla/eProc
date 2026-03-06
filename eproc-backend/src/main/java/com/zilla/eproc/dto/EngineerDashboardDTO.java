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

    /** Recent requests (APPROVED/REJECTED first) for dashboard quick access. */
    private List<RequestSummary> recentRequests;

    // -------------------------------------------------------------------------
    // Nested DTOs Specific to Engineer
    // -------------------------------------------------------------------------

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExpectedDeliverySummary {
        private Long poId; // Purchase Order ID
        private String poNumber; // Purchase Order number (e.g. PO-2026-001)
        private Long requestId;
        private String requestTitle;
        private String siteName;
        private LocalDateTime expectedDate; // Auto-set to PO.expectedDeliveryDate
        private String status;
        private String vendorName;
        private int itemsCount; // Number of line items on the PO
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityFeedItem {
        private Long id; // Audit log ID
        private Long requestId;
        private String type; // e.g. "CREATED", "APPROVED", "REJECTED"
        private String title; // Request title
        private String description; // Human-readable summary
        private LocalDateTime timestamp;
        private String actorName;
        private String status; // Optional: APPROVED, REJECTED, PENDING (for icon colouring)
    }

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
}
