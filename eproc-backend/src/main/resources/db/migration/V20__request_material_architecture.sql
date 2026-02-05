-- V20: Create new Request/Material architecture
-- This migration creates the new tables for the Request/Material refactoring

-- Drop old tables first (they will be replaced by the new architecture)
DROP TABLE IF EXISTS boq_batches CASCADE;
DROP TABLE IF EXISTS material_requests CASCADE;
DROP TABLE IF EXISTS request_audit_logs CASCADE;
DROP TABLE IF EXISTS materials CASCADE;

-- Create requests table
CREATE TABLE requests (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL,
    site_id BIGINT NOT NULL,
    created_by_id BIGINT NOT NULL,
    title VARCHAR(500) NOT NULL,
    planned_start_date TIMESTAMP,
    planned_end_date TIMESTAMP,
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED',
    additional_details TEXT,
    boq_reference_code VARCHAR(50) UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_requests_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_requests_site FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    CONSTRAINT fk_requests_created_by FOREIGN KEY (created_by_id) REFERENCES users(id)
);

-- Create indexes for requests
CREATE INDEX idx_requests_project_id ON requests(project_id);
CREATE INDEX idx_requests_site_id ON requests(site_id);
CREATE INDEX idx_requests_created_by_id ON requests(created_by_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_boq_code ON requests(boq_reference_code);

-- Drop old materials table (catalog)
DROP TABLE IF EXISTS materials CASCADE;

-- Create new materials table (request items)
CREATE TABLE materials (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL,
    name VARCHAR(200) NOT NULL,
    quantity DECIMAL(18, 2) NOT NULL,
    measurement_unit VARCHAR(20) NOT NULL,
    rate_estimate DECIMAL(18, 2) NOT NULL,
    rate_estimate_type VARCHAR(30) NOT NULL DEFAULT 'ENGINEER_ESTIMATE',
    resource_type VARCHAR(20) NOT NULL DEFAULT 'MATERIAL',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    comment TEXT,
    revision_number INTEGER DEFAULT 1,
    audit_data TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_materials_request FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
);

-- Create indexes for materials
CREATE INDEX idx_materials_request_id ON materials(request_id);
CREATE INDEX idx_materials_resource_type ON materials(resource_type);
CREATE INDEX idx_materials_status ON materials(status);

-- Create request_audit_logs table
CREATE TABLE request_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    performed_by_id BIGINT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    CONSTRAINT fk_audit_logs_request FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_audit_logs_user FOREIGN KEY (performed_by_id) REFERENCES users(id)
);

-- Create indexes for audit logs
CREATE INDEX idx_audit_logs_request_id ON request_audit_logs(request_id);
CREATE INDEX idx_audit_logs_timestamp ON request_audit_logs(timestamp);
