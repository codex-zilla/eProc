INSERT INTO projects (name, owner, currency, budget_total) VALUES 
('Dodoma HQ Construction', 'Government', 'TZS', 1500000000);

INSERT INTO sites (project_id, name, location, budget_cap) 
SELECT id, 'Foundation Phase Site A', 'Dodoma', 500000000 
FROM projects WHERE name = 'Dodoma HQ Construction';

INSERT INTO materials (name, category, default_unit, reference_price) VALUES 
('Simba Cement 42.5N', 'CEMENT', 'BAG', 16000),
('Twiga Cement 32.5N', 'CEMENT', 'BAG', 14500),
('River Sand', 'AGGREGATES', 'TRIP', 120000),
('Y12 Steel Bars', 'STEEL', 'PCS', 22000);
