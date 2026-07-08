const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-corporate-key-2026";

// 1. Database Connection (Using your reference logic)
const pool = mysql.createPool({
  host: process.env.DB_HOST || "db",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "logistics.IceRiver@2026!",
  database: process.env.DB_NAME || "logistics_portal",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Security Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token)
    return res
      .status(401)
      .json({ status: "Error", message: "Access Denied: No Token Provided" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err)
      return res
        .status(403)
        .json({ status: "Error", message: "Invalid or Expired Token" });
    req.user = user;
    next();
  });
};

// 2. Fortified Logistics Database Initialization
async function initializeDatabase() {
  console.log("Checking database connection...");
  let retries = 15;
  while (retries > 0) {
    try {
      await pool.query("SELECT 1");
      console.log("MySQL is awake! Building Logistics tables...");
      break;
    } catch (error) {
      retries -= 1;
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  try {
    // Build tables
    await pool.query(
      `CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, department VARCHAR(255), role VARCHAR(100) DEFAULT 'Requester', password VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    );

    // --- SELF-HEALING: Destroy any ghost/duplicate rows created by earlier testing ---
    try {
      await pool.query(`
        DELETE t1 FROM users t1
        INNER JOIN users t2 
        WHERE t1.id > t2.id AND t1.email = t2.email
      `);
      console.log("Database deduplication complete. Ghost rows purged.");

      // Force the UNIQUE constraint so duplicates are mathematically impossible moving forward
      await pool.query(`ALTER TABLE users ADD UNIQUE (email)`);
    } catch (dedupError) {
      // If the unique constraint already exists, it skips quietly
    }

    await pool.query(
      `CREATE TABLE IF NOT EXISTS transfer_requests (id INT AUTO_INCREMENT PRIMARY KEY, submitted_by VARCHAR(255), department VARCHAR(255), origin_name VARCHAR(255), origin_address VARCHAR(255), origin_attn VARCHAR(255), destination_name VARCHAR(255), destination_address VARCHAR(255), destination_attn VARCHAR(255), shipping_earliest VARCHAR(255), shipping_latest VARCHAR(255), receiving_earliest VARCHAR(255), receiving_latest VARCHAR(255), status VARCHAR(255) DEFAULT 'Pending Department Approval', timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    );
    await pool.query(
      `CREATE TABLE IF NOT EXISTS material_items (id INT AUTO_INCREMENT PRIMARY KEY, request_id INT, material_number VARCHAR(255), description TEXT, pallets INT, pallet_positions INT, weight DECIMAL(10,2), dimensions VARCHAR(255), FOREIGN KEY(request_id) REFERENCES transfer_requests(id) ON DELETE CASCADE)`,
    );
    await pool.query(
      `CREATE TABLE IF NOT EXISTS equipment_items (id INT AUTO_INCREMENT PRIMARY KEY, request_id INT, project_code VARCHAR(255), hs_code VARCHAR(255), description TEXT, pallets INT, pallet_positions INT, weight DECIMAL(10,2), dimensions VARCHAR(255), unit_value DECIMAL(10,2), manufacturer VARCHAR(255), serial_number VARCHAR(255), country_of_origin VARCHAR(255), FOREIGN KEY(request_id) REFERENCES transfer_requests(id) ON DELETE CASCADE)`,
    );
    await pool.query(
      `CREATE TABLE IF NOT EXISTS approval_logs (id INT AUTO_INCREMENT PRIMARY KEY, request_id INT, approver_email VARCHAR(255), action VARCHAR(255), comments TEXT, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(request_id) REFERENCES transfer_requests(id) ON DELETE CASCADE)`,
    );

    // Reference Project Seeding Logic
    const [rows] = await pool.query(`SELECT COUNT(*) AS count FROM users`);
    if (rows[0].count === 0) {
      console.log("Database is empty. Seeding secure logistics accounts...");
      const teamPass = await bcrypt.hash("IceRiver@2026!", 10);
      const logisticsUsers = [
        [
          "Alexandre Oliveira",
          "aoliveira@iceriversprings.com",
          "Admin",
          teamPass,
        ],
        ["Livia Lima", "llima@iceriversprings.com", "Requester", teamPass],
        ["Colin Duncan", "cduncan@iceriversprings.com", "Requester", teamPass],
        ["Jennifer Horner", "jhorner@bmpextrusion.com", "Requester", teamPass],
        [
          "William Legere",
          "wlegere@bluemountainplastics.com",
          "Requester",
          teamPass,
        ],
        ["Kyle Strehl", "kstrehl@iceriversprings.com", "Requester", teamPass],
        [
          "Conrad Williams",
          "conradwilliams@iceriversprings.com",
          "Requester",
          teamPass,
        ],
        ["Daniel Gagnon", "dgagnon@iceriversprings.com", "Requester", teamPass],
        [
          "Ali El-Hourani",
          "aelhourani@iceriversprings.com",
          "Requester",
          teamPass,
        ],
        [
          "Stephanie Fonseca",
          "sfonseca@iceriversprings.com",
          "Requester",
          teamPass,
        ],
        [
          "Tara Parker",
          "tparker@bluemountainplastics.com",
          "Requester",
          teamPass,
        ],
        ["Vismay Soni", "vsoni@iceriversprings.com", "Requester", teamPass],
        ["Renan Lucena", "rlucena@crplastics.com", "Requester", teamPass],
        [
          "Durid Awaad",
          "dawaad@iceriversprings.com",
          "Plant Manager",
          teamPass,
        ],
        ["Bill Harper", "bharper@iceriversprings.com", "Requester", teamPass],
        ["Logistics", "logistics@iceriversprings.com", "Dispatcher", teamPass],
      ];

      for (const member of logisticsUsers) {
        await pool.query(
          `INSERT IGNORE INTO users (name, email, role, password) VALUES (?, ?, ?, ?)`,
          member,
        );
      }
      console.log("Accounts successfully seeded!");
    } else {
      console.log(
        `Database verified: ${rows[0].count} users already exist. Skipping seed.`,
      );
    }
  } catch (error) {
    console.error("Failed to build tables:", error);
  }
}

// 3. Login API (Directly from Reference Project)
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await pool.query(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email.toLowerCase().trim()],
    );
    if (users.length === 0)
      return res
        .status(401)
        .json({ status: "Error", message: "Invalid credentials" });

    const validPassword = await bcrypt.compare(password, users[0].password);
    if (!validPassword)
      return res
        .status(401)
        .json({ status: "Error", message: "Invalid credentials" });

    const user = {
      id: users[0].id,
      name: users[0].name,
      email: users[0].email,
      role: users[0].role,
    };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "8h" });

    res.json({ status: "Success", user, token });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ status: "Error", message: "Database error" });
  }
});

