-- Add resource_type column to material_requests table
-- This enables Material vs Labour categorization for BOQ cost breakdowns

ALTER TABLE material_requests 
ADD COLUMN resource_type VARCHAR(20) DEFAULT 'MATERIAL';

-- Update existing records to have a default value
UPDATE material_requests 
SET resource_type = 'MATERIAL' 
WHERE resource_type IS NULL;

-- Make the column non-nullable after setting defaults
ALTER TABLE material_requests 
ALTER COLUMN resource_type SET NOT NULL;
