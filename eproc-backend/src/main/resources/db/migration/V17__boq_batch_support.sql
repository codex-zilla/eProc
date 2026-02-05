-- Migration: Add BOQ Batch support
-- Version: V17
-- Description: Create boq_batches and request_attachments tables, add batch_id to material_requests

-- Create boq_batches table
CREATE TABLE boq_batches (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_by_id BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    CONSTRAINT chk_batch_status CHECK (status IN ('DRAFT', 'SUBMITTED', 'PARTIALLY_APPROVED', 'APPROVED', 'REJECTED', 'CLOSED'))
);

-- Create indexes for boq_batches
CREATE INDEX idx_boq_batches_project_id ON boq_batches(project_id);
CREATE INDEX idx_boq_batches_created_by_id ON boq_batches(created_by_id);
CREATE INDEX idx_boq_batches_status ON boq_batches(status);
CREATE INDEX idx_boq_batches_created_at ON boq_batches(created_at DESC);

-- Create request_attachments table
CREATE TABLE request_attachments (
    id BIGSERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    batch_id BIGINT REFERENCES boq_batches(id) ON DELETE CASCADE,
    request_id BIGINT REFERENCES material_requests(id) ON DELETE CASCADE,
    uploaded_by_id BIGINT NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_attachment_ownership CHECK (
        (batch_id IS NOT NULL AND request_id IS NULL) OR
        (batch_id IS NULL AND request_id IS NOT NULL)
    )
);

-- Create indexes for request_attachments
CREATE INDEX idx_request_attachments_batch_id ON request_attachments(batch_id);
CREATE INDEX idx_request_attachments_request_id ON request_attachments(request_id);
CREATE INDEX idx_request_attachments_uploaded_by_id ON request_attachments(uploaded_by_id);

-- Add batch_id column to material_requests table
ALTER TABLE material_requests
ADD COLUMN batch_id BIGINT REFERENCES boq_batches(id) ON DELETE SET NULL;

-- Create index for batch_id in material_requests
CREATE INDEX idx_material_requests_batch_id ON material_requests(batch_id);

-- Add comments for documentation
COMMENT ON TABLE boq_batches IS 'Groups multiple material requests into a single batch submission (BOQ-style)';
COMMENT ON TABLE request_attachments IS 'Stores metadata for files attached to batches or individual requests';
COMMENT ON COLUMN material_requests.batch_id IS 'Reference to the batch this request belongs to (nullable for standalone requests)';
