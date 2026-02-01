# Software Design Specification: BOQ-Aligned Material Request System

**Project**: eProc - Construction Procurement Management System  
**Feature**: BOQ-Aligned Material Request  
**Version**: 1.0  
**Date**: 2026-02-01  
**Author**: Engineering Team

---

## 1. Executive Summary

This specification defines the refinement of eProc's Material Request workflow to align with industry Bill of Quantities (BOQ) practices. The system transforms from simple item-level requests into structured BOQ Item Requests, enabling cost-visible approvals, scope tracking, and future tender comparisons.

### 1.1 Business Value

- **For Engineers**: Structured work item requests aligned with BOQ methodology
- **For Project Owners**: Cost-impact visibility during approval process
- **For Organization**: BOQ aggregation, variation tracking, and tender analysis capabilities

### 1.2 Industry Alignment

This design maps directly to standard BOQ practices as defined in:

- Standard Method of Measurement (SMM)
- FIDIC contract frameworks
- Tanzania construction procurement standards

---

## 2. System Architecture

### 2.1 Conceptual Shift

**From**: "Engineer requests a material"  
**To**: "Engineer requests approval to execute a quantified portion of work"

Each `MaterialRequest` becomes a **BOQ Line Item Request**, representing:

- Measurable scope of work
- Quantified resources
- Cost estimate
- Timeline

### 2.2 Phased Implementation Strategy

| Phase       | Scope                                                                    | Status  |
| ----------- | ------------------------------------------------------------------------ | ------- |
| **Phase 1** | Add BOQ fields to MaterialRequest entity (non-breaking, optional fields) | Current |
| **Phase 2** | Introduce BOQ entity, aggregation views, reporting                       | Planned |
| **Phase 3** | BOQ locking, variation tracking, tender comparison                       | Future  |

---

## 3. Data Model

### 3.1 MaterialRequest Entity (Enhanced)

```java
@Entity
@Table(name = "material_requests")
public class MaterialRequest {

    // Existing fields (unchanged)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Site site;

    @Column(nullable = false)
    private BigDecimal quantity;

    @Enumerated(EnumType.STRING)
    private RequestStatus status;

    // BOQ Context Fields (NEW)
    @Column(name = "boq_reference_code", length = 50)
    private String boqReferenceCode; // Pattern: BOQ-[0-9]{2}-[A-Z]{2,4}-[0-9]{3}

    @Lob
    @Column(name = "work_description")
    private String workDescription; // Mandatory when boqReferenceCode is set

    // Measurement Fields (NEW)
    @Column(name = "measurement_unit", length = 20)
    private String measurementUnit; // Constrained vocabulary: m³, m², m, kg, No, LS

    // Cost Fields (NEW)
    @Column(name = "rate_estimate", precision = 18, scale = 2)
    private BigDecimal rateEstimate; // Price per measurement unit

    @Column(name = "rate_type", length = 30)
    @Builder.Default
    private String rateType = "ENGINEER_ESTIMATE"; // ENGINEER_ESTIMATE, MARKET_RATE, TENDER_RATE

    // Revision Tracking (NEW)
    @Column(name = "revision_number")
    @Builder.Default
    private Integer revisionNumber = 1; // Incremented on RESUBMITTED

    // Computed field (not persisted initially)
    @Transient
    public BigDecimal getTotalEstimate() {
        if (quantity != null && rateEstimate != null) {
            return quantity.multiply(rateEstimate);
        }
        return BigDecimal.ZERO;
    }
}
```

### 3.2 Database Migration

**File**: `V16__boq_fields_material_request.sql`

```sql
-- Add BOQ-related columns to material_requests table
ALTER TABLE material_requests
    ADD COLUMN boq_reference_code VARCHAR(50),
    ADD COLUMN work_description TEXT,
    ADD COLUMN measurement_unit VARCHAR(20),
    ADD COLUMN rate_estimate DECIMAL(18, 2),
    ADD COLUMN rate_type VARCHAR(30) DEFAULT 'ENGINEER_ESTIMATE',
    ADD COLUMN revision_number INTEGER DEFAULT 1;

-- Index for BOQ code uniqueness within project scope
CREATE INDEX idx_material_requests_boq_code
    ON material_requests (boq_reference_code, site_id);

-- Index for measurement unit filtering
CREATE INDEX idx_material_requests_measurement_unit
    ON material_requests (measurement_unit);

-- Constraint: If boqReferenceCode is set, workDescription must be set
-- (Implemented in application layer, not DB constraint for flexibility)
```

