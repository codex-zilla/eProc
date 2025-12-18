-- Phase 3: Add request lifecycle fields to material_requests

-- Add planned usage window columns
ALTER TABLE material_requests 
ADD COLUMN planned_usage_start TIMESTAMP,
ADD COLUMN planned_usage_end TIMESTAMP;

-- Add requester reference
ALTER TABLE material_requests 
ADD COLUMN requested_by_id BIGINT REFERENCES users(id);

-- Add rejection comment for rejected requests
ALTER TABLE material_requests 
ADD COLUMN rejection_comment TEXT;

-- Add emergency flag for urgent requests
ALTER TABLE material_requests 
ADD COLUMN emergency_flag BOOLEAN DEFAULT FALSE;

-- Add updated_at for tracking modifications (resubmissions)
ALTER TABLE material_requests 
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Index for duplicate detection with overlapping usage windows
-- Query pattern: same site + same material + overlapping dates
CREATE INDEX idx_material_requests_duplicate_check 
ON material_requests(site_id, material_id, planned_usage_start, planned_usage_end);

-- Index for manual material name duplicate detection
CREATE INDEX idx_material_requests_manual_duplicate 
ON material_requests(site_id, manual_material_name, planned_usage_start, planned_usage_end);

-- Index for approval queue (pending requests)
CREATE INDEX idx_material_requests_status ON material_requests(status);

-- Index for user's own requests
CREATE INDEX idx_material_requests_requester ON material_requests(requested_by_id);
