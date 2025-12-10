# Tanzania-Specific Context

## Local Units & Ordering Patterns
- Units: bags, bundles, trips, lorry loads (“Fuso ya mchanga”), tons (aggregates), drums (bitumen/asphalt), pieces (culverts, guardrails), meters.
- Support custom units per material; allow conversion metadata where applicable.
- Materials often requested by stage (foundation, slab, roofing, finishing) and for road sections (subgrade, subbase, base, asphalt layers, drainage).

## Communication Norms
- WhatsApp is primary: share POs (PDF/link), approvals, delivery photos.
- Phone/SMS fallback when data is poor.

## Connectivity Constraints
- Many sites have spotty internet: offline capture + sync queue is essential.
- Keep payloads small; allow compressed image uploads; graceful retry.

## Compliance & Finance
- VAT handling and EFD receipt attachments on invoices.
- Multi-currency: TZS primary, USD quotes common; store fx_rate on records.
- Exports to Excel/PDF for accountants.

## Tender / BOQ Alignment
- BOQ Excel upload; link requests to BOQ items to avoid overage.
- Work-package tagging for reporting by tender scope (building and road sections/chainages).

## Anti-Fraud & Accountability
- Photo + GPS proof on deliveries.
- Storekeeper sign-off.
- Immutable audit logs with actor and geolocation where available.

## Threshold Approvals & Early Reorders
- Amount-based routing (e.g., <500k TSh single approval; >5M TSh multi-level).
- Emergency flag to escalate when project manager is remote.
- Early-reorder guard: if materials are re-requested before declared usage window ends, block pending justification and alert manager + accountant.

