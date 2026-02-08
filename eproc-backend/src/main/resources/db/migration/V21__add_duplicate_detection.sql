-- Add duplicate detection fields to requests table
ALTER TABLE requests
ADD COLUMN is_duplicate_flagged BOOLEAN DEFAULT FALSE,
ADD COLUMN duplicate_explanation TEXT,
ADD COLUMN duplicate_of_request_id BIGINT;

-- Add foreign key constraint
ALTER TABLE requests
ADD CONSTRAINT fk_duplicate_of_request 
    FOREIGN KEY (duplicate_of_request_id) 
    REFERENCES requests(id) 
    ON DELETE SET NULL;

-- Create index for duplicate detection queries
CREATE INDEX idx_requests_duplicate_check 
ON requests(site_id, status, planned_start_date, planned_end_date)
WHERE status IN ('PENDING', 'SUBMITTED', 'APPROVED', 'PARTIALLY_APPROVED');

-- Create index on material names for case-insensitive search (if not exists)
CREATE INDEX IF NOT EXISTS idx_materials_name_lower 
ON materials(LOWER(name));
