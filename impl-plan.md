BOQ-Aligned Material Request: Implementation Plan
1. Goal Description
Refine the Material Request workflow to align with industry Bill of Quantities (BOQ) practices. This transforms 
MaterialRequest
 from a simple item-level request into a BOQ Item Request, enabling:

Scope and cost visibility for Project Owners during review.
Structured tracking of quantities against work items.
Future BOQ aggregation and variation tracking.
IMPORTANT

This is an additive, non-breaking change. Existing functionality is preserved; new fields are optional during Phase 1.

2. UI/UX Wireframe
The new "Create BOQ Item Request" form is structured into distinct sections:

BOQ Item Request Form Wireframe
Review
BOQ Item Request Form Wireframe

Key Sections:

BOQ Context: Site, BOQ Item Code, Work Description.
Measurement & Quantity: Unit dropdown, Quantity.
Cost Information: Rate Estimate, Auto-calculated Total.
Material Breakdown (Optional): Collapsible; preserves existing catalog/manual toggle.
Key Sections:

BOQ Context: Site, BOQ Item Code, Work Description.
Measurement & Quantity: Unit dropdown, Quantity.
Cost Information: Rate Estimate, Auto-calculated Total.
Material Breakdown (Optional): Collapsible; preserves existing catalog/manual toggle.
3. Proposed Changes
Backend Component
[MODIFY] 
MaterialRequest.java
Add BOQ-aligned fields to the entity:

// BOQ Context
@Column(name = "boq_reference_code", length = 50)
private String boqReferenceCode; // Pattern: BOQ-{section}-{trade}-{sequence}
@Lob
@Column(name = "work_description")
private String workDescription; // Mandatory when boqReferenceCode is set
// Measurement & Cost
@Column(name = "measurement_unit", length = 20)
private String measurementUnit; // Constrained: m³, m², m, kg, No, LS, ton, bag, bundle, trip, drum, pcs
@Column(name = "rate_estimate", precision = 18, scale = 2)
private BigDecimal rateEstimate; // Price per measurement unit
@Column(name = "rate_type", length = 30)
@Builder.Default
private String rateType = "ENGINEER_ESTIMATE"; // ENGINEER_ESTIMATE, MARKET_RATE, TENDER_RATE
// Revision Tracking
@Column(name = "revision_number")
@Builder.Default
private Integer revisionNumber = 1; // Incremented on RESUBMITTED
// Computed field (NOT persisted - computed in DTO)
@Transient
public BigDecimal getTotalEstimate() {
    if (quantity != null && rateEstimate != null) {
        return quantity.multiply(rateEstimate);
    }
    return BigDecimal.ZERO;
}
[NEW] 
V_XX__boq_fields_material_request.sql
Flyway migration to add new columns:

ALTER TABLE material_requests
    ADD COLUMN boq_reference_code VARCHAR(50),
    ADD COLUMN work_description TEXT,
    ADD COLUMN measurement_unit VARCHAR(20),
    ADD COLUMN rate_estimate DECIMAL(18, 2),
    ADD COLUMN rate_type VARCHAR(30) DEFAULT 'ENGINEER_ESTIMATE',
    ADD COLUMN revision_number INTEGER DEFAULT 1;
-- Index for BOQ code uniqueness check within a project
CREATE INDEX idx_material_requests_boq_code ON material_requests (boq_reference_code, site_id);
-- Index for measurement unit filtering (reporting)
CREATE INDEX idx_material_requests_measurement_unit ON material_requests (measurement_unit);
-- Note: totalEstimate is NOT persisted; computed in application layer
[MODIFY] 
CreateMaterialRequestDTO.java
Add new fields to the DTO:

@Pattern(regexp = "^BOQ-\\d{2}-[A-Z]{2,4}-\\d{3}$", 
         message = "BOQ code must follow pattern: BOQ-{section}-{trade}-{sequence}")
private String boqReferenceCode;
@Size(min = 10, max = 5000)
private String workDescription;
@Pattern(regexp = "^(m³|m²|m|kg|No|LS|ton|bag|bundle|trip|drum|pcs)$",
         message = "Invalid measurement unit")
private String measurementUnit;
@DecimalMin("0.00")
private BigDecimal rateEstimate;
private String rateType; // Defaults to ENGINEER_ESTIMATE if not provided
[MODIFY] 
MaterialRequestResponseDTO.java
Add new fields and computed totalEstimate:

private String boqReferenceCode;
private String workDescription;
private String measurementUnit;
private BigDecimal rateEstimate;
private String rateType; // ENGINEER_ESTIMATE, MARKET_RATE, TENDER_RATE
private Integer revisionNumber;
private BigDecimal totalEstimate; // Computed: quantity × rateEstimate (NOT persisted)
[MODIFY] 
MaterialRequestService.java
Update 
createRequest
 and 
updateRequest
 to handle new fields.
Compute totalEstimate in 
mapToResponseDTO
 (quantity × rateEstimate).
