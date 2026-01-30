##Initial project improvement idea

> **Owner creates a project → assigns engineers → work & approvals flow inside the system**

then the **project entity** becomes the *contract + scope + control center*.

Below is a **clean, real-world project creation model** that works for **construction projects in Tanzania**, and also scales later if you add tenders.

---

# 1. Core Project Identification (Required)

These are **non-negotiable** fields.

### Project Basics

* **Project Name**
* **Project Code / Reference**

  * Auto-generated (e.g. PRJ-HTL-2026-001)
* **Project Type**

  * Construction / Renovation / Maintenance / Design-only
* **Industry**

  * Hotel / Residential / Commercial / Industrial

### Ownership

* **Project Owner / Client**

  * Individual or Company
* **Owner Representative**

  * Name, phone, email

---

# 2. Project Location & Site Info

Construction lives on the ground, not in theory.

* **Region**
* **District**
* **Ward**
* **Plot / Block number**
* **GPS coordinates** (optional but powerful)
* **Land ownership status**

  * Title deed available? (Yes/No)
* **Site access notes**

  * Roads, utilities, constraints

---

# 3. Project Description & Objectives

Short but intentional.

* **Project Overview**

  * What is being built
* **Key Objectives**

  * Cost efficiency
  * Speed
  * Quality
  * Compliance
* **Expected Output**

  * e.g. “40-room 3-star hotel with restaurant & parking”

---

# 4. Scope Definition (Very Important)

This replaces tender scope.

### Scope Mode

* ☐ Design only
* ☐ Construction only
* ☐ Design & Construction

### Scope Breakdown (Structured)

* Civil & Structural
* Electrical
* Mechanical (HVAC, plumbing)
* Fire safety
* External works
* Landscaping

Each scope item should have:

* Included? (Yes/No)
* Notes

---

# 5. Project Team Assignment

This is where CMMS shines.

### Required Roles

* **Lead Engineer**
* **Civil/Structural Engineer**
* **Electrical Engineer**
* **Mechanical Engineer**
* **Site Engineer**
* **Project Manager**

For each assigned person:

* Role
* Start date
* Responsibility level
* Reporting line

> ⚠️ Enforce **ERB registration** for engineers (Tanzania-specific validation)

---

# 6. Design & Documentation

This controls accountability.

* **Architectural drawings provided?** (Yes/No)
* **Who provides designs?**

  * Owner
  * Assigned engineer
* **Documents upload**

  * Drawings
  * BOQs
  * Soil report
  * Permits
* **Design approval workflow**

  * Draft → Review → Approved

---

# 7. Timeline & Milestones

Instead of tender timelines.

* **Project Start Date**
* **Expected Completion Date**
* **Project Duration (auto-calculated)**

### Milestones (Configurable)

* Design completion
* Foundation completion
* Superstructure completion
* Roofing
* MEP installation
* Practical completion
* Final handover

Each milestone:

* Owner
* Deadline
* Status
* Approval required? (Yes/No)

---

# 8. Budget & Financial Controls

Even without bidding, money must be tracked.

### Budget Setup

* **Total Project Budget**
* **Currency (TZS)**
* **VAT included?**
* **Contingency (%)**

### Cost Breakdown

* Design costs
* Construction costs
* Supervision costs
* Other costs

### Payment Structure

* Advance payment (if any)
* Milestone-based payments
* Retention (%)

---

# 9. Contractual & Legal Info

This protects both sides.

* **Contract Type**

  * Lump sum
  * Cost plus
* **Contract Reference / Upload**
* **Defects Liability Period**
* **Liquidated damages**

  * Rate per day (optional)
* **Performance security required?** (Yes/No)

---

# 10. Quality, Safety & Compliance

Often ignored — big mistake.

### Quality

* Applicable standards:

  * TBS
  * BS / Eurocodes
* Inspection frequency

### Health & Safety

* HSE plan required? (Yes/No)
* PPE requirements
* Incident reporting enabled? (Yes)

---

