-- Fix id column type to match Java Long (BIGINT)
ALTER TABLE users ALTER COLUMN id TYPE BIGINT;
