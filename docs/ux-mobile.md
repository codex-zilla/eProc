# UX Guidelines (Mobile-First)

## Principles
- Prioritize small screens; big tap targets; minimal typing.
- Offline-friendly: forms work offline, with clear queued/synced states.
- Low-bandwidth: cache catalogs/BOQ, defer image uploads until online.

## Key Patterns
- Home dashboard by role; show pending actions (approvals, deliveries).
- Request form: staged steps (site → stage → BOQ → material → quantity/unit → notes).
- Duplicate warning banner if similar recent request exists.
- Emergency toggle prominent with warning text.
- Approval screen: one-glance summary (amount, site, stage, BOQ, history).
- Delivery capture: camera-first flow, GPS permission prompt, partial delivery toggle, signature/name capture for storekeeper.
- Inventory: simple cards with threshold alerts and forecast badges.
- Finance: export buttons (Excel/PDF) prominent; filter by site/date/material.

## Media & Uploads
- Compress images client-side; show size; retry on failure.
- Signed URLs for viewing; expire links for security.

## WhatsApp Sharing
- “Share via WhatsApp” buttons on POs and approvals; uses PDF/link with short summary text.

## Accessibility & Language
- Clear labels; avoid jargon; allow concise Kiswahili hints where helpful.
- High contrast; avoid color-only status indicators.

## Error & Sync States
- Inline validation; toast for success; persistent banner for offline/unsynced items.
- Retry controls; conflict resolution prompts when server state changed.

