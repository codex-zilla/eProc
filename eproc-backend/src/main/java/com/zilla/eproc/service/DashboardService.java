package com.zilla.eproc.service;

import com.zilla.eproc.dto.AccountantDashboardDTO;
import com.zilla.eproc.dto.AccountantDashboardDTO.*;
import com.zilla.eproc.dto.EngineerDashboardDTO;
import com.zilla.eproc.dto.ManagerDashboardDTO;
import com.zilla.eproc.exception.ResourceNotFoundException;
import com.zilla.eproc.model.*;
import com.zilla.eproc.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for dashboard statistics.
 * Updated for Role Model Overhaul: boss → owner, uses ProjectAssignment for
 * engineer access.
 * Updated for Request/Material architecture: MaterialRequest → Request.
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

        private final UserRepository userRepository;
        private final ProjectRepository projectRepository;
        private final RequestRepository requestRepository;
        private final ProjectAssignmentRepository projectAssignmentRepository;
        private final PurchaseOrderRepository purchaseOrderRepository;

        /**
         * Get dashboard statistics for an engineer.
         * Engineer's projects are now determined via ProjectAssignment table.
         */
        @Transactional(readOnly = true)
        public EngineerDashboardDTO getEngineerDashboard(String email) {
                User engineer = userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                // Find engineer's active project assignments
                List<ProjectAssignment> assignments = projectAssignmentRepository
                                .findByUserIdAndIsActiveTrue(engineer.getId());

                EngineerDashboardDTO.EngineerDashboardDTOBuilder builder = EngineerDashboardDTO.builder();

                Project activeProject = null;

                if (!assignments.isEmpty()) {
                        // Take the first active assignment's project
                        activeProject = assignments.get(0).getProject();
                        if (activeProject != null && activeProject.getStatus() == ProjectStatus.ACTIVE) {
                                builder.assignedProjectId(activeProject.getId())
                                                .assignedProjectName(activeProject.getName())
                                                .projectStatus(activeProject.getStatus().name())
                                                .totalBudget(activeProject.getBudgetTotal());

                                if (activeProject.getOwner() != null) {
                                        builder.ownerName(activeProject.getOwner().getName())
                                                        .ownerEmail(activeProject.getOwner().getEmail());
                                }
                        }
                }

                // Get request statistics
                List<Request> myRequests = requestRepository
                                .findByCreatedById(engineer.getId());

                int pending = (int) myRequests.stream()
                                .filter(r -> r.getStatus() == RequestStatus.PENDING).count();
                int approved = (int) myRequests.stream()
                                .filter(r -> r.getStatus() == RequestStatus.APPROVED).count();
                int rejected = (int) myRequests.stream()
                                .filter(r -> r.getStatus() == RequestStatus.REJECTED).count();

                builder.pendingRequests(pending)
                                .approvedRequests(approved)
                                .rejectedRequests(rejected)
                                .totalRequests(myRequests.size());

                // --- NEW STATISTICS LOGIC ---

                final Project finalActiveProject = activeProject;

                // Remaining Budget Calculation for assigned project
                if (finalActiveProject != null) {
                        List<PurchaseOrder> projectPOs = purchaseOrderRepository.findAllWithProjectAndSite().stream()
                                        .filter(po -> po.getProject() != null
                                                        && po.getProject().getId().equals(finalActiveProject.getId()))
                                        .toList();
                        BigDecimal committed = projectPOs.stream()
                                        .map(po -> po.getTotalValue() != null ? po.getTotalValue() : BigDecimal.ZERO)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                        BigDecimal remaining = (finalActiveProject.getBudgetTotal() != null)
                                        ? finalActiveProject.getBudgetTotal().subtract(committed)
                                        : BigDecimal.ZERO;
                        builder.remainingBudget(remaining);
                } else {
                        builder.remainingBudget(BigDecimal.ZERO);
                        builder.totalBudget(BigDecimal.ZERO);
                }

                // Upcoming Milestones
                if (finalActiveProject != null && finalActiveProject.getMilestones() != null) {
                        List<ManagerDashboardDTO.RecentMilestoneSummary> milestones = finalActiveProject.getMilestones()
                                        .stream()
                                        .filter(m -> m.getStatus() != MilestoneStatus.COMPLETED)
                                        .sorted(Comparator.comparing(
                                                        m -> m.getDeadline() != null ? m.getDeadline()
                                                                        : java.time.LocalDate.MAX))
                                        .limit(5)
                                        .map(m -> ManagerDashboardDTO.RecentMilestoneSummary.builder()
                                                        .id(m.getId())
                                                        .projectId(finalActiveProject.getId())
                                                        .projectName(finalActiveProject.getName())
                                                        .title(m.getName())
                                                        .dueDate(m.getDeadline() != null
                                                                        ? m.getDeadline().atStartOfDay()
                                                                        : null)
                                                        .status(m.getStatus().name())
                                                        .isOverdue(m.getDeadline() != null && m.getDeadline()
                                                                        .isBefore(java.time.LocalDate.now()))
                                                        .build())
                                        .toList();
                        builder.projectMilestones(milestones);
                } else {
                        builder.projectMilestones(Collections.emptyList());
                }

                // Expected Deliveries (Deliveries targeting Engineer's requests)
                // Finding POs linked to activeProject
                List<PurchaseOrder> allPOsForProject = finalActiveProject != null
                                ? purchaseOrderRepository.findAllWithItemsAndDeliveries().stream()
                                                .filter(po -> po.getProject() != null && po.getProject().getId()
                                                                .equals(finalActiveProject.getId()))
                                                .toList()
                                : Collections.emptyList();

                List<EngineerDashboardDTO.ExpectedDeliverySummary> expectedDeliveries = new ArrayList<>();
                for (PurchaseOrder po : allPOsForProject) {
                        if (po.getStatus() == PurchaseOrderStatus.OPEN
                                        || po.getStatus() == PurchaseOrderStatus.PARTIALLY_DELIVERED) {
                                expectedDeliveries.add(EngineerDashboardDTO.ExpectedDeliverySummary
                                                .builder()
                                                .deliveryId(po.getId()) // Use PO ID as placeholder for expected
                                                .deliveryRef("PO-" + po.getPoNumber())
                                                .requestId(po.getRequest() != null ? po.getRequest().getId() : null)
                                                .requestTitle(po.getRequest() != null ? po.getRequest().getTitle()
                                                                : null)
                                                .siteName(po.getSite() != null ? po.getSite().getName()
                                                                : null)
                                                .expectedDate(null) // Expected delivery date not natively tracked at PO
                                                                    // level MVP
                                                .status(po.getStatus().name())
                                                .vendorName(po.getVendorName())
                                                .build());
                        }
                }

                // Sort by expected date
                expectedDeliveries.sort(Comparator.comparing(
                                e -> e.getExpectedDate() != null ? e.getExpectedDate() : LocalDateTime.MAX,
                                Comparator.nullsLast(Comparator.naturalOrder())));

                builder.expectedDeliveries(expectedDeliveries.stream().limit(5).toList());

                // Activity Feed (Dummy implementation, should query RequestAuditLog)
                builder.activityFeed(Collections.emptyList());

                // Alerts (Rejected requests needing attention)
                List<AccountantDashboardDTO.DashboardAlert> engineeAlerts = myRequests.stream()
                                .filter(r -> r.getStatus() == RequestStatus.REJECTED)
                                .map(r -> AccountantDashboardDTO.DashboardAlert.builder()
                                                .type("REQUEST_REJECTED")
                                                .severity("danger")
                                                .title("Request Rejected")
                                                .message("Request '" + r.getTitle() + "' requires your attention.")
                                                .referenceId(r.getId())
                                                .build())
                                .toList();
                builder.alerts(engineeAlerts);

                return builder.build();
        }

        /**
         * Get dashboard statistics for a project owner.
         */
        @Transactional(readOnly = true)
        public ManagerDashboardDTO getManagerDashboard(String email) {
                User owner = userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                // Get projects owned by this user
                List<Project> myProjects = projectRepository.findByOwnerId(owner.getId());

                int activeProjects = (int) myProjects.stream()
                                .filter(p -> p.getStatus() == ProjectStatus.ACTIVE).count();
                int completedProjects = (int) myProjects.stream()
                                .filter(p -> p.getStatus() == ProjectStatus.COMPLETED).count();

                // Get team members assigned to my active projects (via ProjectAssignment)
                int assignedTeamMembers = 0;
                for (Project p : myProjects) {
                        if (p.getStatus() == ProjectStatus.ACTIVE && p.getTeamAssignments() != null) {
                                assignedTeamMembers += (int) p.getTeamAssignments().stream()
                                                .filter(pa -> Boolean.TRUE.equals(pa.getIsActive())
                                                                && pa.getRole() != ProjectRole.PROJECT_OWNER)
                                                .count();
                        }
                }

                // Get available engineers (by system role)
                List<User> availableEngineers = userRepository.findByRoleAndActiveTrue(Role.ENGINEER);

                // Get pending requests from my projects
                List<Request> allFromMyProjects = requestRepository.findByProjectIdInOrderByCreatedAtDesc(
                                myProjects.stream().map(Project::getId).toList());

                List<Request> pendingFromMyProjects = allFromMyProjects.stream()
                                .filter(r -> r.getStatus() == RequestStatus.PENDING)
                                .toList();

                int approved = (int) allFromMyProjects.stream()
                                .filter(r -> r.getStatus() == RequestStatus.APPROVED).count();
                int rejected = (int) allFromMyProjects.stream()
                                .filter(r -> r.getStatus() == RequestStatus.REJECTED).count();

                // --- NEW STATISTICS LOGIC ---

                ManagerDashboardDTO.ManagerDashboardDTOBuilder builder = ManagerDashboardDTO.builder()
                                .activeProjects(activeProjects)
                                .completedProjects(completedProjects)
                                .totalProjects(myProjects.size())
                                .pendingRequests(pendingFromMyProjects.size())
                                .approvedRequests(approved)
                                .rejectedRequests(rejected)
                                .assignedEngineers(assignedTeamMembers)
                                .availableEngineers(availableEngineers.size());

                // 1. Procurement Stats & Budget Overview
                // We'll mimic Accountant's partial load, but scoped to owner's projects
                List<Long> projectIds = myProjects.stream().map(Project::getId).toList();
                List<PurchaseOrder> myPOs = purchaseOrderRepository.findAllWithProjectAndSite().stream()
                                .filter(po -> po.getProject() != null && projectIds.contains(po.getProject().getId()))
                                .toList();

                int openCount = (int) myPOs.stream()
                                .filter(po -> po.getStatus() == PurchaseOrderStatus.OPEN).count();
                int partialCount = (int) myPOs.stream()
                                .filter(po -> po.getStatus() == PurchaseOrderStatus.PARTIALLY_DELIVERED).count();
                int deliveredCount = (int) myPOs.stream()
                                .filter(po -> po.getStatus() == PurchaseOrderStatus.DELIVERED
                                                || po.getStatus() == PurchaseOrderStatus.CLOSED)
                                .count();

                BigDecimal totalCommitted = myPOs.stream()
                                .map(po -> po.getTotalValue() != null ? po.getTotalValue() : BigDecimal.ZERO)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal openValue = myPOs.stream()
                                .filter(po -> po.getStatus() == PurchaseOrderStatus.OPEN)
                                .map(po -> po.getTotalValue() != null ? po.getTotalValue() : BigDecimal.ZERO)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                AccountantDashboardDTO.ProcurementStats pStats = AccountantDashboardDTO.ProcurementStats.builder()
                                .approvedRequestsCount(approved)
                                .totalPOsCount(myPOs.size())
                                .openPOsCount(openCount)
                                .partiallyDeliveredCount(partialCount)
                                .deliveredCount(deliveredCount)
                                .totalCommittedValue(totalCommitted)
                                .openPOsValue(openValue)
                                .build();
                builder.procurementStats(pStats);

                // 2. Budget Overview
                Map<Long, List<PurchaseOrder>> posByProject = myPOs.stream()
                                .filter(po -> po.getProject() != null)
                                .collect(Collectors.groupingBy(po -> po.getProject().getId()));

                List<AccountantDashboardDTO.ProjectBudgetSummary> budgetOverview = new ArrayList<>();
                for (Project project : myProjects) {
                        BigDecimal committed = posByProject.getOrDefault(project.getId(), Collections.emptyList())
                                        .stream()
                                        .map(po -> po.getTotalValue() != null ? po.getTotalValue() : BigDecimal.ZERO)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                        BigDecimal budget = project.getBudgetTotal();
                        BigDecimal utilPct = (budget != null && budget.compareTo(BigDecimal.ZERO) > 0)
                                        ? committed.divide(budget, 4, RoundingMode.HALF_UP)
                                                        .multiply(BigDecimal.valueOf(100))
                                                        .setScale(2, RoundingMode.HALF_UP)
                                        : BigDecimal.ZERO;

                        budgetOverview.add(AccountantDashboardDTO.ProjectBudgetSummary.builder()
                                        .projectId(project.getId())
                                        .projectName(project.getName())
                                        .currency(project.getCurrency() != null ? project.getCurrency() : "TZS")
                                        .budgetTotal(budget != null ? budget : BigDecimal.ZERO)
                                        .committedAmount(committed)
                                        .utilizationPct(utilPct)
                                        .build());
                }
                builder.projectBudgets(budgetOverview);

                // 3. Upcoming Milestones
                List<ManagerDashboardDTO.RecentMilestoneSummary> upcomingMilestones = new ArrayList<>();
                for (Project project : myProjects) {
                        if (project.getMilestones() != null) {
                                upcomingMilestones.addAll(project.getMilestones().stream()
                                                .filter(m -> m.getStatus() != MilestoneStatus.COMPLETED)
                                                .map(m -> ManagerDashboardDTO.RecentMilestoneSummary.builder()
                                                                .id(m.getId())
                                                                .projectId(project.getId())
                                                                .projectName(project.getName())
                                                                .title(m.getName())
                                                                .dueDate(m.getDeadline() != null
                                                                                ? m.getDeadline().atStartOfDay()
                                                                                : null)
                                                                .status(m.getStatus().name())
                                                                .isOverdue(m.getDeadline() != null && m
                                                                                .getDeadline()
                                                                                .isBefore(java.time.LocalDate.now()))
                                                                .build())
                                                .toList());
                        }
                }
                upcomingMilestones.sort(
                                Comparator.comparing(m -> m.getDueDate() != null ? m.getDueDate() : LocalDateTime.MAX));
                builder.upcomingMilestones(upcomingMilestones.stream().limit(5).toList());

                // 4. Site Activity Summary
                Map<Long, List<Request>> requestsBySite = allFromMyProjects.stream()
                                .filter(r -> r.getSite() != null && (r.getStatus() == RequestStatus.PENDING
                                                || r.getStatus() == RequestStatus.APPROVED))
                                .collect(Collectors.groupingBy(r -> r.getSite().getId()));

                Map<Long, BigDecimal> spendBySite = myPOs.stream()
                                .filter(po -> po.getSite() != null)
                                .collect(Collectors.groupingBy(
                                                po -> po.getSite().getId(),
                                                Collectors.reducing(BigDecimal.ZERO,
                                                                po -> po.getTotalValue() != null ? po.getTotalValue()
                                                                                : BigDecimal.ZERO,
                                                                BigDecimal::add)));

                List<ManagerDashboardDTO.SiteActivitySummary> siteActivity = new ArrayList<>();
                for (Map.Entry<Long, List<Request>> entry : requestsBySite.entrySet()) {
                        Site s = entry.getValue().get(0).getSite();
                        siteActivity.add(ManagerDashboardDTO.SiteActivitySummary.builder()
                                        .siteId(s.getId())
                                        .siteName(s.getName())
                                        .projectName(entry.getValue().get(0).getProject().getName())
                                        .activeRequestsCount(entry.getValue().size())
                                        .totalSpend(spendBySite.getOrDefault(s.getId(), BigDecimal.ZERO))
                                        .build());
                }
                builder.siteActivity(siteActivity);

                // 5. Build Alerts (Use existing helper, passing restricted lists)
                // Filter all requests just to active ones for the alerts logic
                List<AccountantDashboardDTO.DashboardAlert> ownerAlerts = buildAlerts(myPOs, allFromMyProjects);
                builder.alerts(ownerAlerts);

                builder.averageApprovalTimeHours(0.0); // Dummy for now

                return builder.build();
        }

        /**
         * Get full dashboard data for the Accountant role.
         *
         * <p>
         * Uses two targeted queries to avoid MultipleBagFetchException:
         * <ol>
         * <li>{@code findAllWithProjectAndSite} – shallow PO list for stats,
         * budget overview, and the recent-PO/recent-delivery feeds.</li>
         * <li>{@code findAllWithItemsAndDeliveries} – POs with items + delivery
         * items, used only for alert computation.</li>
         * </ol>
         *
         * @param email the authenticated accountant's email
         * @return fully populated {@link AccountantDashboardDTO}
         */
        @Transactional(readOnly = true)
        public AccountantDashboardDTO getAccountantDashboard(String email) {

                // ── 1. Load data ─────────────────────────────────────────────────────────
                List<PurchaseOrder> allPOs = purchaseOrderRepository.findAllWithProjectAndSite();
                List<Request> allRequests = requestRepository.findAll();

                // ── 2. Procurement stats ─────────────────────────────────────────────────
                int openCount = (int) allPOs.stream()
                                .filter(po -> po.getStatus() == PurchaseOrderStatus.OPEN).count();
                int partialCount = (int) allPOs.stream()
                                .filter(po -> po.getStatus() == PurchaseOrderStatus.PARTIALLY_DELIVERED).count();
                int deliveredCount = (int) allPOs.stream()
                                .filter(po -> po.getStatus() == PurchaseOrderStatus.DELIVERED
                                                || po.getStatus() == PurchaseOrderStatus.CLOSED)
                                .count();

                BigDecimal totalCommitted = allPOs.stream()
                                .map(po -> po.getTotalValue() != null ? po.getTotalValue() : BigDecimal.ZERO)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal openValue = allPOs.stream()
                                .filter(po -> po.getStatus() == PurchaseOrderStatus.OPEN)
                                .map(po -> po.getTotalValue() != null ? po.getTotalValue() : BigDecimal.ZERO)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                int approvedRequests = (int) allRequests.stream()
                                .filter(r -> r.getStatus() == RequestStatus.APPROVED).count();

                ProcurementStats stats = ProcurementStats.builder()
                                .approvedRequestsCount(approvedRequests)
                                .totalPOsCount(allPOs.size())
                                .openPOsCount(openCount)
                                .partiallyDeliveredCount(partialCount)
                                .deliveredCount(deliveredCount)
                                .totalCommittedValue(totalCommitted)
                                .openPOsValue(openValue)
                                .build();

                // ── 3. Budget overview (group by project) ────────────────────────────────
                Map<Long, List<PurchaseOrder>> posByProject = allPOs.stream()
                                .filter(po -> po.getProject() != null)
                                .collect(Collectors.groupingBy(po -> po.getProject().getId()));

                List<ProjectBudgetSummary> budgetOverview = new ArrayList<>();
                for (Map.Entry<Long, List<PurchaseOrder>> entry : posByProject.entrySet()) {
                        Project project = entry.getValue().get(0).getProject();
                        BigDecimal committed = entry.getValue().stream()
                                        .map(po -> po.getTotalValue() != null ? po.getTotalValue() : BigDecimal.ZERO)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                        BigDecimal budget = project.getBudgetTotal();
                        BigDecimal utilPct = (budget != null && budget.compareTo(BigDecimal.ZERO) > 0)
                                        ? committed.divide(budget, 4, RoundingMode.HALF_UP)
                                                        .multiply(BigDecimal.valueOf(100))
                                                        .setScale(2, RoundingMode.HALF_UP)
                                        : BigDecimal.ZERO;

                        budgetOverview.add(ProjectBudgetSummary.builder()
                                        .projectId(project.getId())
                                        .projectName(project.getName())
                                        .currency(project.getCurrency() != null ? project.getCurrency() : "TZS")
                                        .budgetTotal(budget != null ? budget : BigDecimal.ZERO)
                                        .committedAmount(committed)
                                        .utilizationPct(utilPct)
                                        .build());
                }
                budgetOverview.sort(Comparator.comparing(ProjectBudgetSummary::getProjectName));

                // ── 4. Recent POs (5 newest) ─────────────────────────────────────────────
                List<RecentPOSummary> recentPOs = allPOs.stream()
                                .limit(5) // already sorted DESC by createdAt
                                .map(po -> RecentPOSummary.builder()
                                                .id(po.getId())
                                                .poNumber(po.getPoNumber())
                                                .projectName(po.getProject() != null ? po.getProject().getName() : null)
                                                .siteName(po.getSite() != null ? po.getSite().getName() : null)
                                                .vendorName(po.getVendorName())
                                                .status(po.getStatus().name())
                                                .totalValue(po.getTotalValue())
                                                .createdAt(po.getCreatedAt())
                                                .updatedAt(po.getUpdatedAt())
                                                .build())
                                .collect(Collectors.toList());

                // ── 5. Recent approved requests (5 most recently updated approved) ─────────
                List<RecentRequestSummary> recentApprovedRequests = allRequests.stream()
                                .filter(r -> r.getStatus() == RequestStatus.APPROVED)
                                .sorted(Comparator.comparing(Request::getUpdatedAt,
                                                Comparator.nullsLast(Comparator.reverseOrder())))
                                .limit(5)
                                .map(r -> RecentRequestSummary.builder()
                                                .id(r.getId())
                                                .projectName(r.getProject() != null ? r.getProject().getName() : null)
                                                .siteName(r.getSite() != null ? r.getSite().getName() : null)
                                                .createdByName(r.getCreatedBy() != null ? r.getCreatedBy().getName()
                                                                : null)
                                                .title(r.getTitle())
                                                .updatedAt(r.getUpdatedAt())
                                                .build())
                                .collect(Collectors.toList());

                // ── 6. Monthly spend (last 6 months) ─────────────────────────────────────
                List<MonthlySpend> monthlySpend = buildMonthlySpend(allPOs);

                // ── 7. Alerts ─────────────────────────────────────────────────────────────
                List<DashboardAlert> alerts = buildAlerts(allPOs, allRequests);

                return AccountantDashboardDTO.builder()
                                .stats(stats)
                                .budgetOverview(budgetOverview)
                                .recentPOs(recentPOs)
                                .recentApprovedRequests(recentApprovedRequests)
                                .monthlySpend(monthlySpend)
                                .alerts(alerts)
                                .build();
        }

        // ── Private helpers
        // ───────────────────────────────────────────────────────────

        /**
         * Build last-6-months spend summary from PO creation dates.
         * "committed" = POs created in that month.
         * "delivered" = POs that reached DELIVERED/CLOSED and whose updatedAt falls in
         * that month.
         */
        private List<MonthlySpend> buildMonthlySpend(List<PurchaseOrder> allPOs) {
                DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("yyyy-MM");
                LocalDateTime now = LocalDateTime.now();
                List<MonthlySpend> result = new ArrayList<>();

                for (int i = 5; i >= 0; i--) {
                        LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1)
                                        .withHour(0).withMinute(0).withSecond(0).withNano(0);
                        LocalDateTime monthEnd = monthStart.plusMonths(1);
                        String label = monthStart.format(monthFmt);

                        BigDecimal committed = allPOs.stream()
                                        .filter(po -> po.getCreatedAt() != null
                                                        && !po.getCreatedAt().isBefore(monthStart)
                                                        && po.getCreatedAt().isBefore(monthEnd))
                                        .map(po -> po.getTotalValue() != null ? po.getTotalValue() : BigDecimal.ZERO)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                        BigDecimal delivered = allPOs.stream()
                                        .filter(po -> (po.getStatus() == PurchaseOrderStatus.DELIVERED
                                                        || po.getStatus() == PurchaseOrderStatus.CLOSED)
                                                        && po.getUpdatedAt() != null
                                                        && !po.getUpdatedAt().isBefore(monthStart)
                                                        && po.getUpdatedAt().isBefore(monthEnd))
                                        .map(po -> po.getTotalValue() != null ? po.getTotalValue() : BigDecimal.ZERO)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                        result.add(MonthlySpend.builder()
                                        .month(label)
                                        .committed(committed)
                                        .delivered(delivered)
                                        .build());
                }
                return result;
        }

        /**
         * Compute financial risk alerts from PO item delivery data and request data.
         * Uses a separate query (findAllWithItemsAndDeliveries) to load deep item
         * graph.
         */
        private List<DashboardAlert> buildAlerts(List<PurchaseOrder> shallowPOs, List<Request> allRequests) {
                List<DashboardAlert> alerts = new ArrayList<>();

                // Load deep PO item graph for over-delivery checks
                List<PurchaseOrder> deepPOs = purchaseOrderRepository.findAllWithItemsAndDeliveries();

                for (PurchaseOrder po : deepPOs) {
                        if (po.getItems() == null)
                                continue;
                        for (PurchaseOrderItem item : po.getItems()) {
                                BigDecimal totalDelivered = item.getTotalDelivered();
                                if (totalDelivered.compareTo(BigDecimal.ZERO) == 0)
                                        continue;

                                if (totalDelivered.compareTo(item.getOrderedQty()) > 0) {
                                        alerts.add(DashboardAlert.builder()
                                                        .type("OVER_DELIVERED")
                                                        .severity("danger")
                                                        .title("Over-Delivered Item")
                                                        .message(String.format(
                                                                        "'%s' on %s: delivered %.2f but ordered %.2f",
                                                                        item.getMaterialDisplayName(),
                                                                        po.getPoNumber(),
                                                                        totalDelivered,
                                                                        item.getOrderedQty()))
                                                        .referenceId(po.getId())
                                                        .build());
                                }
                        }
                }

                // Budget threshold alerts (≥ 80% utilization)
                Map<Long, BigDecimal> committedByProject = shallowPOs.stream()
                                .filter(po -> po.getProject() != null && po.getTotalValue() != null)
                                .collect(Collectors.groupingBy(
                                                po -> po.getProject().getId(),
                                                Collectors.reducing(BigDecimal.ZERO,
                                                                PurchaseOrder::getTotalValue,
                                                                BigDecimal::add)));

                for (Map.Entry<Long, BigDecimal> entry : committedByProject.entrySet()) {
                        PurchaseOrder sample = shallowPOs.stream()
                                        .filter(po -> po.getProject() != null
                                                        && po.getProject().getId().equals(entry.getKey()))
                                        .findFirst().orElse(null);
                        if (sample == null || sample.getProject().getBudgetTotal() == null)
                                continue;

                        BigDecimal budget = sample.getProject().getBudgetTotal();
                        BigDecimal committed = entry.getValue();
                        if (budget.compareTo(BigDecimal.ZERO) == 0)
                                continue;

                        BigDecimal pct = committed.divide(budget, 4, RoundingMode.HALF_UP)
                                        .multiply(BigDecimal.valueOf(100));
                        if (pct.compareTo(BigDecimal.valueOf(80)) >= 0) {
                                alerts.add(DashboardAlert.builder()
                                                .type("BUDGET_THRESHOLD")
                                                .severity(pct.compareTo(BigDecimal.valueOf(100)) >= 0 ? "danger"
                                                                : "warning")
                                                .title("Budget Threshold Exceeded")
                                                .message(String.format(
                                                                "'%s' has committed %.1f%% of its budget",
                                                                sample.getProject().getName(), pct))
                                                .referenceId(sample.getProject().getId())
                                                .build());
                        }
                }

                // Unordered approved requests
                Set<Long> orderedRequestIds = new HashSet<>(purchaseOrderRepository.findAllRequestIds());
                long unorderedApproved = allRequests.stream()
                                .filter(r -> r.getStatus() == RequestStatus.APPROVED
                                                && !orderedRequestIds.contains(r.getId()))
                                .count();
                if (unorderedApproved > 0) {
                        alerts.add(DashboardAlert.builder()
                                        .type("UNDER_ORDERED")
                                        .severity("warning")
                                        .title("Approved Requests Awaiting PO")
                                        .message(unorderedApproved + " approved request(s) have not been ordered yet")
                                        .referenceId(null)
                                        .build());
                }

                return alerts;
        }

}
