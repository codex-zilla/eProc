-- Add BOQ (Bill of Quantities) fields to material_requests table
-- Phase 1: BOQ-Aligned Material Request System

ALTER TABLE material_requests
    ADD COLUMN boq_reference_code VARCHAR(50),
    ADD COLUMN work_description TEXT,
    ADD COLUMN measurement_unit VARCHAR(20),
    ADD COLUMN rate_estimate DECIMAL(18, 2),
    ADD COLUMN rate_type VARCHAR(30) DEFAULT 'ENGINEER_ESTIMATE',
    ADD COLUMN revision_number INTEGER DEFAULT 1;

-- Index for BOQ code uniqueness check within a project (via site)
-- Helps detect duplicate BOQ items during creation
CREATE INDEX idx_material_requests_boq_code 
    ON material_requests (boq_reference_code, site_id);

-- Index for measurement unit filtering (reporting and analytics)
CREATE INDEX idx_material_requests_measurement_unit 
    ON material_requests (measurement_unit);

-- Note: totalEstimate (quantity × rateEstimate) is NOT persisted
-- It is computed dynamically in the application layer (DTOs)
-- This prevents stale data and keeps source of truth clean

COMMENT ON COLUMN material_requests.boq_reference_code IS 'BOQ item code following pattern BOQ-{section}-{trade}-{sequence}, e.g., BOQ-03-RC-001';
COMMENT ON COLUMN material_requests.work_description IS 'Detailed description of work item, mandatory when boqReferenceCode is set';
COMMENT ON COLUMN material_requests.measurement_unit IS 'Standard measurement unit: m³, m², m, kg, No, LS, ton, bag, bundle, trip, drum, pcs';
COMMENT ON COLUMN material_requests.rate_estimate IS 'Estimated rate per measurement unit';
COMMENT ON COLUMN material_requests.rate_type IS 'Type of rate: ENGINEER_ESTIMATE, MARKET_RATE, or TENDER_RATE';
COMMENT ON COLUMN material_requests.revision_number IS 'BOQ item revision number, incremented on resubmission after rejection';
