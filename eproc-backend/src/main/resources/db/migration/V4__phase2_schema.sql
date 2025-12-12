CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner VARCHAR(255) NOT NULL,
    currency VARCHAR(10) DEFAULT 'TZS',
    budget_total NUMERIC(19, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sites (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    budget_cap NUMERIC(19, 2),
    gps_center VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE work_packages (
    id BIGSERIAL PRIMARY KEY,
    site_id BIGINT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    stage VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE materials (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    default_unit VARCHAR(50) NOT NULL,
    unit_type VARCHAR(50),
    reference_price NUMERIC(19, 2),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE material_requests (
    id BIGSERIAL PRIMARY KEY,
    site_id BIGINT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    work_package_id BIGINT REFERENCES work_packages(id),
    material_id BIGINT REFERENCES materials(id),
    manual_material_name VARCHAR(255),
    manual_unit VARCHAR(50),
    manual_estimated_price NUMERIC(19, 2),
    quantity NUMERIC(19, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_sites_project_id ON sites(project_id);
CREATE INDEX idx_work_packages_site_id ON work_packages(site_id);
CREATE INDEX idx_material_requests_site_id ON material_requests(site_id);
