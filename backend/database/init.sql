CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM(
        'Admin',
        'Logistics',
        'Department Manager',
        'Supply Chain',
        'Demand Planning',
        'Customer Service',
        'Requester',
        'Read-Only'
    ) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plant_name VARCHAR(100) NOT NULL,
    plant_manager_id INT,
    FOREIGN KEY (plant_manager_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS trials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trial_ref VARCHAR(20) UNIQUE,
    title VARCHAR(255) NOT NULL,
    initiator_id INT,
    target_plant_id INT,
    product_category VARCHAR(100),
    suppliers_involved TEXT,
    scope_of_trial TEXT,
    business_case TEXT,
    target_date DATE,
    scheduled_start DATE DEFAULT NULL,
    scheduled_end DATE DEFAULT NULL,
    status ENUM(
        'PENDING_QUOTE',
        'PENDING_MANAGER_APPROVAL',
        'PENDING_SUPPLY_CHAIN_APPROVAL',
        'PENDING_CONDITIONAL_APPROVAL',
        'READY_FOR_DISPATCH',
        'IN_TRANSIT',
        'COMPLETED',
        'REJECTED'
    ) DEFAULT 'PENDING_QUOTE',
    initial_exec_comment TEXT,
    value_conf_comment TEXT,
    plant_mgr_comment TEXT,
    planning_comment TEXT,
    final_exec_comment TEXT,
    qa_closeout_comment TEXT,
    quality_notes TEXT,
    qa_checklist JSON,
    executive_id INT,
    plant_manager_id INT,
    quality_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (initiator_id) REFERENCES users (id),
    FOREIGN KEY (target_plant_id) REFERENCES plants (id)
);

CREATE TABLE IF NOT EXISTS trial_updates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trial_id INT NOT NULL,
    user_id INT NOT NULL,
    update_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trial_id) REFERENCES trials (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS trial_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trial_id INT NOT NULL,
    uploader_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trial_id) REFERENCES trials (id) ON DELETE CASCADE,
    FOREIGN KEY (uploader_id) REFERENCES users (id)
);

-- Force update in case the table is cached
ALTER TABLE users
MODIFY COLUMN role ENUM(
    'Admin',
    'Logistics',
    'Department Manager',
    'Supply Chain',
    'Demand Planning',
    'Customer Service',
    'Requester',
    'Read-Only'
) NOT NULL;

ALTER TABLE trials
MODIFY COLUMN status ENUM(
    'PENDING_QUOTE',
    'PENDING_MANAGER_APPROVAL',
    'PENDING_SUPPLY_CHAIN_APPROVAL',
    'PENDING_CONDITIONAL_APPROVAL',
    'READY_FOR_DISPATCH',
    'IN_TRANSIT',
    'COMPLETED',
    'REJECTED'
) DEFAULT 'PENDING_QUOTE';