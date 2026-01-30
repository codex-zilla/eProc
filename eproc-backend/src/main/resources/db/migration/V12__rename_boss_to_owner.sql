-- Rename boss_id to owner_id to match ProjectRole nomenclature
ALTER TABLE projects RENAME COLUMN boss_id TO owner_id;

-- Rename index if exists
ALTER INDEX IF EXISTS idx_projects_boss_id RENAME TO idx_projects_owner_id;

-- Drop deprecated columns that are no longer in the details
ALTER TABLE projects DROP COLUMN IF EXISTS engineer_id;
ALTER TABLE projects DROP COLUMN IF EXISTS owner_email;
