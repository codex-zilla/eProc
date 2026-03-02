-- Retrospectively assign the current date to existing completed or cancelled projects
UPDATE projects 
SET end_date = CURRENT_DATE 
WHERE status IN ('CANCELLED', 'COMPLETED') 
AND end_date IS NULL;
