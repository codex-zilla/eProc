# implementation_plan_phase2.md

# Phase 2: BOQ Aggregation, Bulk Submission & Documentation

## 1. Goal Description

Enhance the system to support  **real-world BOQ workflows** :

1. **Batching** : Engineers submit lists of items (Batches) rather than single items.
2. **Documentation** : Attachments (PDFs, Drawings) are first-class citizens.
3. **Ingestion** : Import functionality (Excel/CSV) to speed up data entry.
4. **Aggregation** : Project Owners view grouped financial data.

## 2. New Workflows

### 2.1 Engineer: Batch Submission

* **Create Batch** : "Foundation Works - Zone A".
* **Add Items** :
* *Manual* : Add row by row in a grid.
* *Import* : Upload Excel, map columns, preview, ingest.
* **Add Attachments** : Drag & drop drawings/specs linked to the batch.
* **Submit** : Sends the entire batch for review.

### 2.2 Project Owner: Batch Review

* **Review** : See titled batch with summary stats (Total Value, Item Count).
* **Decision** :
* *Approve Batch* : Approves all items.
* *Partial Approval* : Reject specific items, approve rest.
* **Context** : Preview attached documents during review.

---

## 3. Business Rules & Logic

### 3.1 Status Synchronization (Invariant In Aggregation)

To keep aggregation logic simple, `BoqBatch` status drives

MaterialRequest status:

| Batch Status                 | MaterialRequest Status                        |
| ---------------------------- | --------------------------------------------- |
| **SUBMITTED**          | All items must be `PENDING`                 |
| **APPROVED**           | All items must be `APPROVED`                |
| **PARTIALLY_APPROVED** | Items are mixed (`APPROVED` / `REJECTED`) |
| **CLOSED**             | Items are immutable (Archived)                |

### 3.2 Excel Import Contract

Import file must satisfy these minimum columns:

* `BOQ Code` (Required)
* `Description` (Required)
* Unit (Required)
* `Quantity` (Required)
* `Rate` (Optional - defaults to 0 if missing)

### 3.3 Attachment Policy

* **Ownership Constraint** : Attachment must belong to EITHER `BoqBatch` OR

  MaterialRequest (never both).

* **Mutability** : Batch attachments are **Read-Only** after submission.
* **Constraints** : Max size 20MB. Allowed types: PDF, JPG, PNG, XLSX.

---

## 4. Backend Implementation Plan

### 4.1 New Entities

#### [NEW] `BoqBatch.java`

Container for grouping requests.