# 11. Communication & Reporting

This is where CMMS adds value.

* **Reporting frequency**

  * Weekly / Monthly
* **Approval authority**

  * Owner
  * Project Manager
* **Change request workflow**

  * Engineer → Owner → Approval

---

# 12. Risk & Constraints

Optional but powerful.

* Identified risks

  * Weather
  * Material availability
  * Cash flow
* Constraints

  * Budget cap
  * Time restrictions

---

# 13. Project Status & Lifecycle

System-driven.

* Draft
* Active
* On Hold
* Completed
* Terminated

---

# 14. Permissions & Access Control

Very important for e-proc.

* Who can:

  * Edit project?
  * Approve designs?
  * Approve payments?
  * Close milestones?

---

# Minimal vs Advanced (Product Design Tip)

If you’re worried about complexity:

### MVP (Must-Have)

* Project basics
* Location
* Scope
* Engineers assigned
* Timeline
* Budget
* Documents
* Status

### Phase 2

* Milestones
* Payments
* Risk
* Change management
* Performance tracking

---

# How This Maps to Tenders (Future-Proofing)

Your model already supports tenders later:

| Tender Concept | CMMS Project Equivalent |
| -------------- | ----------------------- |
| Scope of works | Project scope           |
| Bid price      | Project budget          |
| Contractor     | Assigned engineers      |
| BOQ            | Cost breakdown          |
| Contract       | Project legal docs      |

---


## First implementation plan

Implementation Plan - Advanced Project Entity
Goal Description
Implement a comprehensive 
Project
 data model to support real-world construction management in Tanzania. This involves upgrading the existing 
Project
 entity and creating related entities to handle Scope, Team Assignments, Milestones, and Documents, as requested by the user.

User Review Required
IMPORTANT

Data Model Changes: This plan introduces several new tables and relationships. Breaking Change: The existing 
engineer
 field on 
Project
 will be deprecated in favor of the new 
ProjectAssignment
 entity which supports multiple engineers and roles. User Entity: Adding erbNumber for validation of engineers.

Proposed Changes
Backend (eproc-backend)
[MODIFY] 
User.java
Add String erbNumber (for Engineers).
Add String phoneNumber.
Add String title (e.g., "Senior Engineer").
[MODIFY] 
Project.java
Add fields for Core ID: code (e.g., PRJ-2026-001), industry (Enum), projectType (Enum).
Add Owner Rep fields: ownerRepName, ownerRepContact.
Add Location fields: plotNumber, gpsCoordinates, titleDeedAvailable.
Add Context fields: keyObjectives, expectedOutput, siteAccessNotes.
Add Timeline fields: startDate, expectedCompletionDate.
Add Contractual fields: contractType, defectsLiabilityPeriod, performanceSecurityRequired.
Add List<ProjectAssignment> team.
Add List<ProjectScope> scopes.
Add List<ProjectMilestone> milestones.
[NEW] 
ProjectAssignment.java
Links 
Project
 and 
User
.
Fields: role (Enum: LEAD_ENGINEER, CIVIL_ENGINEER, PROJECT_MANAGER, etc.), startDate, responsibilityLevel, reportingLine.
[NEW] 
ProjectScope.java
Tracks scope items (Civil, Electrical, Mechanical).
Fields: category (Enum), description, isIncluded, notes.
[NEW] 
ProjectMilestone.java
Tracks key dates.
Fields: name, deadline, 
status
 (PENDING, COMPLETED), approvalRequired.
[NEW] 
ProjectDocument.java
Tracks file uploads.
Fields: name, type (DRAWING, BOQ, CONTRACT), url, version, 
status
 (DRAFT, APPROVED).
Verification Plan
Automated Tests
Create 
ProjectEntityTest.java
 to verify:
Persistence of all new fields.
Cascading saves for Team, Scope, and Milestones.
ProjectAssignment
 linking correctly to Users.
