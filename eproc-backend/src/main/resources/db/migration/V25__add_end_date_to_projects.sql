-- Add optional end_date column to track project completion dates explicitly
ALTER TABLE projects ADD COLUMN end_date DATE;
