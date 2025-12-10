# MVP Release Plan (Phased with Milestones & Metrics)

## Phase 1 — Core Request Loop
- Deliverables: MVP roles (Engineer, Project Manager, Accountant), request creation with planned usage window, approval/reject loop, early-reorder guard (block + alert), delivery status (delivered/partial/not delivered), basic budget tracking.
- Milestones: End-to-end happy path in staging; alerts firing on early reorder; budget updates on delivery.
- Metrics: Request→approval cycle time; % requests blocked by early-reorder guard; budget variance per request.

## Phase 2 — Evidence & Visibility
- Deliverables: Photo/GPS on delivery, simple PO/PDF share, notifications (email/WhatsApp link) to Manager/Accountant on approvals and blocks, exports (CSV/Excel) for budgets.
- Milestones: Delivery proof captured; shareable PO; exports downloadable.
- Metrics: % deliveries with photo proof; average notification-to-action time; export usage count.

## Phase 3 — Reliability & Offline
- Deliverables: Offline queue for requests/deliveries, retry/backoff, conflict prompts, lightweight payloads for poor connectivity (road sites).
- Milestones: Offline submission succeeds after reconnect in test; conflict resolution UX verified.
- Metrics: Offline submission success rate; retry counts; median sync time after reconnect.

## Phase 4 — Compliance & Refinement
- Deliverables: VAT/EFD attachment on expenses, multi-currency (TZS/USD) fields, BOQ linkage (basic), tuning of early-reorder thresholds by material type, analytics on cycle times.
- Milestones: VAT/EFD stored; FX captured; BOQ link prevents overage; dashboard shows cycle time.
- Metrics: % invoices matched to requests; overage incidents; cycle-time trend.

