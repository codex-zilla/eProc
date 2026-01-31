-- Add columns for project-bound user management
-- created_by: tracks which project owner created this user
-- require_password_change: flag for forcing password change on first login

ALTER TABLE users
ADD COLUMN created_by BIGINT,
ADD COLUMN require_password_change BOOLEAN DEFAULT FALSE;

-- Add foreign key constraint for created_by
ALTER TABLE users
ADD CONSTRAINT fk_users_created_by
FOREIGN KEY (created_by) REFERENCES users(id);

-- Add comment for documentation
COMMENT ON COLUMN users.created_by IS 'ID of the project owner who created this user. NULL for self-registered engineers.';
COMMENT ON COLUMN users.require_password_change IS 'Forces password change on next login. Set to true when user is created by project owner with default password.';
