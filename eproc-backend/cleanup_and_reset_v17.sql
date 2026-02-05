-- Step 1: Remove the failed V17 migration from Flyway history
DELETE FROM flyway_schema_history WHERE version = '17';

-- Step 2: Drop any tables that might have been created by old V17
DROP TABLE IF EXISTS request_attachments CASCADE;
DROP TABLE IF EXISTS boq_batches CASCADE;

-- Step 3: Remove batch_id column from material_requests if it exists
ALTER TABLE material_requests DROP COLUMN IF EXISTS batch_id;

-- After running this script, restart your Spring Boot application
-- The V17 migration will be applied fresh
