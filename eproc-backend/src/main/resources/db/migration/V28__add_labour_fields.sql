-- V28: Add labour-specific fields to materials table
-- numberOfLabourers: how many workers are needed
-- numberOfDays: how many working days they are required
-- These are nullable so existing MATERIAL rows are unaffected.
-- For LABOUR items: quantity is auto-computed = numberOfLabourers * numberOfDays

ALTER TABLE materials
    ADD COLUMN number_of_labourers INT NULL,
    ADD COLUMN number_of_days DECIMAL(8, 2) NULL;
