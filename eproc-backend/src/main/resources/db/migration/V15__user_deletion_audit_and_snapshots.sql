-- Migration V15: User Deletion Audit and Snapshot References
-- Purpose: Enable hard deletion of users while preserving audit trail and historical transaction references

-- Create user_deletion_audit table to store snapshots of deleted users
CREATE TABLE user_deletion_audit (
    id BIGSERIAL PRIMARY KEY,
    deleted_user_id BIGINT NOT NULL,
    deleted_user_email VARCHAR(255) NOT NULL,
    deleted_user_name VARCHAR(255) NOT NULL,
    deleted_user_role VARCHAR(50) NOT NULL,
    deleted_user_phone VARCHAR(50),
    deleted_user_title VARCHAR(255),
    deleted_user_erb_number VARCHAR(100),
    was_active BOOLEAN NOT NULL DEFAULT FALSE,
    active_project_count INTEGER NOT NULL DEFAULT 0,
    deleted_by BIGINT NOT NULL,
    deleted_by_email VARCHAR(255) NOT NULL,
    deleted_by_name VARCHAR(255) NOT NULL,
    deleted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deletion_reason TEXT,
    CONSTRAINT fk_user_deletion_audit_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id)
);

-- Create index for faster lookups
CREATE INDEX idx_user_deletion_audit_deleted_user_id ON user_deletion_audit(deleted_user_id);
CREATE INDEX idx_user_deletion_audit_deleted_user_email ON user_deletion_audit(deleted_user_email);
CREATE INDEX idx_user_deletion_audit_deleted_by ON user_deletion_audit(deleted_by);
CREATE INDEX idx_user_deletion_audit_deleted_at ON user_deletion_audit(deleted_at);

-- Add deleted_user_snapshot_id column to project_assignments
ALTER TABLE project_assignments 
ADD COLUMN deleted_user_snapshot_id BIGINT,
ADD CONSTRAINT fk_project_assignments_deleted_user_snapshot 
    FOREIGN KEY (deleted_user_snapshot_id) REFERENCES user_deletion_audit(id);

-- Make user_id nullable in project_assignments to allow historical preservation
ALTER TABLE project_assignments 
ALTER COLUMN user_id DROP NOT NULL;

-- Add deleted_user_snapshot_id column to material_requests
ALTER TABLE material_requests 
ADD COLUMN deleted_user_snapshot_id BIGINT,
ADD CONSTRAINT fk_material_requests_deleted_user_snapshot 
    FOREIGN KEY (deleted_user_snapshot_id) REFERENCES user_deletion_audit(id);

-- Create index for snapshot references
CREATE INDEX idx_project_assignments_deleted_user_snapshot ON project_assignments(deleted_user_snapshot_id);
CREATE INDEX idx_material_requests_deleted_user_snapshot ON material_requests(deleted_user_snapshot_id);

-- Add comment to explain the strategy
COMMENT ON TABLE user_deletion_audit IS 'Audit trail for deleted users. Preserves user information after hard deletion to maintain transaction history and audit compliance.';
COMMENT ON COLUMN project_assignments.deleted_user_snapshot_id IS 'Reference to user deletion audit record if the assigned user was deleted. Used to retrieve historical user information.';
COMMENT ON COLUMN material_requests.deleted_user_snapshot_id IS 'Reference to user deletion audit record if the requesting user was deleted. Used to retrieve historical user information.';