Run mvn test to ensure existing tests pass.
Manual Verification
N/A (Backend logic primarily, will verify via Tests).
Phase 3: Frontend Implementation
Goal
Update the React frontend to fully support the new Advanced Project features, focusing on progressive disclosure (Wizard) for creation and a rich dashboard for management.

[MODIFY] 
models.ts
Update 
Project
 interface with new fields (code, industry, dates, etc.).
Add new interfaces: 
ProjectAssignment
, 
ProjectScope
, 
ProjectMilestone
, 
ProjectDocument
.
[MODIFY] 
projectService.ts
Add endpoints for team management (
addTeamMember
, 
removeTeamMember
).
Update 
createProject
 to handle the expanded DTO.
[NEW] 
ProjectWizard.tsx
Replaces the simple 
CreateProject
 form.
Step 1: Core Identity: Name, Code, Industry, Project Type.
Step 2: Location: Region, District, Ward, Plot Number, GPS (Map).
Step 3: Owner & Timeline: Owner Rep details, Start/End Dates.
Step 4: Context: Objectives, Scope overview.
Step 5: Review: Summary before submission.
[MODIFY] 
ProjectDetails.tsx
Header: Show Code, Industry, Progress Bar (calculated from milestones).
Tab: Overview: Expanded to show Location details, Contracts, Dates.
Tab: Team: New table showing assignments with "Add Member" modal (using 
ProjectAssignmentService
).
Tab: Milestones: New list view of milestones with status toggle.
Tab: Documents: Simple file list (placeholder for now, or link to external storage).
Tab: Scopes: Read-only view of defined scopes.
[NEW] 
TeamManagement.tsx
Component to list team members.
Form to add new member (User Select + Role Select + Dates).
[NEW] 
MilestoneList.tsx
Visual timeline or list of milestones.
Verification Plan
Manual verification of Project Wizard flow.
Verify Team Management (Add/Remove engineers).
Verify Data persistence in Project Details.


## Review on the first implementation plan

## 1. Does this still align with your *original goal*?

### Your original goal (implicit, but clear from context)

Your app is about:

> **Owner-driven projects → controlled execution → accountability → approvals → records**

NOT:

* Open tender marketplaces
* Anonymous bidding
* Contractor discovery platforms

### Verdict

✅ **YES — this plan stays fully aligned**

Why?

* You are **not introducing bidding**
* You are **not introducing contractor competition**
* You are **not introducing price discovery logic**

Instead, you are:

* Making **Project = the single source of truth**
* Replacing “tender scope” with **structured scope**
* Replacing “contractor” with **assigned professionals**
* Replacing “tender timeline” with **milestones**

This is exactly what a **private-owner CMMS / e-proc system should do**.

---

## 2. Architectural Soundness (Backend Design Review)

### 2.1 Deprecating `engineer` on `Project`

> *Breaking Change: existing engineer field will be deprecated*

✅ **Correct decision**

A single `engineer` field was:

* Too limiting
* Not real-world
* Would block growth

Replacing it with:

```
Project
 └── ProjectAssignment
      ├── User
      ├── Role
      ├── Responsibility
```

is **the correct domain model**.

👉 This is a **necessary breaking change**, not scope creep.

---

### 2.2 `ProjectAssignment` Entity

This is one of the **strongest parts of the plan**.

**Why it’s right:**

* Supports multiple engineers
* Supports non-engineer roles (PM, Clerk of Works later)
* Supports reporting structure
* Supports auditing (“who was responsible when?”)

💡 **Small improvement (optional, not required now)**
Consider:

```java
boolean active;
LocalDate endDate;
```

So assignments can change over time without deleting history.

But this can wait — **not required for MVP**.

---

### 2.3 `User` Modifications (ERB, phone, title)

This is **Tanzania-realistic**, not academic.

✅ `erbNumber`

* Critical for trust
* Critical for compliance
* Critical if you ever integrate ERB verification later

✅ `phoneNumber`

* Needed for site-level coordination
* SMS / WhatsApp integration later

