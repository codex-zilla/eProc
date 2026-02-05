Based on the implementation plans and design specifications, here are the required frontend pages and their contents for the Phase 2 implementation.

I have categorized them by user role (Engineer vs. Project Owner) and indicated which are new pages versus updates to existing ones.

### 1. Engineer Pages (Construction Team)

#### **1.1. Create Batch Request** (

```
CreateBatch.tsx
```

) — **[NEW]**

This is the primary workspace for Engineers to compile requests before submission.

* **Header Section** :
* **Batch Title Input** : e.g., "Foundation Works - Zone A".
* **Description** : Optional context for the reviewer.
* **Item Management (The Grid)** :
* **Manual Entry** : Button/Form to add a single BOQ item (utilizes the existing
  ``CreateRequest``

  form logic but adds to a list instead of immediate submit).
* **Excel Import** : Upload button triggers a modal to map columns (BOQ Code, Description, Unit, Qty, Rate) and ingest multiple items at once.
* **Editable Table** : Allows inline editing of quantities or rates before submission.
* **Attachments Section** :
* **File Uploader** : Drag & drop zone for PDFs (drawings, specs) or Excel sheets.
* **List** : Shows uploaded files with specific tags (e.g., "Drawing", "Specification").
* **Footer Actions** :
* "Save Draft" and "Submit Batch".

#### **1.2. My Batches** (

```
MyBatches.tsx
```

) — **[NEW]**

A dashboard for Engineers to track the status of their bulk submissions.

* **List View** : Table displaying:
* Batch Title
* Date Created
* Status (

  ```
  DRAFT
  ```

  ,

  ```
  SUBMITTED
  ```

  ,

  ```
  PARTIALLY_APPROVED
  ```

  ,

  ```
  APPROVED
  ```

  ,

  ```
  REJECTED
  ```

  )
* Total Value (Sum of all items)
* Item Count
* **Actions** : "View Details", "Delete Draft".

---

### 2. Project Owner Pages (Management Team)

#### **2.1. Pending Batches** (

```
PendingBatches.tsx
```

) — **[NEW]**

Replaces or sits alongside the current "Pending Requests" to allow reviewing at the batch level.

* **Batches Table** :
* Batch Title
* Submitted By (Engineer Name)
* Date Submitted
* **High-Level Stats** : Total items, Total Value (Currency).
* **Action** : "Review" button.

#### **2.2. Batch Review Detail** (

```
BatchReview.tsx
```

) — **[NEW]**

The critical decision-making screen for managers.

* **Overview Panel** :
* Batch Title & Description.
* **Attachments Viewer** : List of linked docs/drawings available for preview/download.
* **Approval Interface** :
* **Item List** : A list of all requests in the batch.
* **Per-Item Actions** : A "Reject" toggle/button for individual lines. If rejected, a comment box must appear for the reason.
* **Read-Only Columns** : BOQ Code, Description, Qty, Rate, Total.
* **Decision Footer** :
* **Approve Batch** : Approves all items (or only non-rejected ones if partial).
* **Reject Entire Batch** : Flushes the whole submission back to the engineer.
* **Overall Comment** : Optional note for the audit log.

---

### 3. Aggregation & Reporting (Shared/Admin)

#### **3.1. BOQ Summary Dashboard** (

```
BoqProjectSummary.tsx
```

) — **[NEW / Phase 2b]**

As defined in the SDS, this gives the high-level financial view of the project.

* **Charts** :
* Cost by Trade (Pie Chart).
* Cost by Section (Bar Chart).
* **BOQ Items Table** :
* A searchable, paginated table of *all* approved BOQ items across all batches.
* **Columns** : BOQ Ref, Description, Total Executed Qty, Total Cost.
* **Export** : Button to download the full BOQ as Excel/PDF.

#### **3.2. BOQ Item Detail** (

```
BoqItemDetail.tsx
```

) — **[NEW / Phase 2b]**

A deep dive into a specific line item (e.g., "Concrete Grade 30").

* **History** : Timeline showing every batch/request that contributed to this item.
* **Material Breakdown** : If materials were specified, showing the breakdown of resources used for this item.

### Summary of Work

| Page                            | Type              | Logic Complexity                                                              |
| ------------------------------- | ----------------- | ----------------------------------------------------------------------------- |
| **CreateBatch.tsx**       | **Complex** | Needs local state management for the "cart" of items and Excel parsing logic. |
| **BatchReview.tsx**       | **Complex** | Needs logic to handle partial rejections (splitting the batch status).        |
| **MyBatches.tsx**         | Simple            | Standard table with status filters.                                           |
| **PendingBatches.tsx**    | Simple            | Standard table with aggregation queries.                                      |
| **BoqProjectSummary.tsx** | Medium            | mainly data visualization and read-only tables.                               |
