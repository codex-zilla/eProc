-- V27: Add expected_delivery_date to purchase_orders
-- Auto-populated to created_at + 7 days via application @PrePersist logic.
-- Backfill existing rows so no NULLs remain after migration.

ALTER TABLE purchase_orders
    ADD COLUMN IF NOT EXISTS expected_delivery_date TIMESTAMP;

-- Backfill: existing POs get expected_delivery_date = created_at + 7 days
UPDATE purchase_orders
SET expected_delivery_date = created_at + INTERVAL '7 days'
WHERE expected_delivery_date IS NULL;
