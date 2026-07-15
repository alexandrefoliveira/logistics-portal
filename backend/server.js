const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer"); // NEW: File upload library
const fs = require("fs"); // NEW: File system library
const path = require("path"); // NEW: Path library
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// NEW: Create an uploads directory and configure static file serving
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use("/uploads", express.static(uploadDir));

// NEW: Configure Multer storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});
const upload = multer({ storage: storage });

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-corporate-key-2026";

// 1. Database Connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || "db",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "logistics.IceRiver@2026!",
  database: process.env.DB_NAME || "logistics_portal",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token)
    return res.status(401).json({ status: "Error", message: "Access Denied" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err)
      return res
        .status(403)
        .json({ status: "Error", message: "Invalid Token" });
    req.user = user;
    next();
  });
};

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
    await pool.query(
      `CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, department VARCHAR(255), role VARCHAR(100) DEFAULT 'Requester', password VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    );
    try {
      await pool.query(
        `DELETE t1 FROM users t1 INNER JOIN users t2 WHERE t1.id > t2.id AND t1.email = t2.email`,
      );
      await pool.query(`ALTER TABLE users ADD UNIQUE (email)`);
    } catch (dedupError) {}

    await pool.query(
      `CREATE TABLE IF NOT EXISTS transfer_requests (id INT AUTO_INCREMENT PRIMARY KEY, tracking_number VARCHAR(50), submitted_by VARCHAR(255), department VARCHAR(255), origin_name VARCHAR(255), origin_address VARCHAR(255), origin_attn VARCHAR(255), destination_name VARCHAR(255), destination_address VARCHAR(255), destination_attn VARCHAR(255), shipping_earliest VARCHAR(255), shipping_latest VARCHAR(255), receiving_earliest VARCHAR(255), receiving_latest VARCHAR(255), status VARCHAR(255) DEFAULT 'Pending Executive Approval', timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    );

    // Migration checks for new columns
    try {
      await pool.query(
        "ALTER TABLE transfer_requests ADD COLUMN tracking_number VARCHAR(50)",
      );
    } catch (e) {}
    try {
      await pool.query(
        "ALTER TABLE transfer_requests ADD COLUMN attachment_name VARCHAR(255)",
      );
    } catch (e) {}
    try {
      await pool.query(
        "ALTER TABLE transfer_requests ADD COLUMN attachment_url VARCHAR(255)",
      );
    } catch (e) {}

    await pool.query(
      `CREATE TABLE IF NOT EXISTS material_items (id INT AUTO_INCREMENT PRIMARY KEY, request_id INT, material_number VARCHAR(255), description TEXT, pallets INT, pallet_positions INT, weight DECIMAL(10,2), dimensions VARCHAR(255), FOREIGN KEY(request_id) REFERENCES transfer_requests(id) ON DELETE CASCADE)`,
    );
    await pool.query(
      `CREATE TABLE IF NOT EXISTS equipment_items (id INT AUTO_INCREMENT PRIMARY KEY, request_id INT, project_code VARCHAR(255), hs_code VARCHAR(255), description TEXT, pallets INT, pallet_positions INT, weight DECIMAL(10,2), dimensions VARCHAR(255), unit_value DECIMAL(10,2), manufacturer VARCHAR(255), serial_number VARCHAR(255), country_of_origin VARCHAR(255), FOREIGN KEY(request_id) REFERENCES transfer_requests(id) ON DELETE CASCADE)`,
    );
    await pool.query(
      `CREATE TABLE IF NOT EXISTS approval_logs (id INT AUTO_INCREMENT PRIMARY KEY, request_id INT, approver_email VARCHAR(255), action VARCHAR(255), comments TEXT, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(request_id) REFERENCES transfer_requests(id) ON DELETE CASCADE)`,
    );

    const [rows] = await pool.query(`SELECT COUNT(*) AS count FROM users`);
    if (rows[0].count === 0) {
      console.log(
        "Database is empty. Seeding secure accounts with new workflow roles...",
      );
      const teamPass = await bcrypt.hash("IceRiver@2026!", 10);

      const logisticsUsers = [
        [
          "Alexandre Oliveira",
          "aoliveira@iceriversprings.com",
          "Admin",
          teamPass,
        ],
        [
          "Ali El-Hourani",
          "aelhourani@iceriversprings.com",
          "Executive",
          teamPass,
        ],
        [
          "Livia Lima",
          "llima@iceriversprings.com",
          "Quality Auditor",
          teamPass,
        ],
        [
          "Durid Awaad",
          "dawaad@iceriversprings.com",
          "Plant Manager",
          teamPass,
        ],
        ["Colin Duncan", "cduncan@iceriversprings.com", "Planner", teamPass],
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
        ["Bill Harper", "bharper@iceriversprings.com", "Requester", teamPass],
      ];

      for (const member of logisticsUsers) {
        await pool.query(
          `INSERT IGNORE INTO users (name, email, role, password) VALUES (?, ?, ?, ?)`,
          member,
        );
      }
      console.log("Accounts successfully seeded!");
    }
  } catch (error) {
    console.error("Failed to build tables:", error);
  }
}

