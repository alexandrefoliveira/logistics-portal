// ==========================================
// DATABASE INITIALIZATION
// ==========================================
async function initializeDatabase() {
  console.log("Checking database connection...");
  let retries = 5;
  while (retries > 0) {
    try {
      await pool.query("SELECT 1");
      console.log("MySQL is awake! Building tables...");
      break;
    } catch (error) {
      retries -= 1;
      console.log("Waiting for MySQL...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  try {
    // Users Table (UPDATED WITH LOGISTICS ROLES)
    await pool.query(
      `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        full_name VARCHAR(100) NOT NULL, 
        email VARCHAR(100) UNIQUE NOT NULL, 
        password VARCHAR(255) NOT NULL, 
        role ENUM('Admin', 'Executive', 'Management', 'Logistics Coordinator', 'Requester', 'Read-Only') NOT NULL DEFAULT 'Requester', 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reset_token VARCHAR(255) DEFAULT NULL,
        reset_token_expires DATETIME DEFAULT NULL
      )`
    );

    try {
      await pool.query(
        "ALTER TABLE users MODIFY COLUMN role ENUM('Admin', 'Executive', 'Management', 'Logistics Coordinator', 'Requester', 'Read-Only') NOT NULL"
      );
      console.log("SUCCESS: Database users ENUM synchronized.");
    } catch (e) {
      console.log("Role update skipped or already applied.");
    }

    // Transfers Table (Unified for Equipment and Materials)
    await pool.query(
      `CREATE TABLE IF NOT EXISTS transfers (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        request_code VARCHAR(20) UNIQUE NOT NULL,
        type ENUM('Equipment', 'Material') NOT NULL,
        initiator_id INT NOT NULL, 
        status VARCHAR(50) DEFAULT 'Pending Logistics Quote', 
        origin VARCHAR(100), 
        dest VARCHAR(100), 
        shipping_earliest DATETIME, 
        shipping_latest DATETIME, 
        pallets INT, 
        pallet_positions INT, 
        weight DECIMAL(10,2), 
        dimensions VARCHAR(100), 
        carrier VARCHAR(100), 
        description TEXT,
        equip_id VARCHAR(100),
        project_code VARCHAR(100),
        hs_code VARCHAR(100),
        unit_value DECIMAL(10,2),
        material_number VARCHAR(100),
        batch_code VARCHAR(100),
        secured_rate DECIMAL(10,2) DEFAULT NULL,
        attachment_name VARCHAR(255),
        attachment_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (initiator_id) REFERENCES users(id)
      )`
    );

    // Logs & Comments Table
    await pool.query(
      `CREATE TABLE IF NOT EXISTS logs (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        transfer_id INT NOT NULL, 
        user_id INT NOT NULL, 
        text TEXT NOT NULL, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (transfer_id) REFERENCES transfers(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`
    );

    // Create Initial Accounts
    const adminPass = await bcrypt.hash("AOliveira@2026!", 10);
    const teamPass = await bcrypt.hash("Logistics2026!", 10);

    const teamMembers = [
      ["Alexandre Oliveira", "aoliveira@iceriversprings.com", adminPass, "Admin"],
      ["Dominick", "dominick@iceriversprings.com", teamPass, "Requester"],
      ["Kevin", "kevin@iceriversprings.com", teamPass, "Requester"],
      ["Nathan", "nathan@iceriversprings.com", teamPass, "Requester"],
      ["John Fudge", "jfudge@iceriversprings.com", teamPass, "Requester"],
      ["Mitch Flynn", "mflynn@iceriversprings.com", teamPass, "Requester"],
      ["Stacy Draper", "sdraper@iceriversprings.com", teamPass, "Requester"],
      ["Mark Hamilton", "mhamilton@iceriversprings.com", teamPass, "Requester"],
      ["Stephanie Fonseca", "sfonseca@iceriversprings.com", teamPass, "Requester"],
      ["Steven Phillips", "sphillips@iceriversprings.com", teamPass, "Requester"],
      ["Colin Duncan", "cduncan@iceriversprings.com", teamPass, "Requester"],
      ["Ali El-Hourani", "aelhourani@iceriversprings.com", teamPass, "Requester"],
      ["Daniel Gagnon", "dgagnon@iceriversprings.com", teamPass, "Requester"],
      ["Kyle Strehl", "kstrehl@iceriversprings.com", teamPass, "Requester"],
      ["Conrad Williams", "cwilliams@iceriversprings.com", teamPass, "Requester"],
      ["Durid Awaad", "dawaad@iceriversprings.com", teamPass, "Requester"],
      ["William Legere", "wlegere@iceriversprings.com", teamPass, "Requester"],
      ["Jennifer Horner", "JHorner@bmpextrusion.com", teamPass, "Requester"],
      ["Mike Bodkin", "mbodkin@iceriversprings.com", teamPass, "Requester"],
      ["Crystal Howe", "chowe@iceriversprings.com", teamPass, "Requester"],
      ["Clark Haw", "chaw@iceriversprings.com", teamPass, "Requester"]
    ];

    for (const member of teamMembers) {
      await pool.query(
        `INSERT IGNORE INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)`,
        member
      );
    }

    console.log("✅ Database tables verified and accounts seeded!");
  } catch (error) {
    console.error("Failed to build tables:", error);
  }
}