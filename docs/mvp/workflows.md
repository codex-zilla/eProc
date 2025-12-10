# MVP Workflows

## Roles
- Engineer/Technician (site)
- Project Manager/Boss
- Accountant (procurement + handover)

## Request → Approval → Delivery (Happy Path)
1) Engineer creates request with:
   - Site/road section or work package
   - Material, quantity, unit (bags, tons, drums, culverts, trips)
   - Planned usage window (start/end or duration)
   - Optional notes/emergency flag
2) Project Manager reviews and approves.
3) Accountant procures and hands over materials to site.
4) Engineer records delivery status: delivered / partially delivered / not delivered, with quantities and optional photo/GPS.
5) Budgets updated; audit logged.

## Rejection Loop
- If Project Manager rejects, engineer edits and resubmits.

## Early-Reorder Guard
- If engineer re-requests same material before planned usage window ends AND previously delivered quantity covers the window, system blocks submission, raises alerts to Project Manager + Accountant, and requires manager confirmation to proceed.

## Budget Tracking
- Accountant tracks spend vs budget per site/section/material; alerts on overspend.

## Offline Behavior
- Requests and delivery confirmations queue offline; sync when online; conflicts prompt user.

