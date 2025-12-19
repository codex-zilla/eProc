-- ============================================================
-- V7: ADR Project-Centric Authorization
-- Adds boss_id, engineer_id, status to projects for scoped access control
-- ============================================================

-- Add boss_id column (FK to users - the project owner/manager)
ALTER TABLE projects ADD COLUMN boss_id BIGINT REFERENCES users(id);

-- Add engineer_id column (FK to users - the assigned engineer, nullable)
ALTER TABLE projects ADD COLUMN engineer_id BIGINT REFERENCES users(id);

-- Add status column for project lifecycle
ALTER TABLE projects ADD COLUMN status VARCHAR(20) DEFAULT 'ACTIVE';

-- Add active flag to users for soft-delete capability
ALTER TABLE users ADD COLUMN active BOOLEAN DEFAULT TRUE;

-- Create indexes for efficient lookups
CREATE INDEX idx_projects_boss_id ON projects(boss_id);
CREATE INDEX idx_projects_engineer_id ON projects(engineer_id);
CREATE INDEX idx_projects_status ON projects(status);

-- ============================================================
-- Backfill boss_id from existing owner field
-- Assumes owner field contains email addresses
-- ============================================================
UPDATE projects p
SET boss_id = u.id
FROM users u
WHERE p.owner = u.email
AND p.boss_id IS NULL;

-- Alternative: If owner contains names instead of emails
UPDATE projects p
SET boss_id = u.id
FROM users u
WHERE p.owner = u.name
AND p.boss_id IS NULL
AND NOT EXISTS (SELECT 1 FROM users u2 WHERE p.owner = u2.email);
