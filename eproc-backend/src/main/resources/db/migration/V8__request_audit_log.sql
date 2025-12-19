-- ============================================================
-- V8: Request Audit Trail
-- Tracks all status changes on material requests for transparency
-- ============================================================

CREATE TABLE request_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL REFERENCES material_requests(id) ON DELETE CASCADE,
    actor_id BIGINT NOT NULL REFERENCES users(id),
    action VARCHAR(20) NOT NULL,
    status_snapshot VARCHAR(20),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for efficient history lookups
CREATE INDEX idx_audit_request_id ON request_audit_logs(request_id);
CREATE INDEX idx_audit_actor_id ON request_audit_logs(actor_id);
CREATE INDEX idx_audit_created_at ON request_audit_logs(created_at);
