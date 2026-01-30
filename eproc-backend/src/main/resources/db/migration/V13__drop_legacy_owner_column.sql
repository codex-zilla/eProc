-- Fix: Remove not-null constraint from legacy 'owner' column if it exists
-- The owner_id column should be used instead

ALTER TABLE projects DROP COLUMN IF EXISTS owner;
