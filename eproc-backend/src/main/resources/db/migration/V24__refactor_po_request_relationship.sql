-- Refactor PurchaseOrder-Request Relationship

-- 1. Add request_id to purchase_orders (initially nullable)
ALTER TABLE purchase_orders ADD COLUMN request_id BIGINT;

-- 2. Migrate data: Populate request_id from purchase_order_items
-- We take the request_id from the first item of the PO
UPDATE purchase_orders po
SET request_id = (SELECT poi.request_id FROM purchase_order_items poi WHERE poi.purchase_order_id = po.id LIMIT 1)
WHERE request_id IS NULL;

-- 3. Handle data inconsistencies: If there are POs with no items or items with no request (shouldn't happen with valid data)
-- For now, we assume data is consistent or we allow deletion of orphans if strict integrity is needed.
-- But given this is a refactor on existing data, we'll enforce NOT NULL now.
-- If this fails, there is data corruption that needs manual fixing.
ALTER TABLE purchase_orders ALTER COLUMN request_id SET NOT NULL;

-- 4. Add Constraints
ALTER TABLE purchase_orders
    ADD CONSTRAINT fk_purchase_orders_request
    FOREIGN KEY (request_id)
    REFERENCES requests (id);

-- 5. Drop request_id from purchase_order_items
ALTER TABLE purchase_order_items DROP COLUMN request_id;
