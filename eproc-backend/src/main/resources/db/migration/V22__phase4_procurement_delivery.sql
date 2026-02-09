-- V23: Phase 4 - Procurement and Delivery tables
-- Creates tables for Purchase Orders and Deliveries

-- Purchase Orders table
CREATE TABLE purchase_orders (
    id BIGSERIAL PRIMARY KEY,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    project_id BIGINT NOT NULL,
    site_id BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    vendor_name VARCHAR(255),
    notes TEXT,
    total_value DECIMAL(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_id BIGINT NOT NULL,
    CONSTRAINT fk_po_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_po_site FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE SET NULL,
    CONSTRAINT fk_po_created_by FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_po_project ON purchase_orders(project_id);
CREATE INDEX idx_po_site ON purchase_orders(site_id);
CREATE INDEX idx_po_status ON purchase_orders(status);
CREATE INDEX idx_po_number ON purchase_orders(po_number);

-- Purchase Order Items table
CREATE TABLE purchase_order_items (
    id BIGSERIAL PRIMARY KEY,
    purchase_order_id BIGINT NOT NULL,
    request_id BIGINT NOT NULL,
    material_display_name VARCHAR(255) NOT NULL,
    ordered_qty DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    total_price DECIMAL(15, 2) NOT NULL,
    total_delivered DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_poi_purchase_order FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_poi_request FOREIGN KEY (request_id) REFERENCES materials(id) ON DELETE RESTRICT
);

CREATE INDEX idx_poi_purchase_order ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_poi_request ON purchase_order_items(request_id);

-- Deliveries table
CREATE TABLE deliveries (
    id BIGSERIAL PRIMARY KEY,
    purchase_order_id BIGINT NOT NULL,
    delivered_date TIMESTAMP NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    received_by_id BIGINT NOT NULL,
    CONSTRAINT fk_delivery_purchase_order FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_delivery_received_by FOREIGN KEY (received_by_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_delivery_purchase_order ON deliveries(purchase_order_id);
CREATE INDEX idx_delivery_date ON deliveries(delivered_date);

-- Delivery Items table
CREATE TABLE delivery_items (
    id BIGSERIAL PRIMARY KEY,
    delivery_id BIGINT NOT NULL,
    purchase_order_item_id BIGINT NOT NULL,
    quantity_delivered DECIMAL(10, 2) NOT NULL,
    condition VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_di_delivery FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
    CONSTRAINT fk_di_purchase_order_item FOREIGN KEY (purchase_order_item_id) REFERENCES purchase_order_items(id) ON DELETE RESTRICT
);

CREATE INDEX idx_di_delivery ON delivery_items(delivery_id);
CREATE INDEX idx_di_purchase_order_item ON delivery_items(purchase_order_item_id);