Validation Rules:
If boqReferenceCode is provided → workDescription (min 10 chars) and measurementUnit MUST be provided
measurementUnit must be from constrained vocabulary (reject invalid units)
boqReferenceCode must match pattern: ^BOQ-\d{2}-[A-Z]{2,4}-\d{3}$
Revision Tracking: When status changes from REJECTED → PENDING (resubmission), increment revisionNumber
Rate Type: Default to ENGINEER_ESTIMATE if not provided
Frontend Component
[MODIFY] 
models.ts
Add BOQ fields to 
MaterialRequest
 and CreateMaterialRequest interfaces:

// In MaterialRequest interface
boqReferenceCode?: string;
workDescription?: string;
measurementUnit?: string; // Constrained vocabulary
rateEstimate?: number;
rateType?: string; // 'ENGINEER_ESTIMATE' | 'MARKET_RATE' | 'TENDER_RATE'
revisionNumber?: number;
totalEstimate?: number; // Computed
// In CreateMaterialRequest interface
boqReferenceCode?: string; // Pattern: BOQ-XX-XXXX-XXX
workDescription?: string; // Min 10 chars if boqReferenceCode is set
measurementUnit?: string; // Dropdown with allowed values
rateEstimate?: number;
rateType?: string;
[MODIFY] 
CreateRequest.tsx
Refactor the form to match the BOQ wireframe:

Add Section Headers: "BOQ Context", "Measurement & Quantity", "Cost Information", "Material Breakdown".
New Fields:
boqReferenceCode (text input with pattern validation + tooltip: "BOQ-{section}-{trade}-{sequence}")
workDescription (textarea, min 10 chars)
measurementUnit (dropdown with constrained values: m³, m², m, kg, No, LS, ton, bag, bundle, trip, drum, pcs)
rateType (dropdown: Engineer Estimate, Market Rate, Tender Rate)
rateEstimate (currency input)
Computed Total: Display quantity × rateEstimate in real-time, read-only field, visually emphasized
Info Icons (ℹ️): Add tooltips explaining BOQ Code structure and Measurement Unit options
Make Material Breakdown a collapsible, optional section.
[MODIFY] 
RequestDetailsManager.tsx
 & 
PendingRequests.tsx
Display boqReferenceCode, workDescription, measurementUnit, rateEstimate, rateType, revisionNumber, and totalEstimate in the review screen.
Emphasize Cost Impact:
Add "Cost Impact" badge in PendingRequests table (color-coded by amount)
Show approval confirmation message: "By approving this request, you authorize the execution of the quantified scope of work with a cost implication of TZS {totalEstimate}."
Display revision history if revisionNumber > 1
4. Verification Plan
Automated Tests
Backend Integration Tests
File: 
RequestControllerIntegrationTest.java

New Test Cases to Add:

createRequest_withBoqFields_success(): Create a request with all BOQ fields and verify they are saved and returned.
createRequest_boqCodeWithoutDescription_fails(): Ensure validation rejects incomplete BOQ data.
createRequest_invalidBoqCodePattern_fails(): Reject BOQ codes not matching ^BOQ-\d{2}-[A-Z]{2,4}-\d{3}$
createRequest_invalidMeasurementUnit_fails(): Reject units not in constrained vocabulary.
totalEstimate_isCorrectlyComputed(): Verify quantity × rateEstimate calculation.
updateRequest_rejected_incrementsRevisionNumber(): Verify revision tracking on resubmission.
Command to Run:

cd c:\Users\Codex ZIlla\Desktop\zilla\eProc\eproc-backend
mvn test -Dtest=RequestControllerIntegrationTest
Manual Verification
Frontend Flow Test (User)
Log in as an Engineer.
Navigate to "Create Request".
Fill in the BOQ Context section (Site, BOQ Code, Work Description).
Fill in Measurement & Quantity (select Unit, enter Quantity).
Fill in Cost Information (enter Rate Estimate).
Verify: The "Total Estimate" field auto-calculates and displays Quantity × Rate.
Submit the request.
Log in as Project Owner.
Navigate to "Pending Requests".
Verify: The new request shows BOQ Code, Work Description, Unit, Quantity, Rate, and Total prominently.
5. Phased Rollout
Phase	Scope	Risk
Phase 1 (Current)	Add BOQ fields to entity, DTO, UI. Fields are optional. Treat each request as a BOQ item.	Low: Non-breaking, additive.
Phase 2	Introduce BOQ table. Group requests by BOQ.	Medium: Schema change.
Phase 3	Lock BOQ after approval. Link requests to execution tracking.	High: Workflow change.
6. CMMS/eProc Market Alignment
This refinement aligns eProc with standard Construction Management and Maintenance System (CMMS) expectations:

Feature	eProc (Post-Refinement)	Industry Standard
BOQ Line Item Tracking	✅ via boqReferenceCode	✅
Quantity + Unit Measurement	✅ via measurementUnit, quantity	✅
Cost Estimation per Item	✅ via rateEstimate, totalEstimate	✅
Work Description	✅ via workDescription	✅
Approval with Cost Visibility	✅ Owner sees totalEstimate	✅
Variation Tracking (Future)	⏳ Phase 2/3	✅