// --- SECURE API ENDPOINTS ---
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
    res.status(500).json({ status: "Error", message: "Database error" });
  }
});

app.post("/api/register", async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password)
    return res
      .status(400)
      .json({ status: "Error", message: "All fields are required." });
  try {
    const [existingUser] = await pool.query(
      "SELECT email FROM users WHERE email = ? LIMIT 1",
      [email.toLowerCase().trim()],
    );
    if (existingUser.length > 0)
      return res
        .status(400)
        .json({
          status: "Error",
          message: "An account with this email already exists.",
        });
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'Requester')",
      [fullName, email.toLowerCase().trim(), hashedPassword],
    );
    const [newUser] = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = ?",
      [result.insertId],
    );
    const user = {
      id: newUser[0].id,
      name: newUser[0].name,
      email: newUser[0].email,
      role: newUser[0].role,
    };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "8h" });
    res.json({ status: "Success", user, token });
  } catch (error) {
    res
      .status(500)
      .json({
        status: "Error",
        message: "Database error during registration.",
      });
  }
});

app.put("/api/users/:id/password", authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (String(req.params.id) !== String(req.user.id))
    return res
      .status(403)
      .json({ status: "Error", message: "Unauthorized action." });
  try {
    const [users] = await pool.query(
      "SELECT email, password FROM users WHERE id = ? LIMIT 1",
      [req.params.id],
    );
    if (users.length === 0)
      return res
        .status(404)
        .json({ status: "Error", message: "User not found." });
    const validPassword = await bcrypt.compare(
      currentPassword,
      users[0].password,
    );
    if (!validPassword)
      return res
        .status(400)
        .json({ status: "Error", message: "Incorrect current password." });
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = ? WHERE email = ?", [
      hashedNewPassword,
      users[0].email,
    ]);
    res.json({ status: "Success", message: "Password successfully updated." });
  } catch (error) {
    res.status(500).json({ status: "Error", message: "Database error." });
  }
});

app.put("/api/users/:id/role", authenticateToken, async (req, res) => {
  if (req.user.role !== "Admin") {
    return res
      .status(403)
      .json({ status: "Error", message: "Only Admins can change roles." });
  }
  const { role } = req.body;
  try {
    await pool.query("UPDATE users SET role = ? WHERE id = ?", [
      role,
      req.params.id,
    ]);
    res.json({ status: "Success", message: "Role successfully updated." });
  } catch (error) {
    console.error("Role Update Error:", error);
    res.status(500).json({ status: "Error", message: "Database error." });
  }
});

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

