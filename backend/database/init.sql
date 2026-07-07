-- FORCE SCHEMA UPDATE: Drop the old table so it rebuilds with the password column
DROP TABLE IF EXISTS users;

-- 1. Users & Contacts Table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    department TEXT,
    role TEXT DEFAULT 'Requester',
    password TEXT
);

-- 2. Master Transfer Requests Table
CREATE TABLE IF NOT EXISTS transfer_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submitted_by TEXT,
    department TEXT,
    origin_name TEXT,
    origin_address TEXT,
    origin_attn TEXT,
    destination_name TEXT,
    destination_address TEXT,
    destination_attn TEXT,
    shipping_earliest TEXT,
    shipping_latest TEXT,
    receiving_earliest TEXT,
    receiving_latest TEXT,
    status TEXT DEFAULT 'Pending Department Approval',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Material Move Grid Items (Child Table)
CREATE TABLE IF NOT EXISTS material_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER,
    material_number TEXT,
    description TEXT,
    pallets INTEGER,
    pallet_positions INTEGER,
    weight REAL,
    dimensions TEXT,
    FOREIGN KEY(request_id) REFERENCES transfer_requests(id) ON DELETE CASCADE
);

-- 4. Equipment & Project Move Grid Items (Child Table)
CREATE TABLE IF NOT EXISTS equipment_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER,
    project_code TEXT,
    hs_code TEXT,      
    description TEXT,
    pallets INTEGER,
    pallet_positions INTEGER,
    weight REAL,
    dimensions TEXT,
    unit_value REAL,
    manufacturer TEXT,
    serial_number TEXT,
    country_of_origin TEXT,
    FOREIGN KEY(request_id) REFERENCES transfer_requests(id) ON DELETE CASCADE
);

-- 5. Complete Live Timeline Audit Log
CREATE TABLE IF NOT EXISTS approval_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER,
    approver_email TEXT,
    action TEXT, 
    comments TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(request_id) REFERENCES transfer_requests(id) ON DELETE CASCADE
);

-- 6. Seed Initial Authorized Users with Default Passwords
-- (Removed IGNORE so it guarantees a fresh injection into our newly built table)
INSERT INTO users (name, email, role, password) VALUES 
    ('Alexandre Oliveira', 'aoliveira@iceriversprings.com', 'Admin', 'AOliveira@2026!'),
    ('Livia Lima', 'llima@iceriversprings.com', 'Requester', 'IceRiver@2026!'),
    ('Colin Duncan', 'cduncan@iceriversprings.com', 'Requester', 'IceRiver@2026!'),
    ('Jennifer Horner', 'jhorner@bmpextrusion.com', 'Requester', 'IceRiver@2026!'),
    ('William Legere', 'wlegere@bluemountainplastics.com', 'Requester', 'IceRiver@2026!'),
    ('Kyle Strehl', 'kstrehl@iceriversprings.com', 'Requester', 'IceRiver@2026!'),
    ('Conrad Williams', 'conradwilliams@iceriversprings.com', 'Requester', 'IceRiver@2026!'),
    ('Daniel Gagnon', 'dgagnon@iceriversprings.com', 'Requester', 'IceRiver@2026!'),
    ('Ali El-Hourani', 'aelhourani@iceriversprings.com', 'Requester', 'IceRiver@2026!'),
    ('Stephanie Fonseca', 'sfonseca@iceriversprings.com', 'Requester', 'IceRiver@2026!'),
    ('Tara Parker', 'tparker@bluemountainplastics.com', 'Requester', 'IceRiver@2026!'),
    ('Vismay Soni', 'vsoni@iceriversprings.com', 'Requester', 'IceRiver@2026!'),
    ('Renan Lucena', 'rlucena@crplastics.com', 'Requester', 'IceRiver@2026!'),
    ('Durid Awaad', 'dawaad@iceriversprings.com', 'Plant Manager', 'IceRiver@2026!'),
    ('Bill Harper', 'bharper@iceriversprings.com', 'Requester', 'IceRiver@2026!'),
    ('Logistics', 'logistics@iceriversprings.com', 'Dispatcher', 'IceRiver@2026!');