# Release Plan (Phased)

## Phase 1 — Foundations
- Monorepo setup, CI.
- DB migrations baseline (users, roles, projects, sites, materials, units, BOQ, requests, approvals, suppliers, POs, deliveries, inventory, invoices, budgets, audit_logs).
- Auth with JWT + RBAC; roles including Storekeeper and optional Supplier.
- Material catalog with flexible units; BOQ upload; duplicate detection service.

## Phase 2 — Core Workflows
- Request creation (stage/BOQ linkage, emergency flag, duplicate alerts).
- Approval thresholds by amount; multi-level routing; notifications.
- PO generation (PDF), WhatsApp share link; supplier performance fields.
- Delivery capture with photo + GPS + partials; storekeeper sign-off.
- Inventory movements and threshold alerts.

## Phase 3 — Finance & Visibility
- Budget vs actual dashboards; spend by site/material; currency TZS/USD with stored fx_rate.
- Invoice capture with VAT/EFD attachment; PO→Invoice matching.
- Exports to Excel/PDF for finance.

## Phase 4 — Offline & Reliability
- Offline queues for requests/deliveries; background sync with backoff.
- Low-bandwidth optimizations; local caching of catalog/BOQ.

## Phase 5 — Audit & Compliance
- Immutable audit coverage; access logs; data retention guidance.
- Tender compliance: BOQ limits, work-package tagging, reports.

## Phase 6 — Polish & Adoption
- UX refinements for mobile; WhatsApp deep links; analytics on cycle times.
- Playbooks and SOPs per role; rollout and training materials.

## Success Metrics (examples)
- Approval cycle time reduction (baseline vs target).
- Duplicate request incidents per month.
- % deliveries with photo+GPS proof.
- Budget variance per project.
- Offline submission success rate.