app.get("/api/dashboard-stats", authenticateToken, async (req, res) => {
  try {
    const [pending] = await pool.query(
      "SELECT COUNT(*) as count FROM transfer_requests WHERE status LIKE '%Pending%'",
    );
    const [completed] = await pool.query(
      "SELECT COUNT(*) as count FROM transfer_requests WHERE status = 'COMPLETED'",
    );
    const [active] = await pool.query(
      "SELECT COUNT(*) as count FROM transfer_requests WHERE status NOT LIKE '%Pending%' AND status NOT IN ('COMPLETED', 'REJECTED')",
    );

    const [facilityData] = await pool.query(
      `SELECT COALESCE(destination_name, 'TBD') as name, COUNT(*) as value FROM transfer_requests WHERE destination_name != '' AND destination_name IS NOT NULL GROUP BY destination_name`,
    );
    const [statusData] = await pool.query(
      `SELECT CASE WHEN status LIKE '%Pending%' THEN 'Pending' WHEN status = 'COMPLETED' THEN 'Completed' WHEN status = 'REJECTED' THEN 'Rejected' ELSE 'Active' END as name, COUNT(*) as Transfers FROM transfer_requests GROUP BY name`,
    );

    res.json({
      status: "Success",
      data: {
        metrics: {
          pending: pending[0].count,
          active: active[0].count,
          completed: completed[0].count,
        },
        facilityData:
          facilityData.length > 0
            ? facilityData
            : [{ name: "No Data", value: 1 }],
        statusData:
          statusData.length > 0
            ? statusData
            : [{ name: "No Data", Transfers: 0 }],
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "Error", message: "Failed to fetch dashboard stats." });
  }
});

// --- CORE DATA PIPELINE (UPDATED WITH MULTER UPLOAD) ---
app.post(
  "/api/equipment-transfers",
  authenticateToken,
  upload.single("file"),
  async (req, res) => {
    const {
      originName,
      destName,
      shippingEarliest,
      shippingLatest,
      equipId,
      projectCode,
      hsCode,
      unitValue,
      description,
      pallets,
      weight,
      dimensions,
      carrier,
    } = req.body;

    // Capture File Info
    const attachmentName = req.file ? req.file.originalname : null;
    const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let randomStr = "";
      for (let i = 0; i < 6; i++)
        randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
      const trackingNumber = `TRX-${randomStr}`;

      const [transferResult] = await connection.query(
        `INSERT INTO transfer_requests (tracking_number, submitted_by, status, origin_name, destination_name, shipping_earliest, shipping_latest, attachment_name, attachment_url) VALUES (?, ?, 'Pending Executive Approval', ?, ?, ?, ?, ?, ?)`,
        [
          trackingNumber,
          req.user.email,
          originName,
          destName,
          shippingEarliest,
          shippingLatest,
          attachmentName,
          attachmentUrl,
        ],
      );

      const newRequestId = transferResult.insertId;

      await connection.query(
        `INSERT INTO equipment_items (request_id, project_code, hs_code, description, pallets, weight, dimensions, unit_value) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newRequestId,
          projectCode,
          hsCode,
          description,
          pallets,
          weight,
          dimensions,
          unitValue || 0,
        ],
      );

      await connection.query(
        `INSERT INTO approval_logs (request_id, approver_email, action, comments) VALUES (?, ?, 'Submitted', 'Initial equipment move request submitted.')`,
        [newRequestId, req.user.email],
      );

      await connection.commit();
      res.json({
        status: "Success",
        message: "Equipment Move successfully submitted!",
        requestId: trackingNumber,
      });
    } catch (error) {
      await connection.rollback();
      res
        .status(500)
        .json({
          status: "Error",
          message: "Failed to save the transfer request.",
        });
    } finally {
      connection.release();
    }
  },
);

app.get("/api/transfers", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        COALESCE(t.tracking_number, CONCAT('TRX-', LPAD(t.id, 4, '0'))) AS id, 
        t.id AS raw_id, 
        'Equipment' AS type, 
        COALESCE(t.origin_name, 'TBD') AS origin, 
        COALESCE(t.destination_name, 'TBD') AS dest, 
        COALESCE(u.name, t.submitted_by) AS initiator, 
        DATE_FORMAT(t.timestamp, '%b %d, %Y') AS date, 
        t.status,
        t.attachment_name AS attachmentName,
        t.attachment_url AS attachmentUrl
      FROM transfer_requests t LEFT JOIN users u ON t.submitted_by = u.email ORDER BY t.timestamp DESC
    `);
    res.json({ status: "Success", data: rows });
  } catch (error) {
    res
      .status(500)
      .json({ status: "Error", message: "Failed to fetch registry data." });
  }
});