### 3.3 Data Transfer Objects

#### CreateMaterialRequestDTO (Enhanced)

```java
public class CreateMaterialRequestDTO {
    // Existing fields
    @NotNull
    private Long siteId;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal quantity;

    // BOQ fields (all optional in Phase 1)
    @Pattern(regexp = "^BOQ-\\d{2}-[A-Z]{2,4}-\\d{3}$",
             message = "BOQ code must follow pattern: BOQ-{section}-{trade}-{sequence}")
    private String boqReferenceCode;

    @Size(min = 10, max = 5000)
    private String workDescription;

    @Pattern(regexp = "^(m³|m²|m|kg|No|LS|ton|bag|bundle|trip|drum|pcs)$")
    private String measurementUnit;

    @DecimalMin("0.00")
    private BigDecimal rateEstimate;

    private String rateType; // Defaults to ENGINEER_ESTIMATE
}
```

#### MaterialRequestResponseDTO (Enhanced)

```java
public class MaterialRequestResponseDTO {
    // Existing fields
    private Long id;
    private String siteName;
    private BigDecimal quantity;
    private String status;

    // BOQ fields
    private String boqReferenceCode;
    private String workDescription;
    private String measurementUnit;
    private BigDecimal rateEstimate;
    private String rateType;
    private BigDecimal totalEstimate; // Computed: quantity × rateEstimate
    private Integer revisionNumber;
}
```

---

## 4. Business Rules & Validation

### 4.1 BOQ Code Validation

**Pattern**: `BOQ-{section}-{trade}-{sequence}`

- **Section**: 2 digits (01-99)
- **Trade**: 2-4 uppercase letters (RC, EL, PL, etc.)
- **Sequence**: 3 digits (001-999)

**Examples**:

- `BOQ-03-RC-001` → Section 03, Reinforced Concrete, Item 001
- `BOQ-05-EL-012` → Section 05, Electrical, Item 012

**Validation**: Regex enforcement + UI tooltip showing structure

### 4.2 Measurement Unit Constraints

**Allowed Units** (controlled vocabulary):

- `m³` - Cubic Meter
- `m²` - Square Meter
- `m` - Linear Meter
- `kg` - Kilogram
- `ton` - Metric Ton
- `No` - Number (count)
- `LS` - Lump Sum
- `bag` - Bag (for cement, aggregates)
- `bundle` - Bundle (for reinforcement)
- `trip` - Trip (for lorry deliveries)
- `drum` - Drum (for bitumen/asphalt)
- `pcs` - Pieces

**Rationale**: Prevents free-text inconsistencies (`"m3"` vs `"M3"` vs `"cubic meters"`)

### 4.3 BOQ Field Dependencies

**Rule**: If `boqReferenceCode` is provided, then:

- `workDescription` MUST be provided (min 10 characters)
- `measurementUnit` MUST be from allowed list
- `rateEstimate` SHOULD be provided (warning if missing)

**Enforcement**: Service layer validation in `MaterialRequestService.createRequest()`

### 4.4 Revision Tracking

**Trigger**: When a REJECTED request is resubmitted:

1. Status → PENDING
2. `revisionNumber` → incremented
3. `rejectionComment` → cleared
4. Audit log action: `RESUBMITTED`

**Audit Trail Semantics**:

- Revision history represents **BOQ item evolution**, not failure cycles
- Enables tracking scope adjustments over time

---

## 5. User Interface Design

### 5.1 Engineer: Create BOQ Item Request

