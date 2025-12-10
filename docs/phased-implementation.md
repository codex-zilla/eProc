# Phased Implementation Plan (Backend + Frontend + Tests)

**Tech stack:** Java 21, Spring Boot 3.5.7, Spring Security (JWT), Spring Data JPA, PostgreSQL 18+, Flyway/Liquibase; React 19 + TypeScript + React Router + Axios + Tailwind/MUI; object storage for uploads.

**Constraint:** Do **NOT** use Docker/Containers for development or testing in Phases 0-8. All services (DB, Backend, Frontend) must run directly on the host machine or via standard process managers during these phases.

## Phase 0 (Week 1) — Foundations (No Containers)

### Backend (Spring Boot)

- [X] **Project Initialization**: Create standard Maven/Gradle Spring Boot project.
- [X] **Database Setup**: Install PostgreSQL locally. Create `eproc_db` and `eproc_user`. Configure `application.yml` to connect to `localhost:5432`.
- [X] **Migration Setup**: Initialize Flyway/Liquibase. Create `V1__init_schema.sql` for user/role tables.
- [X] **Security Skeleton**: Add Spring Security dependency. Create a `SecurityConfig` allowing public access to `/api/health` and `/api/auth/**`.
- [ ] **Logging**: Configure Logback for file and console output.

### Frontend (React)

- [X] **Scaffold**: Initialize Vite + React + TypeScript project.
- [X] **Styling**: Install and configure Tailwind CSS.
- [X] **API Client**: Set up Axios instance with base URL from `.env` (default `http://localhost:8080`).
- [ ] **Routing**: Set up React Router with a basic `AppLayout` and `AuthLayout`.

### Tests

- [X] **Backend**: Write a simple `@SpringBootTest` that asserts the context loads and the health endpoint returns 200.
- [ ] **Frontend**: Write a Vitest test checking if the App component renders "Hello World".

**Deliverable**: A running backend connected to a local Postgres DB and a React frontend that can talk to the backend health endpoint.

---

## Phase 1 (Week 2) — Auth & Roles (No Containers)

### Backend

- [ ] **User Entity**: Implement `User` class (id, email, password_hash, role).
- [ ] **Role Enum**: Define values: `ENGINEER`, `PROJECT_MANAGER`, `ACCOUNTANT`.
- [ ] **Auth Service**: Implement `register(dto)` and `login(dto)` returning JWTs.
- [ ] **JWT Filter**: Create a filter to intercept requests, validate Token, and set `SecurityContext`.
- [ ] **Role Guards**: Add `@PreAuthorize` annotations to test endpoints.

### Frontend

- [ ] **Login Page**: Create form with Email/Password. Handle 401 errors.
- [ ] **Context**: Create `AuthContext` to store JWT in `localStorage` and user state in memory.
- [ ] **Protected Route**: logical component that redirects to `/login` if no token exists.
- [ ] **Role Redirects**: Engineer goes to `/site-dashboard`, Boss to `/approvals`, Accountant to `/procurement`.

### Tests

- [ ] **Backend**: Integ test for User Registration (success/fail). Unit test for JWT generation/parsing.
- [ ] **Frontend**: E2E (Playwright/Cypress) flow: Login -> store token -> navigate to dashboard.

**Deliverable**: Users can sign up and log in. Unauthenticated users cannot access protected routes.

---

## Phase 2 (Weeks 3-4) — Projects, Catalog & Manual Materials (No Containers)

### Backend

- [ ] **Schema Expansion**: Add `projects`, `sites`, `work_packages`.
- [ ] **Materials Logic**:
  - Create `Material` entity (for standard catalog).
  - **Crucial**: Ensure `MaterialRequest` entity supports _either_ a `material_id` _or_ a `manual_material_name` text field.
- [ ] **CRUD APIs**: Endpoints to list/add Projects and Sites.
- [ ] **Validation**: Ensure Manual requests require a unit and name.

### Frontend

- [ ] **Dashboards**: Create simple list views for Projects/Sites.
- [ ] **Material Picker Component**: A combobox that lists standard materials but allows "Create 'X'" (manual entry) if not found.
- [ ] **Form Logic**: If manual entry, show extra fields (e.g., "Estimated Unit Price" optional).

### Tests

- [ ] **Backend**: Test creating a request with a standard material vs. a manual material name.
- [ ] **Frontend**: Test usage of the custom material picker; verify manual entry state is captured.

**Deliverable**: Engineers can see projects and are ready to make requests with flexible material inputs.

---

## Phase 3 (Weeks 5-6) — Requests & Rejection Loop (No Containers)

### Backend

- [ ] **Request API**: `POST /api/requests`. Handle `planned_usage_window`.
- [ ] **Duplicate Check**: Logic to query recent requests by `site_id` + (`material_id` OR `manual_material_name`).
- [ ] **Approval API**: `PATCH /api/requests/{id}/status`.
  - Status: `PENDING` -> `APPROVED` | `REJECTED`.
  - If `REJECTED`, require `comment`.