// 4. Change Password API
app.put("/api/users/:id/password", authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (String(req.params.id) !== String(req.user.id)) {
    return res
      .status(403)
      .json({ status: "Error", message: "Unauthorized action." });
  }

  try {
    // Pull the user's current record
    const [users] = await pool.query(
      "SELECT email, password FROM users WHERE id = ? LIMIT 1",
      [req.params.id],
    );
    if (users.length === 0)
      return res
        .status(404)
        .json({ status: "Error", message: "User not found." });

    // Validate old password
    const validPassword = await bcrypt.compare(
      currentPassword,
      users[0].password,
    );
    if (!validPassword)
      return res
        .status(400)
        .json({ status: "Error", message: "Incorrect current password." });

    // Hash and Save the new password (Updating by EMAIL guarantees all ghosts are squashed)
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = ? WHERE email = ?", [
      hashedNewPassword,
      users[0].email,
    ]);

    res.json({ status: "Success", message: "Password successfully updated." });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ status: "Error", message: "Database error." });
  }
});

// 5. Get Users API
app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name AS full_name, email, role, created_at FROM users",
    );
    res.json({ status: "Success", data: rows });
  } catch (error) {
    res
      .status(500)
      .json({ status: "Error", message: "Database fetch failed." });
  }
});

app.listen(PORT, async () => {
  console.log(`Logistics API running on port ${PORT}`);
  await initializeDatabase();
});
