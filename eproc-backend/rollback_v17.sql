-- Rollback script for V17 migration
-- This will clean up any V17 changes that were previously applied

-- Drop tables if they exist (from old V17)
DROP TABLE IF EXISTS request_attachments CASCADE;
DROP TABLE IF EXISTS boq_batches CASCADE;

-- Remove batch_id column from material_requests if it exists
ALTER TABLE material_requests DROP COLUMN IF EXISTS batch_id;

-- Note: After running this, you should also run Flyway repair to clean the schema history
