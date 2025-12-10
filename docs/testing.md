# Testing Strategy

## Levels
- Unit: services, validators (duplicate detection, thresholds).
- Integration: REST endpoints with DB + storage mocks.
- E2E: happy-path workflows (request→approval→PO→delivery→invoice), offline sync flows.
- Performance: load on approvals list, sync queue, file uploads.
- Security: auth bypass attempts, role escalation, upload sanitization.

## Test Data
- Seed users per role; sample projects/sites; materials with local units; BOQ items; thresholds.

## Offline & Sync Tests
- Queue actions offline, simulate reconnect, assert idempotent processing.
- Conflict cases: server state changed; client prompted to review.

## Media Handling
- Verify size/MIME validation; signed URL access; expired link behavior.

## Exports
- Validate Excel/PDF generation for finance reports.

## Automation
- CI runs unit/integration; E2E nightly or per release candidate.

## Acceptance Criteria (examples)
- Duplicate request warning shown and server rejects duplicates within window.
- Emergency request routes to highest approver.
- Delivery requires storekeeper sign-off and captures photo+GPS when permitted.
- BOQ overage blocked unless override with audit entry.