⚠️ **One caution**
Keep `title` **optional**, not authoritative.
Roles must still come from `ProjectAssignment.role`, not from `User.title`.

---

## 3. Project Entity Expansion – Is it too much?

Short answer: **No — but you must control UI exposure.**

Let’s break it down.

### 3.1 Core additions (Absolutely justified)

These are **non-negotiable in real projects**:

* `code`
* `industry`
* `projectType`
* Location fields
* Timeline fields
* Contract fields

✅ These do NOT bloat the system
They **replace ambiguity with structure**

---

### 3.2 Context & descriptive fields

Fields like:

* `keyObjectives`
* `expectedOutput`
* `siteAccessNotes`

These are **low-risk, high-value**.

They:

* Improve communication
* Reduce WhatsApp chaos
* Help new engineers onboard faster

No issue here.

---

## 4. Supporting Entities Review

### 4.1 `ProjectScope`

This is **excellent** and well scoped.

You avoided:

* Full BOQ complexity
* Quantity-level pricing
* Itemized cost control (which belongs to ERP)

Instead, you kept:

* Inclusion
* Category
* Notes

✅ This is **exactly right for CMMS level**, not ERP level.

---

### 4.2 `ProjectMilestone`

Well designed and restrained.

Fields:

* name
* deadline
* status
* approvalRequired

✅ Good
⚠️ Missing (but optional for now):

* `approvedBy`
* `approvedAt`

You can add these later without redesign.

---

### 4.3 `ProjectDocument`

This is **core to accountability**.

You correctly included:

* Type
* Version
* Status

This enables:

* Design approval workflows
* Audit trails
* Dispute resolution

✅ Strong design choice.

---

## 5. What You Did *Right* Product-Wise

These are subtle but important:

### ✔ You avoided financial overreach

You did NOT implement:

* Payment schedules
* Disbursement logic
* Invoice workflows

Good. That belongs to **Phase 2+**, not now.

---

### ✔ You separated “structure” from “process”

You are:

* Defining entities
* Not hardcoding workflows yet

This keeps the system flexible.

---

### ✔ You kept it Tanzania-contextual

* ERB numbers
* Plot numbers
* Title deed availability

This makes your product **locally defensible**.

---

## 6. Where You Should Be Careful (Important)

### 6.1 UI / UX Complexity

Backend can be rich — UI must be staged.

**Strong recommendation:**

* Use **progressive disclosure**
* Wizard-based project creation:

  1. Basics
  2. Location
  3. Scope
  4. Team
  5. Timeline
  6. Documents

Do **NOT** dump all fields in one form.

---

### 6.2 Do NOT Market This as “Tender Replacement”

Internally it maps well — externally it should be framed as:

> “Owner-managed project execution system”

This avoids legal & expectation traps.

---


1. What ProjectAssignment really represents

Think of ProjectAssignment as:

“A person playing a specific role on a specific project, during a specific period, with defined responsibility.”

Not:

A job title

A global role

A user attribute

But a contextual role.

Real-world analogy

An engineer can be:

Lead Engineer on Project A

Site Engineer on Project B

Reviewer only on Project C

👉 Same person, different authority depending on project

That is why:
❌ User.role is wrong
✅ ProjectAssignment.role is correct

2. Relationship model (very important)

Conceptually:

User 1 ────< ProjectAssignment >──── 1 Project


Meaning:

One User can have many assignments

One Project can have many assignments

Each assignment is unique per project + role

Why this matters

This allows you to:

Track responsibility

Enforce permissions

Audit decisions

Change teams mid-project

3. Core Fields Explained (Why each exists)
3.1 role (Enum)
LEAD_ENGINEER
CIVIL_ENGINEER
ELECTRICAL_ENGINEER
MECHANICAL_ENGINEER
SITE_ENGINEER
PROJECT_MANAGER


This answers:

“What authority does this person have on THIS project?”

Examples:

Only LEAD_ENGINEER can approve designs

Only PROJECT_MANAGER can close milestones

SITE_ENGINEER can submit reports but not approve

