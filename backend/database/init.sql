CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(255),
    role ENUM('Admin', 'Dispatcher', 'Plant Manager', 'Requester', 'Read-Only') DEFAULT 'Requester',
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transfer_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    submitted_by VARCHAR(255),
    department VARCHAR(255),
    origin_name VARCHAR(255),
    origin_address VARCHAR(255),
    origin_attn VARCHAR(255),
    destination_name VARCHAR(255),
    destination_address VARCHAR(255),
    destination_attn VARCHAR(255),
    shipping_earliest VARCHAR(255),
    shipping_latest VARCHAR(255),
    receiving_earliest VARCHAR(255),
    receiving_latest VARCHAR(255),
    status VARCHAR(255) DEFAULT 'Pending Department Approval',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS material_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT,
    material_number VARCHAR(255),
    description TEXT,
    pallets INT,
    pallet_positions INT,
    weight DECIMAL(10,2),
    dimensions VARCHAR(255),
    FOREIGN KEY(request_id) REFERENCES transfer_requests(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS equipment_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT,
    project_code VARCHAR(255),
    hs_code VARCHAR(255),
    description TEXT,
    pallets INT,
    pallet_positions INT,
    weight DECIMAL(10,2),
    dimensions VARCHAR(255),
    unit_value DECIMAL(10,2),
    manufacturer VARCHAR(255),
    serial_number VARCHAR(255),
    country_of_origin VARCHAR(255),
    FOREIGN KEY(request_id) REFERENCES transfer_requests(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS approval_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT,
    approver_email VARCHAR(255),
    action VARCHAR(255),
    comments TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(request_id) REFERENCES transfer_requests(id) ON DELETE CASCADE
);