<pre><div node="[object Object]" class="relative whitespace-pre-wrap word-break-all p-3 my-2 rounded-sm bg-list-hover-subtle"><div class="w-full h-full text-xs cursor-text"><div class="code-block"><div class="code-line" data-line-number="1" data-line-start="1" data-line-end="1"><div class="line-content"><span class="mtk1">@</span><span class="mtk17">Entity</span></div></div><div class="code-line" data-line-number="2" data-line-start="2" data-line-end="2"><div class="line-content"><span class="mtk6">public</span><span class="mtk1"></span><span class="mtk6">class</span><span class="mtk1"></span><span class="mtk17">BoqBatch</span><span class="mtk1"> {</span></div></div><div class="code-line" data-line-number="3" data-line-start="3" data-line-end="3"><div class="line-content"><span class="mtk1">    @</span><span class="mtk17">Id</span></div></div><div class="code-line" data-line-number="4" data-line-start="4" data-line-end="4"><div class="line-content"><span class="mtk1"></span><span class="mtk6">private</span><span class="mtk1"></span><span class="mtk17">Long</span><span class="mtk1"></span><span class="mtk10">id</span><span class="mtk1">;</span></div></div><div class="code-line" data-line-number="5" data-line-start="5" data-line-end="5"><div class="line-content"><span class="mtk1"></span><span class="mtk6">private</span><span class="mtk1"></span><span class="mtk17">String</span><span class="mtk1"></span><span class="mtk10">title</span><span class="mtk1">;</span></div></div><div class="code-line" data-line-number="6" data-line-start="6" data-line-end="6"><div class="line-content"><span class="mtk1"></span><span class="mtk6">private</span><span class="mtk1"></span><span class="mtk17">String</span><span class="mtk1"></span><span class="mtk10">description</span><span class="mtk1">;</span></div></div><div class="code-line" data-line-number="7" data-line-start="7" data-line-end="7"><div class="line-content"><span class="mtk1"></span></div></div><div class="code-line" data-line-number="8" data-line-start="8" data-line-end="8"><div class="line-content"><span class="mtk1">    @</span><span class="mtk17">Enumerated</span><span class="mtk1">(</span><span class="mtk10">EnumType</span><span class="mtk1">.</span><span class="mtk10">STRING</span><span class="mtk1">)</span></div></div><div class="code-line" data-line-number="9" data-line-start="9" data-line-end="9"><div class="line-content"><span class="mtk1"></span><span class="mtk6">private</span><span class="mtk1"></span><span class="mtk17">BatchStatus</span><span class="mtk1"></span><span class="mtk10">status</span><span class="mtk1">; </span></div></div><div class="code-line" data-line-number="10" data-line-start="10" data-line-end="10"><div class="line-content"><span class="mtk1"></span><span class="mtk5">// DRAFT, SUBMITTED, PARTIALLY_APPROVED, APPROVED, CLOSED</span></div></div><div class="code-line" data-line-number="11" data-line-start="11" data-line-end="11"><div class="line-content"><span class="mtk1"></span></div></div><div class="code-line" data-line-number="12" data-line-start="12" data-line-end="12"><div class="line-content"><span class="mtk1">    @</span><span class="mtk17">ManyToOne</span><span class="mtk1"></span><span class="mtk6">private</span><span class="mtk1"></span><span class="mtk17">Project</span><span class="mtk1"></span><span class="mtk10">project</span><span class="mtk1">;</span></div></div><div class="code-line" data-line-number="13" data-line-start="13" data-line-end="13"><div class="line-content"><span class="mtk1">    @</span><span class="mtk17">ManyToOne</span><span class="mtk1"></span><span class="mtk6">private</span><span class="mtk1"></span><span class="mtk17">User</span><span class="mtk1"></span><span class="mtk10">createdBy</span><span class="mtk1">;</span></div></div><div class="code-line" data-line-number="14" data-line-start="14" data-line-end="14"><div class="line-content"><span class="mtk1"></span></div></div><div class="code-line" data-line-number="15" data-line-start="15" data-line-end="15"><div class="line-content"><span class="mtk1">    @</span><span class="mtk17">OneToMany</span><span class="mtk1">(mappedBy </span><span class="mtk3">=</span><span class="mtk1"></span><span class="mtk12">"batch"</span><span class="mtk1">)</span></div></div><div class="code-line" data-line-number="16" data-line-start="16" data-line-end="16"><div class="line-content"><span class="mtk1"></span><span class="mtk6">private</span><span class="mtk1"></span><span class="mtk17">List</span><span class="mtk1"><</span><span class="mtk17">MaterialRequest</span><span class="mtk1">> </span><span class="mtk10">items</span><span class="mtk1">;</span></div></div><div class="code-line" data-line-number="17" data-line-start="17" data-line-end="17"><div class="line-content"><span class="mtk1">}</span></div></div></div></div></div></pre>

#### [NEW] `BatchAuditLog.java`

Tracks batch-level decisions.

<pre><div node="[object Object]" class="relative whitespace-pre-wrap word-break-all p-3 my-2 rounded-sm bg-list-hover-subtle"><div class="w-full h-full text-xs cursor-text"><div class="code-block"><div class="code-line" data-line-number="1" data-line-start="1" data-line-end="1"><div class="line-content"><span class="mtk1">@</span><span class="mtk17">Entity</span></div></div><div class="code-line" data-line-number="2" data-line-start="2" data-line-end="2"><div class="line-content"><span class="mtk6">public</span><span class="mtk1"></span><span class="mtk6">class</span><span class="mtk1"></span><span class="mtk17">BatchAuditLog</span><span class="mtk1"> {</span></div></div><div class="code-line" data-line-number="3" data-line-start="3" data-line-end="3"><div class="line-content"><span class="mtk1">    @</span><span class="mtk17">Id</span><span class="mtk1"></span><span class="mtk6">private</span><span class="mtk1"></span><span class="mtk17">Long</span><span class="mtk1"></span><span class="mtk10">id</span><span class="mtk1">;</span></div></div><div class="code-line" data-line-number="4" data-line-start="4" data-line-end="4"><div class="line-content"><span class="mtk1">    @</span><span class="mtk17">ManyToOne</span><span class="mtk1"></span><span class="mtk6">private</span><span class="mtk1"></span><span class="mtk17">BoqBatch</span><span class="mtk1"></span><span class="mtk10">batch</span><span class="mtk1">;</span></div></div><div class="code-line" data-line-number="5" data-line-start="5" data-line-end="5"><div class="line-content"><span class="mtk1"></span><span class="mtk6">private</span><span class="mtk1"></span><span class="mtk17">String</span><span class="mtk1"></span><span class="mtk10">action</span><span class="mtk1">; </span><span class="mtk5">// CREATED, SUBMITTED, PARTIALLY_APPROVED, APPROVED, CLOSED</span></div></div><div class="code-line" data-line-number="6" data-line-start="6" data-line-end="6"><div class="line-content"><span class="mtk1"></span><span class="mtk6">private</span><span class="mtk1"></span><span class="mtk17">String</span><span class="mtk1"></span><span class="mtk10">comment</span><span class="mtk1">;</span></div></div><div class="code-line" data-line-number="7" data-line-start="7" data-line-end="7"><div class="line-content"><span class="mtk1"></span><span class="mtk6">private</span><span class="mtk1"></span><span class="mtk17">LocalDateTime</span><span class="mtk1"></span><span class="mtk10">timestamp</span><span class="mtk1">;</span></div></div><div class="code-line" data-line-number="8" data-line-start="8" data-line-end="8"><div class="line-content"><span class="mtk1">    @</span><span class="mtk17">ManyToOne</span><span class="mtk1"></span><span class="mtk6">private</span><span class="mtk1"></span><span class="mtk17">User</span><span class="mtk1"></span><span class="mtk10">actor</span><span class="mtk1">;</span></div></div><div class="code-line" data-line-number="9" data-line-start="9" data-line-end="9"><div class="line-content"><span class="mtk1">}</span></div></div></div></div></div></pre>

#### [MODIFY]

MaterialRequest.java

Add link to batch.

<pre><div node="[object Object]" class="relative whitespace-pre-wrap word-break-all p-3 my-2 rounded-sm bg-list-hover-subtle"><div class="w-full h-full text-xs cursor-text"><div class="code-block"><div class="code-line" data-line-number="1" data-line-start="1" data-line-end="1"><div class="line-content"><span class="mtk1">@</span><span class="mtk17">ManyToOne</span></div></div><div class="code-line" data-line-number="2" data-line-start="2" data-line-end="2"><div class="line-content"><span class="mtk6">private</span><span class="mtk1"></span><span class="mtk17">BoqBatch</span><span class="mtk1"></span><span class="mtk10">batch</span><span class="mtk1">; </span><span class="mtk5">// Nullable</span></div></div></div></div></div></pre>

#### [NEW] `RequestAttachment.java`

Metadata for uploaded files.

<pre><div node="[object Object]" class="relative whitespace-pre-wrap word-break-all p-3 my-2 rounded-sm bg-list-hover-subtle"><div class="w-full h-full text-xs cursor-text"><div class="code-block"><div class="code-line" data-line-number="1" data-line-start="1" data-line-end="1"><div class="line-content"><span class="mtk1">@</span><span class="mtk17">Entity</span></div></div><div class="code-line" data-line-number="2" data-line-start="2" data-line-end="2"><div class="line-content"><span class="mtk6">public</span><span class="mtk1"></span><span class="mtk6">class</span><span class="mtk1"></span><span class="mtk17">RequestAttachment</span><span class="mtk1"> {</span></div></div><div class="code-line" data-line-number="3" data-line-start="3" data-line-end="3"><div class="line-content"><span class="mtk1">    @</span><span class="mtk17">Id</span><span class="mtk1"></span><span class="mtk6">private</span><span class="mtk1"></span><span class="mtk17">Long</span><span class="mtk1"></span><span class="mtk10">id</span><span class="mtk1">;</span></div></div><div class="code-line" data-line-number="4" data-line-start="4" data-line-end="4"><div class="line-content"><span class="mtk1"></span><span class="mtk6">private</span><span class="mtk1"></span><span class="mtk17">String</span><span class="mtk1"></span><span class="mtk10">fileName</span><span class="mtk1">;</span></div></div><div class="code-line" data-line-number="5" data-line-start="5" data-line-end="5"><div class="line-content"><span class="mtk1"></span><span class="mtk6">private</span><span class="mtk1"></span><span class="mtk17">String</span><span class="mtk1"></span><span class="mtk10">fileType</span><span class="mtk1">;</span></div></div><div class="code-line" data-line-number="6" data-line-start="6" data-line-end="6"><div class="line-content"><span class="mtk1"></span><span class="mtk6">private</span><span class="mtk1"></span><span class="mtk17">Long</span><span class="mtk1"></span><span class="mtk10">fileSize</span><span class="mtk1">;</span></div></div><div class="code-line" data-line-number="7" data-line-start="7" data-line-end="7"><div class="line-content"><span class="mtk1"></span><span class="mtk6">private</span><span class="mtk1"></span><span class="mtk17">String</span><span class="mtk1"></span><span class="mtk10">storagePath</span><span class="mtk1">;</span></div></div><div class="code-line" data-line-number="8" data-line-start="8" data-line-end="8"><div class="line-content"><span class="mtk1"></span></div></div><div class="code-line" data-line-number="9" data-line-start="9" data-line-end="9"><div class="line-content"><span class="mtk1">    @</span><span class="mtk17">ManyToOne</span><span class="mtk1"></span><span class="mtk6">private</span><span class="mtk1"></span><span class="mtk17">BoqBatch</span><span class="mtk1"></span><span class="mtk10">batch</span><span class="mtk1">;</span></div></div><div class="code-line" data-line-number="10" data-line-start="10" data-line-end="10"><div class="line-content"><span class="mtk1">    @</span><span class="mtk17">ManyToOne</span><span class="mtk1"></span><span class="mtk6">private</span><span class="mtk1"></span><span class="mtk17">MaterialRequest</span><span class="mtk1"></span><span class="mtk10">requestItem</span><span class="mtk1">;</span></div></div><div class="code-line" data-line-number="11" data-line-start="11" data-line-end="11"><div class="line-content"><span class="mtk1">}</span></div></div></div></div></div></pre>

### 4.2 API Data Shapes

#### Review Decision DTO

When Project Owner submits a review:

<pre><div node="[object Object]" class="relative whitespace-pre-wrap word-break-all p-3 my-2 rounded-sm bg-list-hover-subtle"><div class="w-full h-full text-xs cursor-text"><div class="code-block"><div class="code-line" data-line-number="1" data-line-start="1" data-line-end="1"><div class="line-content"><span class="mtk1">{</span></div></div><div class="code-line" data-line-number="2" data-line-start="2" data-line-end="2"><div class="line-content"><span class="mtk1"></span><span class="mtk10">"approvedItemIds"</span><span class="mtk1">: [</span><span class="mtk7">1</span><span class="mtk1">, </span><span class="mtk7">2</span><span class="mtk1">, </span><span class="mtk7">3</span><span class="mtk1">],</span></div></div><div class="code-line" data-line-number="3" data-line-start="3" data-line-end="3"><div class="line-content"><span class="mtk1"></span><span class="mtk10">"rejectedItems"</span><span class="mtk1">: [</span></div></div><div class="code-line" data-line-number="4" data-line-start="4" data-line-end="4"><div class="line-content"><span class="mtk1">    { </span><span class="mtk10">"id"</span><span class="mtk1">: </span><span class="mtk7">4</span><span class="mtk1">, </span><span class="mtk10">"reason"</span><span class="mtk1">: </span><span class="mtk12">"Overestimated quantity"</span><span class="mtk1"> }</span></div></div><div class="code-line" data-line-number="5" data-line-start="5" data-line-end="5"><div class="line-content"><span class="mtk1">  ],</span></div></div><div class="code-line" data-line-number="6" data-line-start="6" data-line-end="6"><div class="line-content"><span class="mtk1"></span><span class="mtk10">"batchComment"</span><span class="mtk1">: </span><span class="mtk12">"Approved structural items only"</span></div></div><div class="code-line" data-line-number="7" data-line-start="7" data-line-end="7"><div class="line-content"><span class="mtk1">}</span></div></div></div></div></div></pre>

### 4.3 API Endpoints

<pre><div node="[object Object]" class="relative whitespace-pre-wrap word-break-all p-3 my-2 rounded-sm bg-list-hover-subtle"><div class="w-full h-full text-xs cursor-text"><div class="code-block"><div class="code-line" data-line-number="1" data-line-start="1" data-line-end="1"><div class="line-content"><span class="mtk1">POST /api/boq/batches</span></div></div><div class="code-line" data-line-number="2" data-line-start="2" data-line-end="2"><div class="line-content"><span class="mtk1">POST /api/boq/batches/{id}/items</span></div></div><div class="code-line" data-line-number="3" data-line-start="3" data-line-end="3"><div class="line-content"><span class="mtk1">POST /api/boq/batches/{id}/import</span></div></div><div class="code-line" data-line-number="4" data-line-start="4" data-line-end="4"><div class="line-content"><span class="mtk1">POST /api/boq/batches/{id}/submit</span></div></div><div class="code-line" data-line-number="5" data-line-start="5" data-line-end="5"><div class="line-content"><span class="mtk1">POST /api/boq/batches/{id}/review  <-- Uses Review Decision DTO</span></div></div><div class="code-line" data-line-number="6" data-line-start="6" data-line-end="6"><div class="line-content"><span class="mtk1">GET  /api/boq/batches/{id}</span></div></div><div class="code-line" data-line-number="7" data-line-start="7" data-line-end="7"><div class="line-content"><span class="mtk1">POST /api/attachments</span></div></div></div></div></div></pre>

---

## 5. Phasing & Verification

### 5.1 Sub-Phases

1. **Backend Foundation** : Entities & Service Layer for Batches/Attachments.
2. **Frontend Engineer** : Batch Creation & Import Flow.
3. **Frontend Manager** : Batch Review Flow.
4. **Reporting** : Dashboard & Aggregation.

### 5.2 Verification

* **Test** : Create Batch -> Submit. Verify Items -> PENDING.
* **Test** : Partial Approval -> Verify Batch Status -> PARTIALLY_APPROVED.
