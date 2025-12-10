# Security & Audit

## Auth & Session

- JWT access tokens; short-lived; signed with strong key.
- Optional refresh tokens (httpOnly if adopted later).
- Enforce HTTPS; CORS locked to known origins.

## RBAC

- Roles: ENGINEER, STOREKEEPER, SITE_MANAGER, PROJECT_MANAGER, PROCUREMENT, ACCOUNTANT, SUPPLIER (optional).
- Route-level guards; service-level checks; deny by default.
- Approval threshold checks server-side.

## Data Protection

- Validate all inputs; size limits on uploads; MIME checking.
- Store media in object storage with signed URLs and short expiry.
- PII minimization; log redaction for tokens/passwords.

## Audit Trail

- Immutable `audit_logs` with actor, action, entity, before/after, timestamp, IP, GPS (when available).
- Log significant events: auth, requests, approvals, PO issue, delivery confirmation, invoice changes.

## Fraud Controls

- Duplicate request detection.
- GPS + photo proof on delivery; storekeeper sign-off required.
- BOQ overage prevention; approval thresholds.

## Secrets & Config

- Environment variables for keys/DB; no secrets in repo.
- Key rotation procedure documented; separate keys per environment.

## Availability & Abuse

- Rate-limit auth and upload endpoints.
- Backpressure and timeouts on external calls (storage, email/WhatsApp gateway).
- Backups and restore drills for DB and object storage metadata.

## Compliance with Tanzania eGA Standards

To adhere to the _e-Government Authority (eGA)_ mandates (e.g., e-Government Act No. 10 of 2019):

1.  **Security Architecture (eGA/EXT/ISA/001)**:

    - _Requirement_: Implement defense-in-depth.
    - _Implementation_: We use WAF, API Gateway, and Service-level RBAC.
    - _Data Residency_: All data hosted within Tanzania (Government Data Centers or approved local cloud providers).

2.  **Application Security (eGA/EXT/APA/005)**:

    - _Requirement_: Secure SDLC and vulnerability management.
    - _Implementation_: CI/CD pipeline includes SAST (Static Application Security Testing) and dependency scanning.
    - _Audit_: Full audit trails for all transaction lifecycles as required for public procurement.

3.  **ICT Policy (eGA/EXT/APA/008)**:
    - _Requirement_: Access control and password policies.
    - _Implementation_: Enforced strong password policies, MFA for admin roles, and quarterly access reviews.
