-- V11: Advanced Project Entity - New tables and columns
-- Adds: User fields, Project fields, and 4 new child tables

-- ============================================================
-- 1. User table additions
-- ============================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS title VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS erb_number VARCHAR(50);

-- ============================================================
-- 2. Projects table additions
-- ============================================================
ALTER TABLE projects ADD COLUMN IF NOT EXISTS code VARCHAR(50) UNIQUE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS industry VARCHAR(50);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type VARCHAR(50);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS owner_rep_name VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS owner_rep_contact VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS plot_number VARCHAR(100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS gps_coordinates VARCHAR(100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS title_deed_available BOOLEAN;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS site_access_notes TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS key_objectives TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS expected_output TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS expected_completion_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS contract_type VARCHAR(50);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS defects_liability_period INTEGER;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS performance_security_required BOOLEAN;

-- ============================================================
-- 3. Project Assignments table (Team)
-- ============================================================
CREATE TABLE IF NOT EXISTS project_assignments (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    responsibility_level VARCHAR(50) NOT NULL DEFAULT 'FULL',
    reporting_line VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_project_assignments_project ON project_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_user ON project_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_active ON project_assignments(project_id, is_active);

-- ============================================================
-- 4. Project Scopes table
-- ============================================================
CREATE TABLE IF NOT EXISTS project_scopes (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    is_included BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_scopes_project ON project_scopes(project_id);

-- ============================================================
-- 5. Project Milestones table
-- ============================================================
CREATE TABLE IF NOT EXISTS project_milestones (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    deadline DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    approval_required BOOLEAN DEFAULT FALSE,
    approved_by_id BIGINT REFERENCES users(id),
    approved_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_milestones_project ON project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_deadline ON project_milestones(project_id, deadline);

-- ============================================================
-- 6. Project Documents table
-- ============================================================
CREATE TABLE IF NOT EXISTS project_documents (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    uploaded_by_id BIGINT REFERENCES users(id),
    file_size BIGINT,
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_documents_project ON project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_type ON project_documents(project_id, type);