3.2 startDate (Mandatory)

This is not cosmetic.

It allows:

Responsibility tracking

Historical accountability

Example:

“Who was the site engineer when foundation works were done?”

Without startDate, you cannot answer this.

3.3 responsibilityLevel (Controlled freedom)

This is a business-level qualifier, not a permission.

Examples:

FULL

LIMITED

OBSERVER

Usage:

FULL → can approve

LIMITED → can submit

OBSERVER → read-only

This works together with permissions, not instead of them.

3.4 reportingLine

This captures hierarchy without hardcoding org charts.

Examples:

Site Engineer → Lead Engineer

Electrical Engineer → Project Manager

This is critical for:

Escalations

Approval routing

Notifications

4. How Assignment Works in Real Usage
Step 1: Owner creates project

At this point:

Project exists

No engineers yet

Status: DRAFT

Step 2: Owner / Admin assigns people

Example assignments:

User	Role	Responsibility
Eng. A	LEAD_ENGINEER	FULL
Eng. B	CIVIL_ENGINEER	FULL
Eng. C	SITE_ENGINEER	LIMITED
Eng. D	PROJECT_MANAGER	FULL

Each row = one ProjectAssignment record

Step 3: System enforces behavior

When an action happens:

Example: Design approval request

System checks:

Is user assigned to this project?
AND role == LEAD_ENGINEER
AND responsibilityLevel == FULL


If yes → allow
If no → deny

No magic. No special cases.

5. Permissions vs Assignments (Very important distinction)
Concept	Where it lives	Purpose
Global permissions	User / Role system	App-wide access
Project authority	ProjectAssignment	Project-specific power

This means:

A user may log into the app

But cannot touch this project

Unless assigned

This is enterprise-grade access control.

6. ERB Validation – Where it fits

ERB validation is User-level, not Assignment-level.

Flow:

User has erbNumber

When assigning role:

If role ∈ {ENGINEER ROLES}

System checks erbNumber != null

This avoids:

Fake engineers

Role abuse

7. Lifecycle of a ProjectAssignment

A realistic lifecycle:

CREATED → ACTIVE → ENDED


Even if you don’t model status now:

startDate

(optional future endDate)

already gives you temporal control.

## Second implementation plan

Implementation Plan - Advanced Project Entity
Goal Description
Implement a comprehensive 
Project
 data model to support real-world construction management in Tanzania. This involves upgrading the existing 
Project
 entity and creating related entities to handle Scope, Team Assignments, Milestones, and Documents, as requested by the user.

User Review Required
IMPORTANT

Data Model Changes: This plan introduces several new tables and relationships. Breaking Change: The existing 
engineer
 field on 
Project
 will be deprecated in favor of the new 
ProjectAssignment
 entity which supports multiple engineers and roles. User Entity: Adding erbNumber for validation of engineers.

Proposed Changes
Backend (eproc-backend)
[MODIFY] 
User.java
Add String erbNumber (for Engineers).
Add String phoneNumber.
Add String title (e.g., "Senior Engineer").
[MODIFY] 
Project.java
Add fields for Core ID: code (e.g., PRJ-2026-001), industry (Enum), projectType (Enum).
Add Owner Rep fields: ownerRepName, ownerRepContact.
Add Location fields: plotNumber, gpsCoordinates, titleDeedAvailable.
Add Context fields: keyObjectives, expectedOutput, siteAccessNotes.
Add Timeline fields: startDate, expectedCompletionDate.
Add Contractual fields: contractType, defectsLiabilityPeriod, performanceSecurityRequired.
Add List<ProjectAssignment> team.
Add List<ProjectScope> scopes.
Add List<ProjectMilestone> milestones.
[NEW] 
ProjectAssignment.java
Links 
Project
 and 
