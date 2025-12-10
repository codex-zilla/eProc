# Construction Material Management System (CMMS-TZ) Documentation

This repository contains documentation for a Tanzania-focused Construction Material Management System. The documentation covers architecture, APIs, data model, workflows, local context, UX, security, DevOps, testing, and phased delivery.

## Contents

- `docs/architecture.md` — system architecture, components, roles, and data flows (building + road projects).
- `docs/api-spec.md` — REST API contracts, auth model, and error patterns.
- `docs/data-model.md` — entities, relationships, and key constraints.
- `docs/workflows.md` — role-based workflows, approvals, and offline sync behavior.
- `docs/tanzania-context.md` — local units, compliance, WhatsApp sharing, tax, currency.
- `docs/ux-mobile.md` — mobile-first patterns, offline UX, media capture, low bandwidth.
- `docs/security-audit.md` — RBAC, JWT lifecycle, audit coverage, data handling.
- `docs/devops.md` — environments, configuration, migrations, CI, backups, observability.
- `docs/testing.md` — testing strategy across unit/integration/e2e/performance/security.
- `docs/release-plan.md` — phased implementation roadmap and success metrics.
- `docs/mvp/` — MVP-specific scope, workflows, and phased plan.

### Quick Start (docs)

1) Review `docs/architecture.md` for the overall system shape.
2) Consult `docs/data-model.md` alongside `docs/api-spec.md` for domain and API details.
3) Follow `docs/workflows.md` to understand role journeys and approval logic.
4) See `docs/release-plan.md` to track delivery phases and priorities.

### Roles (documented across files)

- Engineer, Storekeeper, Site Manager/Supervisor, Project Manager, Procurement, Accountant/Finance, Supplier (optional portal).
