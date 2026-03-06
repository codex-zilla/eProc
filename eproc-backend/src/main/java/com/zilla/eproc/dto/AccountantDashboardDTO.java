package com.zilla.eproc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Dashboard statistics for the Accountant (Procurement) role.
 *
 * Provides aggregated procurement and financial data without requiring
 * a dedicated analytics layer — computed from existing PO and Request data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountantDashboardDTO {

    /** Procurement status counts and financial totals. */
    private ProcurementStats stats;

    /** Budget vs committed breakdown per project. */
    private List<ProjectBudgetSummary> budgetOverview;

    /** 5 most recently created purchase orders. */
    private List<RecentPOSummary> recentPOs;

    /** 5 most recently updated POs with delivery activity. */
    private List<RecentRequestSummary> recentApprovedRequests;

    /** Last 6 months of committed vs delivered spend. */
    private List<MonthlySpend> monthlySpend;

    /** Auto-computed risk alerts (over-delivered, under-ordered, etc.). */
    private List<DashboardAlert> alerts;

    // -------------------------------------------------------------------------
    // Nested DTOs
    // -------------------------------------------------------------------------

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProcurementStats {
        private int approvedRequestsCount;
        private int totalPOsCount;
        private int openPOsCount;
        private int partiallyDeliveredCount;
        private int deliveredCount; // DELIVERED + CLOSED count
        private BigDecimal totalCommittedValue; // sum of all PO totalValue
        private BigDecimal openPOsValue; // sum of OPEN PO values
        private BigDecimal deliveredValue; // sum of DELIVERED/CLOSED PO values
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectBudgetSummary {
        private Long projectId;
        private String projectName;
        private String currency;
        private BigDecimal budgetTotal;
        private BigDecimal committedAmount; // sum of PO totalValue for project
        private BigDecimal utilizationPct; // committedAmount / budgetTotal * 100
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentPOSummary {
        private Long id;
        private String poNumber;
        private String projectName;
        private String siteName;
        private String vendorName;
        private String status;
        private BigDecimal totalValue;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentRequestSummary {
        private Long id;
        private String projectName;
        private String siteName;
        private String createdByName;
        private String title;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlySpend {
        /** Format: "YYYY-MM" e.g. "2026-02" */
        private String month;
        private BigDecimal committed; // POs created in this month
        private BigDecimal delivered; // POs reaching DELIVERED/CLOSED in this month
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardAlert {
        private String type; // OVER_DELIVERED | UNDER_ORDERED | BUDGET_THRESHOLD
        private String severity; // danger | warning | info
        private String title;
        private String message;
        private Long referenceId; // PO id or Request id
    }
}