User
.
Fields: role (Enum: LEAD_ENGINEER, CIVIL_ENGINEER, PROJECT_MANAGER, etc.), startDate, responsibilityLevel, reportingLine.
[NEW] 
ProjectScope.java
Tracks scope items (Civil, Electrical, Mechanical).
Fields: category (Enum), description, isIncluded, notes.
[NEW] 
ProjectMilestone.java
Tracks key dates.
Fields: name, deadline, 
status
 (PENDING, COMPLETED), approvalRequired.
[NEW] 
ProjectDocument.java
Tracks file uploads.
Fields: name, type (DRAWING, BOQ, CONTRACT), url, version, 
status
 (DRAFT, APPROVED).
Verification Plan
Automated Tests
Create 
ProjectEntityTest.java
 to verify:
Persistence of all new fields.
Cascading saves for Team, Scope, and Milestones.
ProjectAssignment
 linking correctly to Users.
Run mvn test to ensure existing tests pass.
Manual Verification
N/A (Backend logic primarily, will verify via Tests).
Phase 3: Frontend Implementation
Goal
Update the React frontend to fully support the new Advanced Project features, focusing on progressive disclosure (Wizard) for creation and a rich dashboard for management.

[MODIFY] 
models.ts
Update 
Project
 interface with new fields (code, industry, dates, etc.).
Add new interfaces: 
ProjectAssignment
, 
ProjectScope
, 
ProjectMilestone
, 
ProjectDocument
.
[MODIFY] 
projectService.ts
Add endpoints for team management (
addTeamMember
, 
removeTeamMember
).
Update 
createProject
 to handle the expanded DTO.
[NEW] 
ProjectWizard.tsx
Replaces the simple 
CreateProject
 form.
Step 1: Core Identity: Name, Code, Industry, Project Type.
Step 2: Location: Region, District, Ward, Plot Number, GPS (Map).
Step 3: Owner & Timeline: Owner Rep details, Start/End Dates.
Step 4: Context: Objectives, Scope overview.
Step 5: Review: Summary before submission.
[MODIFY] 
ProjectDetails.tsx
Header: Show Code, Industry, Progress Bar (calculated from milestones).
Tab: Overview: Expanded to show Location details, Contracts, Dates.
Tab: Team: New table showing assignments with "Add Member" modal (using 
ProjectAssignmentService
).
Tab: Milestones: New list view of milestones with status toggle.
Tab: Documents: Simple file list (placeholder for now, or link to external storage).
Tab: Scopes: Read-only view of defined scopes.
[NEW] 
TeamManagement.tsx
Component to list team members.
Form to add new member (User Select + Role Select + Dates).
[NEW] 
MilestoneList.tsx
Visual timeline or list of milestones.
Verification Plan
Manual verification of Project Wizard flow.
Verify Team Management (Add/Remove engineers).
Verify Data persistence in Project Details.

### Note: at this point a data model(data-model.md) was created

## Final review on the second implementation plan before the actual implementation started

proceed to implement it.
But do it with two small guardrails I’ll point out below so you don’t create future friction.

wo Guardrails Before You Code (Important)

These are not blockers, just smart precautions.

Implement in this order:

Enums (industry, projectType, roles, responsibilityLevel)

ProjectAssignment entity

Project entity refactor

ProjectScope

ProjectMilestone

ProjectDocument

Tests

Only then touch APIs

This minimizes rollback risk.



## Frontend implementation plan 

Implementation Plan - Advanced Project Entity
Goal Description
Implement a comprehensive 
Project
 data model to support real-world construction management in Tanzania. This involves upgrading the existing 
Project
 entity and creating related entities to handle Scope, Team Assignments, Milestones, and Documents, as requested by the user.

User Review Required
IMPORTANT

Data Model Changes: This plan introduces several new tables and relationships. Breaking Change: The existing 
engineer
 field on 
Project
 will be deprecated in favor of the new 
ProjectAssignment
 entity which supports multiple engineers and roles. User Entity: Adding erbNumber for validation of engineers.