- [ ] **Edit API**: Allow Engineers to `PUT` updates to `REJECTED` requests to reset status to `PENDING`.

### Frontend

- [ ] **Request Wizard**: Step-by-step form: Site -> Material -> Quantity/Window -> Summary.
- [ ] **Approval Queue**: View for Boss showing "Pending Requests". Compact cards with "Approve" (Green) / "Reject" (Red) buttons.
- [ ] **Rejection Handling**: Engineer view highlights rejected items. Clicking opens edit form pre-filled with previous data + rejection comment.

### Tests

- [ ] **Backend**: full lifecycle test: Create -> Reject -> Update -> Approve.
- [ ] **Frontend**: visual test of Rejection red-state and resubmission flow.

**Deliverable**: Full loop of requesting, rejecting, fixing, and approving.

---

## Phase 4 (Weeks 7-8) — Procurement & Delivery (MVP) (No Containers)

### Backend

- [ ] **PO Generation**: Endpoint to group `APPROVED` requests into a simple text/PDF summary for WhatsApp.
- [ ] **Delivery API**: `POST /api/deliveries`. Link to `Request` or `PO`.
  - Inputs: `delivered_qty`, `photo_url` (mocked for now), `status`.
- [ ] **Status Sync**: Updating delivery should update the original Request status to `DELIVERED` or `PARTIALLY_DELIVERED`.

### Frontend

- [ ] **Accountant View**: "Approved Items" list. Multi-select to "Mark as Ordered".
- [ ] **Delivery Modal**: Simple form for Engineer/Accountant to input what actually arrived.
- [ ] **Progress Bars**: Visual indicator of `Requested` vs `Delivered`.

### Tests

- [ ] **Backend**: Assert inventory/request status changes accurately upon delivery.
- [ ] **Frontend**: E2E flow from "Approved" in Accountant view -> "Delivered" in Engineer view.

**Deliverable**: Physical world tracking (Ordering & Receiving).

---

## Phase 5 (Weeks 9-10) — Inventory, Finance & Audit (No Containers)

### Backend

- [ ] **Inventory Calculation**: Virtual view summing `Deliveries` - `UsageLogs` (if added).
- [ ] **Budget Tracking**: Sum `Approved` requests \* `Unit Price`. Alert if > `Project Budget`.
- [ ] **Audit Logs**: AOP or Event Listener to log every state change to `audit_logs` table.

### Frontend

- [ ] **Budget Widget**: simple pie chart or progress bar on Project Detail.
- [ ] **Audit History**: "View History" button on Requests showing who approved/rejected and when.

### Tests

- [ ] **Backend**: Verify Verify budget caps prevent or warn on new requests.
- [ ] **Frontend**: Verify audit trail renders correct timestamps and user names.

**Deliverable**: Financial controls and accountability trails.

---

## Phase 6 (Weeks 11) — Offline & Reliability (No Containers)

### Backend

- [ ] **Idempotency**: Add `Idempotency-Key` header check to critical POST endpoints to prevent double-submit on bad networks.

### Frontend

- [ ] **Service Worker**: (Optional for MVP, maybe just `localForage`).
- [ ] **Queue System**: Redux/Context store for "Pending Sync".
  - If offline, save request to generic queue.
  - Background loop tries to flush queue when online.
- [ ] **Conflict UI**: "This item changed while you were offline" modal.

**Deliverable**: robust usage in spotty Tanzania internet conditions.

---

## Phase 7 (Week 12) — Containerization & Pre-Deployment

**Objective**: Now we introduce Docker to package the application for production.

### Tasks

- [ ] **Dockerfile (Backend)**: Create multi-stage build (Maven Build -> JRE Run).
- [ ] **Dockerfile (Frontend)**: Build React -> Nginx/Caddy static host.
- [ ] **Docker Compose**: create `docker-compose.yml` that spins up:
  - `postgres` (with volume mount)
  - `backend` service
  - `frontend` service
- [ ] **Integration Testing**: Run the full E2E test suite against the Dockerized environment.
- [ ] **CI/CD Pipeline**: Update GitHub Actions/GitLab CI to build and push these images to registry.

**Deliverable**: Production-ready Docker images and a `compose` file that replicates the production environment.

---

## Phase 8 (Week 13) — Pilot Deployment

- [ ] **Infrastructure**: Provision VPS (Ubuntu) or Cloud (AWS/DigitalOcean).
- [ ] **Deploy**: secure copy `docker-compose.prod.yml` and `.env`. Pull images. `docker compose up -d`.
- [ ] **Domain/SSL**: Configure reverse proxy (Nginx/Traefik) with LetsEncrypt.
- [ ] **Training**: Onboard first batch of Engineers/Managers.

**Deliverable**: Live URL, real users.