![BOQ Item Request Form](file:///c:/Users/Codex%20ZIlla/Desktop/zilla/eProc/docs/screens/boq_item_request_form.png)

**Form Sections**:

1. **BOQ Context**
   - Site (dropdown)
   - BOQ Item Code (text input with pattern validation + info icon)
   - Work Description (large textarea, min 10 chars)

2. **Measurement & Quantity**
   - Measurement Unit (dropdown, constrained vocabulary)
   - Quantity (numeric input with stepper)

3. **Cost Information**
   - Rate Estimate (currency input, TZS)
   - Rate Type (dropdown: Engineer Estimate, Market Rate)
   - **Total Estimate** (read-only, computed: Qty × Rate, highlighted)

4. **Material Breakdown** (collapsible, optional)
   - Catalog/Manual toggle
   - Material selection or manual entry

5. **Timeline & Priority**
   - Planned Usage (date range picker)
   - Emergency Flag (toggle)

**UI Enhancements**:

- Info icons (ℹ️) explaining BOQ Code structure and Measurement Units
- Real-time total computation with visual emphasis
- Validation feedback inline

### 5.2 Project Owner: Pending Requests (Enhanced)

**Columns**:

- BOQ Code
- Work Description (truncated)
- Unit & Qty
- **Cost Impact** (Total Estimate, highlighted badge)
- Status
- Actions

**New Feature**: "Cost Impact" badge in each row showing total estimate with color coding:

- Green: < 1M TZS
- Yellow: 1M - 5M TZS
- Orange: > 5M TZS

### 5.3 Project Owner: Request Detail View

**Emphasis on Approval Semantics**:

> **Approval Confirmation Message**:  
> "By approving this request, you authorize the execution of the quantified scope of work with a cost implication of TZS 38,250,000."

This reinforces that approval is not just for "materials" but for **scope + cost**.

---

## 6. Phase 2: BOQ Aggregation Screens (Future)

### 6.1 BOQ Summary Dashboard

![BOQ Aggregation Summary](file:///c:/Users/Codex%20ZIlla/Desktop/zilla/eProc/docs/screens/boq_aggregation_summary.png)

**Purpose**: Project-level BOQ overview

**Features**:

- Statistics by trade (pie chart)
- Cost summary by section (bar chart)
- Request status breakdown (donut chart)
- Detailed BOQ items table with export capability

### 6.2 BOQ Item Detail View

![BOQ Item Detail](file:///c:/Users/Codex%20ZIlla/Desktop/zilla/eProc/docs/screens/boq_item_detail.png)

**Purpose**: Deep-dive into a single BOQ item

**Features**:

- Full work description
- Material breakdown table
- Revision history timeline
- Related documents (BOQ PDF, drawings)
- Action buttons: Create Variation, View in Context

### 6.3 BOQ Rate Comparison (Tender Analysis)

![BOQ Rate Comparison](file:///c:/Users/Codex%20ZIlla/Desktop/zilla/eProc/docs/screens/boq_rate_comparison.png)

**Purpose**: Compare engineer estimates vs contractor tenders

**Features**:

- Multi-column comparison (Engineer + 3 contractors)
- Variance percentage badges (color-coded)
- Total comparison footer
- Export comparison report

---

## 7. API Design

### 7.1 Enhanced Endpoints

#### Create BOQ Item Request

```
POST /api/requests
Authorization: Bearer {engineer_token}

Request Body:
{
  "siteId": 42,
  "boqReferenceCode": "BOQ-03-RC-001",
  "workDescription": "Cast in-situ reinforced concrete slab...",
  "measurementUnit": "m³",
  "quantity": 45.00,
  "rateEstimate": 850000,
  "rateType": "ENGINEER_ESTIMATE",
  "plannedUsageStart": "2026-01-15T08:00:00",
  "plannedUsageEnd": "2026-01-28T17:00:00",
  "emergencyFlag": false
}

Response: 200 OK
{
  "id": 123,
  "boqReferenceCode": "BOQ-03-RC-001",
  "workDescription": "Cast in-situ reinforced concrete slab...",
  "measurementUnit": "m³",
  "quantity": 45.00,
  "rateEstimate": 850000,
  "totalEstimate": 38250000,
  "status": "PENDING",
  "revisionNumber": 1
}
```

#### Get Pending Requests (Owner View)

```
GET /api/requests/pending
Authorization: Bearer {owner_token}

Response: 200 OK
[
  {
    "id": 123,
    "boqReferenceCode": "BOQ-03-RC-001",
    "workDescription": "Cast in-situ reinforced concrete slab",
    "measurementUnit": "m³",
    "quantity": 45.00,
    "rateEstimate": 850000,
    "totalEstimate": 38250000,
    "status": "PENDING",
    "requestedByName": "John Mkamba",
    "createdAt": "2026-01-10T09:30:00"
  }
]
```

### 7.2 Future Endpoints (Phase 2)

```
GET /api/projects/{id}/boq-summary
GET /api/requests/{id}/revisions
GET /api/boq/compare-tenders?projectId={id}
```

---

## 8. Testing Strategy

### 8.1 Unit Tests

**Backend Service Tests**:

- `MaterialRequestServiceTest.createRequest_withBoqFields_success()`
- `MaterialRequestServiceTest.validateBoqCode_invalidPattern_throws()`
- `MaterialRequestServiceTest.validateMeasurementUnit_invalidUnit_throws()`
- `MaterialRequestServiceTest.totalEstimate_computation_correct()`
- `MaterialRequestServiceTest.revisionNumber_incrementsOnResubmit()`

### 8.2 Integration Tests

**File**: `RequestControllerIntegrationTest.java`

**New Test Cases**:

1. `createRequest_withCompleteBoqData_success()`
2. `createRequest_boqCodeWithoutDescription_fails()`
3. `createRequest_invalidMeasurementUnit_fails()`
4. `updateRequest_incrementsRevisionNumber()`
5. `approval_message_includesCostImplication()`

### 8.3 Manual UI Testing

**Test Scenario 1: Create BOQ Item Request**

1. Login as Engineer
2. Navigate to Create Request
3. Fill BOQ Code: `BOQ-03-RC-001`
4. Enter Work Description (min 10 chars)
5. Select Measurement Unit: `m³`
6. Enter Quantity: `45`
7. Enter Rate: `850000`
8. **Verify**: Total auto-calculates to `38,250,000`
9. Submit
10. **Verify**: Request appears in Pending queue with BOQ code visible

**Test Scenario 2: Owner Approval with Cost Visibility**

1. Login as Project Owner
2. View Pending Requests
3. **Verify**: Cost Impact badge visible for each request
4. Open request detail
5. **Verify**: Total Estimate prominently displayed
6. **Verify**: Approval confirmation mentions cost implication
7. Approve
8. **Verify**: Audit log shows approval with cost snapshot

---

## 9. CMMS Market Alignment

### 9.1 Feature Comparison

| Feature                         | eProc (Phase 1) | Industry CMMS | Gap     |
| ------------------------------- | --------------- | ------------- | ------- |
| BOQ Line Item Tracking          | ✅              | ✅            | None    |
| Structured Item Codes           | ✅              | ✅            | None    |
| Measurement Units (SMM-aligned) | ✅              | ✅            | None    |
| Cost Estimation per Item        | ✅              | ✅            | None    |
| Approval with Cost Visibility   | ✅              | ✅            | None    |
| Revision Tracking               | ✅              | ✅            | None    |
| BOQ Aggregation                 | ⏳ Phase 2      | ✅            | Planned |
| Tender Comparison               | ⏳ Phase 2      | ✅            | Planned |
| Variation Orders                | ⏳ Phase 3      | ✅            | Future  |

### 9.2 Competitive Positioning

**eProc's Differentiators**:

- Offline-first design (critical for Tanzania)
- WhatsApp integration for approvals
- Mobile-first UX
- Tanzania-specific units (trips, lorry loads)

**Industry Parity Achieved**:

- BOQ structure and semantics
- Cost-visible approvals
- Revision tracking
- Standard measurement units

---

## 10. Security & Compliance

### 10.1 Authorization

**BOQ Item Request Creation**:

- Role: `ENGINEER`
- Constraint: Engineer must be assigned to the project

**BOQ Item Approval**:

- Role: `PROJECT_OWNER`
- Constraint: Owner must own the project
- Audit: Log includes cost snapshot (`totalEstimate`)

### 10.2 Data Integrity

**BOQ Code Uniqueness**:

- Within a project, BOQ codes should be unique (enforced at service layer)
- Index: `idx_material_requests_boq_code`

**Revision Immutability**:

- Revision numbers are incremental only (never decremented)
- Audit logs preserve historical rate/quantity values

### 10.3 Tanzania eGA Compliance

**Audit Trail Requirements**:

- All BOQ item approvals logged with:
  - Actor (Project Owner)
  - Cost implication (`totalEstimate`)
  - Timestamp
  - Decision rationale (for rejections)

**Transparency**:

- BOQ summaries exportable to Excel/PDF
- Supports public procurement audit requirements

---

## 11. Performance Considerations

### 11.1 Computed Fields

**totalEstimate Calculation**:

- **Phase 1**: Computed in-memory (DTO layer)
- **Phase 2**: Consider materialized view for reporting queries
- **Rationale**: Avoids stale data; keeps source of truth (quantity, rate) clean

### 11.2 Indexing Strategy

**Critical Indexes**:

- `idx_material_requests_boq_code` - For duplicate checks
- `idx_material_requests_measurement_unit` - For filtering/reporting
- `idx_material_requests_status` - Existing, critical for pending queue

### 11.3 Pagination

**BOQ Items Table**:

- Default page size: 20 items
- Max page size: 100 items
- Sort: by `boqReferenceCode` ASC (default)

---

## 12. Future Enhancements (Phase 2+)

### 12.1 BOQ Entity

```java
@Entity
@Table(name = "boqs")
public class BOQ {
    @Id
    private Long id;

    @ManyToOne
    private Project project;

    private String version; // e.g., "1.0", "1.1"

    @Enumerated(EnumType.STRING)
    private BOQStatus status; // DRAFT, SUBMITTED, APPROVED, LOCKED

    @ManyToOne
    private User preparedBy;

    @ManyToOne
    private User approvedBy;

    @OneToMany(mappedBy = "boq")
    private List<MaterialRequest> items;
}
```

### 12.2 Variation Orders

**Concept**: When a BOQ item needs modification post-approval:

- Create a "Variation" entity linked to original request
- Track delta (quantity, rate)
- Require additional approval workflow

### 12.3 Tender Rate Import

**Feature**: Import contractor tender rates via Excel

- Match by BOQ code
- Compare against engineer estimates
- Generate variance reports

---

## 13. Appendices

### 13.1 Glossary

| Term              | Definition                                                           |
| ----------------- | -------------------------------------------------------------------- |
| **BOQ**           | Bill of Quantities - itemized list of work with quantities and rates |
| **BOQ Line Item** | Single row in a BOQ representing measurable work                     |
| **SMM**           | Standard Method of Measurement - industry measurement standards      |
| **Lump Sum (LS)** | Fixed price for a complete work item, not measured by unit           |
| **Variation**     | Change to approved BOQ item (scope, quantity, or rate)               |

### 13.2 References

1. **Industry Standards**:
   - Standard Method of Measurement (SMM)
   - FIDIC contracts (Red Book, Yellow Book)
2. **Tanzania Context**:
   - eGA Standards (e-Government Authority)
   - Public Procurement Act
3. **Internal Documentation**:
   - [docs/workflows.md](file:///c:/Users/Codex%20ZIlla/Desktop/zilla/eProc/docs/workflows.md)
   - [docs/data-model.md](file:///c:/Users/Codex%20ZIlla/Desktop/zilla/eProc/docs/data-model.md)
   - [docs/tanzania-context.md](file:///c:/Users/Codex%20ZIlla/Desktop/zilla/eProc/docs/tanzania-context.md)

### 13.3 Change Log

| Version | Date       | Author           | Changes                                      |
| ------- | ---------- | ---------------- | -------------------------------------------- |
| 1.0     | 2026-02-01 | Engineering Team | Initial SDS for BOQ-aligned Material Request |

---

**End of Software Design Specification**