Proposed Changes
Backend (eproc-backend)
[MODIFY] 
User.java
Add String erbNumber (for Engineers).
Add String phoneNumber.
Add String title (e.g., "Senior Engineer").
[MODIFY] 
Project.java
Add fields for Core ID: code (e.g., PRJ-2026-001), industry (Enum), projectType (Enum).
Add Owner Rep fields: ownerRepName, ownerRepContact.
Add Location fields: plotNumber, gpsCoordinates, titleDeedAvailable.
Add Context fields: keyObjectives, expectedOutput, siteAccessNotes.
Add Timeline fields: startDate, expectedCompletionDate.
Add Contractual fields: contractType, defectsLiabilityPeriod, performanceSecurityRequired.
Add List<ProjectAssignment> team.
Add List<ProjectScope> scopes.
Add List<ProjectMilestone> milestones.
[NEW] 
ProjectAssignment.java
Links 
Project
 and 
User
.
Fields: role (Enum: LEAD_ENGINEER, CIVIL_ENGINEER, PROJECT_MANAGER, etc.), startDate, responsibilityLevel, reportingLine.
[NEW] 
ProjectScope.java
Tracks scope items (Civil, Electrical, Mechanical).
Fields: category (Enum), description, isIncluded, notes.
[NEW] 
ProjectMilestone.java
Tracks key dates.
Fields: name, deadline, 
status
 (PENDING, COMPLETED), approvalRequired.
[NEW] 
ProjectDocument.java
Tracks file uploads.
Fields: name, type (DRAWING, BOQ, CONTRACT), url, version, 
status
 (DRAFT, APPROVED).
Verification Plan
Automated Tests
Create 
ProjectEntityTest.java
 to verify:
Persistence of all new fields.
Cascading saves for Team, Scope, and Milestones.
ProjectAssignment
 linking correctly to Users.
Run mvn test to ensure existing tests pass.
Manual Verification
N/A (Backend logic primarily, will verify via Tests).
Phase 3: Frontend Implementation
Goal
Update the React frontend to fully support the new Advanced Project features, focusing on progressive disclosure (Wizard) for creation and a rich dashboard for management.

[MODIFY] 
models.ts
Update 
Project
 interface with new fields (code, industry, dates, etc.).
Add new interfaces: 
ProjectAssignment
, 
ProjectScope
, 
ProjectMilestone
, 
ProjectDocument
.
[MODIFY] 
projectService.ts
Add endpoints for team management (
addTeamMember
, 
removeTeamMember
).
Update 
createProject
 to handle the expanded DTO.
[NEW] 
ProjectWizard.tsx
Replaces the simple 
CreateProject
 form.
Step 1: Core Identity: Name, Code, Industry, Project Type.
Step 2: Location: Region, District, Ward, Plot Number, GPS (Map).
Step 3: Owner & Timeline: Owner Rep details, Start/End Dates.
Step 4: Context: Objectives, Scope overview.
Step 5: Review: Summary before submission.
[MODIFY] 
ProjectDetails.tsx
Header: Show Code, Industry, Progress Bar (calculated from milestones).
Tab: Overview: Expanded to show Location details, Contracts, Dates.
Tab: Team: New table showing assignments with "Add Member" modal (using 
ProjectAssignmentService
).
Tab: Milestones: New list view of milestones with status toggle.
Tab: Documents: Simple file list (placeholder for now, or link to external storage).
Tab: Scopes: Read-only view of defined scopes.
[NEW] 
TeamManagement.tsx
Component to list team members.
Form to add new member (User Select + Role Select + Dates).
[NEW] 
MilestoneList.tsx
Visual timeline or list of milestones.
Verification Plan
Manual verification of Project Wizard flow.
Verify Team Management (Add/Remove engineers).
Verify Data persistence in Project Details.


## Review on frontend implementation plan before actual implementation

Executive Verdict

✅ YES — you can proceed with this frontend implementation plan.

It:

Does not drift from your original CMMS / e-proc goal

Correctly reflects the new ProjectAssignment-based authority model

Uses progressive disclosure, which is critical

Does not prematurely overbuild workflows (payments, approvals, etc.)

