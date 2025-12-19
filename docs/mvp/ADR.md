# Architectural Decisions Review

**eProc – Construction Material Request System**

---

## 1. Problem Statement (Original Issue)

During Phase 2 testing, the system exhibited the following behavior:

* Any engineer could see all projects
* Any project manager (boss) could see all requests
* Engineers correctly saw only their own requests

This behavior is  **not suitable for a real-world construction environment** , where:

* Multiple independent bosses manage different projects
* Engineers are assigned to specific projects
* Data visibility must be restricted by ownership and assignment

---

## 2. Key Architectural Goal

> Ensure **strict project-scoped access control** such that:
>
> * Data is visible only to authorized users
> * Ownership and responsibility are clearly enforced
> * The system mirrors real construction workflows

---

## 3. Core Design Principle Adopted

### ✅ Project-Centric Authorization

All access decisions in the system are  **scoped to a project** .

> Roles alone (`ENGINEER`, `BOSS`) are insufficient.
>
> **Context (project ownership and assignment) is mandatory.**

---

## 4. Project Scope Model (Final Decision)

### Constraints Adopted

* One project has **exactly one boss**
* One project has **exactly one engineer**
* A boss may own **multiple projects**
* An engineer may work on **only one active project at a time**

This reflects:

* Accountability clarity
* Realistic construction site management
* Simplified authorization logic

---

## 5. Entity Relationship Overview

### User

<pre class="overflow-visible! px-0!" data-start="1889" data-end="1981"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="@w-xl/main:top-9 sticky top-[calc(--spacing(9)+var(--header-height))]"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-text"><span><span>User
- id
- name
- email
- password
- role (BOSS, ENGINEER, ACCOUNTANT)
- active
</span></span></code></div></div></pre>

### Project

<pre class="overflow-visible! px-0!" data-start="1995" data-end="2103"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="@w-xl/main:top-9 sticky top-[calc(--spacing(9)+var(--header-height))]"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-text"><span><span>Project
- id
- name
- boss_id
- engineer_id
- status (ACTIVE, COMPLETED, CANCELLED)
- created_at
</span></span></code></div></div></pre>

### MaterialRequest

<pre class="overflow-visible! px-0!" data-start="2125" data-end="2256"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="@w-xl/main:top-9 sticky top-[calc(--spacing(9)+var(--header-height))]"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-text"><span><span>MaterialRequest
- id
- project_id
- engineer_id
- status (PENDING, APPROVED, REJECTED)
- rejection_comment
- created_at
</span></span></code></div></div></pre>

---

## 6. User Management Strategy

### Decision: **Engineers Self-Register (Option 2)** ✅

#### Rationale

* Engineers are independent professionals
* Bosses manage projects, not identities
* Avoids insecure password handling
* Scales to multiple companies and contractors
* Aligns with industry systems (ERP, Jira, GitHub)

---

## 7. User Lifecycle Rules

### Boss

* Self-registers
* Creates projects
* Assigns one engineer per project
* Creates accountant users (optional)
* Sees only projects and requests they own

### Engineer

* Self-registers
* Initially unassigned
* Can belong to **only one ACTIVE project**
* Can submit requests only for their assigned project
* Sees only:
  * Their project
  * Their requests

### Accountant

* Created by boss
* Read-only access (projects, requests, reports)
* Cannot create or approve requests

---

## 8. Engineer Assignment Policy

### Backend Rules (Strict)

* Engineer **cannot** be assigned to a new project if they are already assigned to an ACTIVE project
* Engineer becomes available again only when:
  * Current project is COMPLETED or CANCELLED

This rule is enforced:

* At service layer
* Not just in UI

---

## 9. Authorization Strategy

### Layered Authorization

#### 1️⃣ Role-Based Access Control (RBAC)

Controls *what actions a role can perform*

Examples:

* Only BOSS → create projects
* Only ENGINEER → create material requests

#### 2️⃣ Project-Based Authorization (Contextual)

Controls *which data a user can access*

Examples:

* Boss can approve requests **only for their projects**
* Engineer can create requests **only for their assigned project**

---

## 10. Authorization Enforcement (Examples)

### Engineer Creates Request

<pre class="overflow-visible! px-0!" data-start="3957" data-end="4064"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="@w-xl/main:top-9 sticky top-[calc(--spacing(9)+var(--header-height))]"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-text"><span><span>Allowed IF:
- user.role == ENGINEER
- project.engineer_id == user.id
- project.status == ACTIVE
</span></span></code></div></div></pre>

### Boss Views Requests

<pre class="overflow-visible! px-0!" data-start="4090" data-end="4162"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="@w-xl/main:top-9 sticky top-[calc(--spacing(9)+var(--header-height))]"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-text"><span><span>Allowed IF:
- user.role == BOSS
- project.boss_id == user.id
</span></span></code></div></div></pre>

### Boss Assigns Engineer

<pre class="overflow-visible! px-0!" data-start="4190" data-end="4295"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="@w-xl/main:top-9 sticky top-[calc(--spacing(9)+var(--header-height))]"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-text"><span><span>Allowed IF:
- user.role == BOSS
- project.boss_id == user.id
- engineer has no ACTIVE project
</span></span></code></div></div></pre>

---

## 11. Query Scoping (Critical Fix)

### Engineer Requests

<pre class="overflow-visible! px-0!" data-start="4361" data-end="4471"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="@w-xl/main:top-9 sticky top-[calc(--spacing(9)+var(--header-height))]"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-sql"><span><span>SELECT</span><span></span><span>*</span><span></span><span>FROM</span><span> material_requests
</span><span>WHERE</span><span> engineer_id </span><span>=</span><span> :currentUser
</span><span>AND</span><span> project_id </span><span>=</span><span> :assignedProject;
</span></span></code></div></div></pre>

### Boss Requests

<pre class="overflow-visible! px-0!" data-start="4491" data-end="4615"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="@w-xl/main:top-9 sticky top-[calc(--spacing(9)+var(--header-height))]"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-sql"><span><span>SELECT</span><span></span><span>*</span><span></span><span>FROM</span><span> material_requests
</span><span>WHERE</span><span> project_id </span><span>IN</span><span> (
  </span><span>SELECT</span><span> id </span><span>FROM</span><span> projects
  </span><span>WHERE</span><span> boss_id </span><span>=</span><span> :currentBoss
);
</span></span></code></div></div></pre>

---

## 12. Phase Plan Adjustment

### Phase 2 (Extended, Not Replaced)

Added:

* Project creation by boss
* Engineer assignment
* Project-scoped visibility enforcement

### Phase 3 (Unchanged)

* Approval / rejection loop
* Re-submission logic
* Comment tracking

This avoids architectural rework later.

---

## 13. Security Considerations

* Backend enforces all authorization rules
* Frontend only reflects permissions (not enforces them)
* Prevents:
  * Cross-project data leaks
  * Unauthorized approvals
  * Request spoofing

---

## 14. Why These Decisions Are Sound

✅ Real-world accurate

✅ Minimal but extensible schema

✅ Clear ownership boundaries

✅ Scales to multiple organizations

✅ Easy to refactor to multi-engineer projects later

✅ Defensible in academic evaluation

---

## 15. Future-Proofing Notes (Explicitly Deferred)

* Multiple engineers per project
* Delegated project managers
* Organization / company entity
* Temporary engineer assignment

These are intentionally **out of scope** for current phases.