// --- WORKFLOW & ACTIVITY FEED ---
app.post("/api/transfers/:id/logs", authenticateToken, async (req, res) => {
  const { text } = req.body;
  const requestId = req.params.id;
  try {
    await pool.query(
      `INSERT INTO approval_logs (request_id, approver_email, action, comments) VALUES (?, ?, 'Commented', ?)`,
      [requestId, req.user.email, text],
    );
    res.json({ status: "Success", message: "Update posted successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ status: "Error", message: "Failed to post update." });
  }
});

app.get("/api/transfers/:id/logs", authenticateToken, async (req, res) => {
  const requestId = req.params.id;
  try {
    const [logs] = await pool.query(
      `
      SELECT a.id, u.name AS user_name, a.action, a.comments AS text, DATE_FORMAT(a.timestamp, '%b %d, %Y - %h:%i %p') AS date
      FROM approval_logs a LEFT JOIN users u ON a.approver_email = u.email WHERE a.request_id = ? ORDER BY a.timestamp DESC
    `,
      [requestId],
    );
    res.json({ status: "Success", data: logs });
  } catch (error) {
    res
      .status(500)
      .json({ status: "Error", message: "Failed to fetch activity feed." });
  }
});

app.put("/api/transfers/:id/status", authenticateToken, async (req, res) => {
  const { action, comment } = req.body;
  const requestId = req.params.id;
  const userRole = req.user.role;

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const [transfer] = await connection.query(
      "SELECT status FROM transfer_requests WHERE id = ?",
      [requestId],
    );
    if (transfer.length === 0) throw new Error("Transfer not found");

    const currentStatus = transfer[0].status;

    const rbacPermissions = {
      "Pending Executive Approval": ["Executive"],
      "Pending Quality Value Confirmation": ["Quality Auditor"],
      "Pending Plant Manager Coordination": ["Plant Manager"],
      "Pending Planning & Scheduling": ["Planner"],
      "Pending Execution & Lab Reporting": ["Plant Manager"],
      "Pending Final Executive Sign-Off": ["Executive"],
      "Pending Quality Assurance Close-Out": ["Quality Auditor"],
    };

    const isAuthorized =
      userRole === "Admin" ||
      (rbacPermissions[currentStatus] &&
        rbacPermissions[currentStatus].includes(userRole));

    if (!isAuthorized) {
      await connection.rollback();
      connection.release();
      return res
        .status(403)
        .json({
          status: "Error",
          message: `Access Denied: Your role (${userRole}) is not authorized to approve this step.`,
        });
    }

    let newStatus = currentStatus;

    if (action === "Reject") {
      newStatus = "REJECTED";
    } else if (action === "Approve") {
      const statusFlow = {
        "Pending Executive Approval": "Pending Quality Value Confirmation",
        "Pending Quality Value Confirmation":
          "Pending Plant Manager Coordination",
        "Pending Plant Manager Coordination": "Pending Planning & Scheduling",
        "Pending Planning & Scheduling": "Pending Execution & Lab Reporting",
        "Pending Execution & Lab Reporting": "Pending Final Executive Sign-Off",
        "Pending Final Executive Sign-Off":
          "Pending Quality Assurance Close-Out",
        "Pending Quality Assurance Close-Out": "COMPLETED",
      };
      newStatus = statusFlow[currentStatus] || "COMPLETED";
    }

    await connection.query(
      "UPDATE transfer_requests SET status = ? WHERE id = ?",
      [newStatus, requestId],
    );

    const decisionLog = comment
      ? `Workflow Decision (${action}): ${comment}`
      : `System: Transfer officially ${action.toLowerCase()}d. Moved to: ${newStatus}`;

    await connection.query(
      `INSERT INTO approval_logs (request_id, approver_email, action, comments) VALUES (?, ?, ?, ?)`,
      [requestId, req.user.email, action, decisionLog],
    );

    await connection.commit();
    res.json({ status: "Success", newStatus });
  } catch (error) {
    await connection.rollback();
    res
      .status(500)
      .json({ status: "Error", message: "Failed to update status." });
  } finally {
    connection.release();
  }
});

app.listen(PORT, async () => {
  console.log(`Logistics API running on port ${PORT}`);
  await initializeDatabase();
});