However, before you code, there are 5 important refinements you should apply to avoid UX and authorization pain later.

1. High-Level Alignment Check
Backend Reality

Project has an owner

Team authority comes from ProjectAssignment

Many fields exist, but not all are mandatory at creation time

Frontend Strategy

Wizard-based creation

Rich project dashboard

Role-aware management views

✅ Correct translation of backend → frontend

You are not leaking backend complexity into the UI — good sign.

2. Project Creation Wizard – Review

Your wizard steps are well designed.

Current steps

Core Identity

Location

Owner & Timeline

Context

Review

Verdict

✅ Logical
✅ Low cognitive load
✅ Matches real-world thinking

One Important Adjustment (Critical)
🔴 Do NOT include “Scope overview” in the creation wizard

Why:

Scope often evolves

Engineers are not yet assigned

It creates false precision early

✅ Recommended change

Wizard should stop at “Context” only, with high-level description.

Move actual scopes to:

Project Details → Scopes tab (editable later)

This keeps the wizard:

Fast

Safe

Owner-friendly

3. ProjectDetails Page – Very Good Design

Your tab structure is exactly right:

Tabs Review
Overview

✔ Location
✔ Contract info
✔ Dates
✔ Progress bar from milestones (excellent idea)

No issues.

Team Tab (Very Important)

This is where your new model shines.

Your design:

Table of assignments

Add Member modal

Role + dates

✅ Correct

Two rules the UI MUST enforce

Only project owner or admin sees “Add Member”

Engineers cannot add engineers

This is not backend-only — the UI must hide actions too.

Milestones Tab

Status toggle + approval flag is perfect for now.

⚠️ Small UX rule:

If approvalRequired = true

Show “Request Approval”

Not “Mark Completed”

This avoids authority confusion.

Documents Tab

You did the right thing by keeping it simple.

Do NOT:

Implement versioning UI now

Implement approvals UI now

Placeholder is perfect.

Scopes Tab

Read-only initially is the right call.

Later:

Editable by Lead Engineer

Approved by Owner

For now → display only.

4. TeamManagement.tsx – One Key Refinement

Current plan:

Form to add new member (User Select + Role Select + Dates)

This is good, but you must split user selection logic:

User Select should be:

Searchable

Filtered by global role

Examples:

ENGINEER → shows only users with role_code = ENGINEER

PROJECT_MANAGER → role-based filter

This prevents:

Assigning accountants as site engineers

Invalid role combinations

5. Authentication & Authorization (Frontend Side)

Your frontend must respect the two-layer authorization model.

Layer 1 – Global Role (JWT / session)

Controls:

Which pages exist

Which menu items appear

Example:

Engineers don’t see “Create Project”

Layer 2 – Project Assignment (Fetched from API)

Controls:

Buttons

Actions

Tabs

Example:

Assigned engineer sees ProjectDetails

Non-assigned user gets 403 / redirected

👉 Do NOT rely only on JWT claims for project actions

Always fetch:

GET /projects/{id}/my-assignment


And derive UI permissions from that.

6. models.ts – One Small but Important Tip

When you define interfaces like:

interface ProjectAssignment {
  user: User;
  role: ProjectRole;
  responsibilityLevel: ResponsibilityLevel;
}


Also include:

canEdit?: boolean;
canApprove?: boolean;


These can be derived server-side and save you from duplicating logic in React.

7. What You Did Especially Well

I want to explicitly call these out:

✔ Progressive disclosure (wizard)
✔ Separation of creation vs management
✔ Not mixing owner and engineer concepts
✔ Avoiding tender/bidding UI
✔ Using milestones for progress (smart reuse)

This shows product maturity, not just coding.

8. Final “Proceed” Checklist

Before coding, ensure these are true:

 Wizard does NOT include detailed scopes

 Owner-only sees “Add Team Member”

 Team roles are filtered by global user role

 UI respects project assignment permissions

 Project can exist without team initially

If all five are satisfied:

🚀 Proceed with implementation confidently