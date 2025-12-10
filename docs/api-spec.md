# API Specification (Outline)

## Auth
- `POST /api/auth/register` — create user (role assignment by admin).
- `POST /api/auth/login` — returns JWT access token.
- `POST /api/auth/refresh` — optional refresh flow (future).
- Headers: `Authorization: Bearer <token>`.
- Errors: 400 validation, 401 invalid credentials, 403 role denied.

## Materials & BOQ
- `GET /api/materials` — list catalog (supports units like bags, bundles, trips).
- `POST /api/materials` — create material (admin/procurement).
- `GET /api/boq` — list BOQ items; filters by project/site/stage.
- `POST /api/boq/upload` — upload Excel BOQ (multipart).

## Requests
- `POST /api/requests` — create request (site, stage, BOQ item link, quantity, unit, emergency flag).
- `GET /api/requests` — list; filters by site, status, stage, createdBy; pagination.
- `GET /api/requests/{id}` — details incl. audit trail snippet.
- `PUT /api/requests/{id}` — modify prior to approval.
- Duplicate prevention: server checks recent similar requests (site+material+stage+window).

## Approvals
- `POST /api/approvals` — approve/reject/modify with amount threshold logic.
- `GET /api/approvals/pending` — queue by role and threshold.
- `GET /api/approvals/history` — audit of actions with actors.

## Suppliers & POs
- `GET /api/suppliers` / `POST /api/suppliers` — CRUD.
- `POST /api/suppliers/{id}/purchase-orders` — generate PO from approved request(s); returns PDF link.
- `GET /api/purchase-orders/{id}` — view PO (optional supplier portal).

## Deliveries
- `POST /api/deliveries` — record delivery (quantities, partials, photo, GPS, storekeeper sign-off).
- `PUT /api/deliveries/{id}/confirm` — confirm/adjust by storekeeper/manager.
- `GET /api/deliveries` — list with status filters.

## Inventory
- `GET /api/inventory/site/{siteId}` — current stock.
- `POST /api/inventory/usage` — log consumption.
- `GET /api/inventory/alerts` — threshold/forecast alerts.

## Finance
- `POST /api/invoices` — upload invoice (VAT, EFD attachment, currency TZS/USD, FX rate).
- `GET /api/finance/reports` — budget vs actual, spend by site/material.
- `GET /api/finance/exports` — Excel/PDF exports.

## Audit
- `GET /api/audit` — filtered audit logs (action, actor, resource, timestamp, IP/GPS where available).

## Error Format (example)
```json
{ "error": "validation_error", "message": "quantity required", "fields": { "quantity": "required" } }
```

## Pagination & Filtering
- Query: `?page=0&size=20&sort=createdAt,desc`.
- Filters: role-appropriate; validate to prevent abuse.

## Security Notes
- JWT validation on all endpoints; role guards per route.
- Rate limit login and upload.
- File uploads scanned/size-limited; store to object storage; signed URLs for access.

