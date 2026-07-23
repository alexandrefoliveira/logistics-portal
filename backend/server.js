const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();

// Socket.io Setup
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-corporate-key-2026";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use("/uploads", express.static(uploadDir));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Database Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ==========================================
// EMAIL SETUP & ROUTING DICTIONARY
// ==========================================
let transporter;
async function setupMailer() {
  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "10.30.50.241",
      port: process.env.SMTP_PORT || 25,
      secure: false,
      tls: { rejectUnauthorized: false },
    });
    await transporter.verify();
    console.log("✉️ Internal Email Relay Connected Successfully!");
  } catch (error) {
    console.error("❌ Failed to connect to email server:", error);
  }
}
setupMailer();

const coordinatorMapping = {
  Grafton: "grafton-logistics@iceriversprings.com",
  Calgary: "calgary-logistics@iceriversprings.com",
  Lachute: "lachute-logistics@iceriversprings.com",
  Feversham: "feversham-logistics@iceriversprings.com",
  "Feversham - BMPP": "feversham-logistics@iceriversprings.com",
  Chilliwack: "chilliwack-logistics@iceriversprings.com",
  "Shelburne Water": "shelburne-logistics@iceriversprings.com",
  "Shelburne BMPR": "shelburne-logistics@iceriversprings.com",
  "Shelburne BMPE": "shelburne-logistics@iceriversprings.com",
  Dundalk: "dundalk-logistics@iceriversprings.com",
  CRP: "crp-logistics@iceriversprings.com",
  Default: "logistics-general@iceriversprings.com",
};

async function sendLogisticsEmail(toEmail, subject, text) {
  if (!transporter) return;
  try {
    await transporter.sendMail({
      from: '"Ice River Logistics" <noreply-logistics@iceriversprings.com>',
      to: toEmail,
      subject: subject,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #E2E8F0; border-radius: 8px;">
                <h2 style="color: #0A2540;">${subject}</h2>
                <p style="font-size: 16px;">${text}</p>
                <br />
                <hr style="border: 0; border-top: 1px solid #E2E8F0;" />
                <p style="color: #64748B; font-size: 12px;">This is an automated system notification. Please log in to the Corporate Logistics Portal to review full details or take action.</p>
             </div>`,
    });
    console.log(`\n🔔 EMAIL SENT TO: ${toEmail}\n`);
  } catch (err) {
    console.error("Error sending email:", err);
  }
}

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
    // Users Table
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
      )`,
    );

    try {
      await pool.query(
        "ALTER TABLE users MODIFY COLUMN role ENUM('Admin', 'Executive', 'Management', 'Logistics Coordinator', 'Requester', 'Read-Only') NOT NULL",
      );
      console.log("SUCCESS: Database users ENUM synchronized.");
    } catch (e) {
      console.log("Role update skipped or already applied.");
    }

    // Transfers Table
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
      )`,
    );

    // Logs Table
    await pool.query(
      `CREATE TABLE IF NOT EXISTS logs (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        transfer_id INT NOT NULL, 
        user_id INT NOT NULL, 
        text TEXT NOT NULL, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (transfer_id) REFERENCES transfers(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,
    );

    // Seed Accounts
    const adminPass = await bcrypt.hash("AOliveira@2026!", 10);
    const teamPass = await bcrypt.hash("IceRiver@2026!", 10);

    const teamMembers = [
      [
        "Alexandre Oliveira",
        "aoliveira@iceriversprings.com",
        adminPass,
        "Admin",
      ],
      [
        "Dominick Farrell",
        "DFarrell@iceriversprings.com",
        teamPass,
        "Requester",
      ],
      ["Kevin Solski", "KSolski@iceriversprings.com", teamPass, "Requester"],
      [
        "Nathan Hawkins",
        "NHawkins@bluemountainplastics.com",
        teamPass,
        "Requester",
      ],
      ["Stacy Draper", "sdraper@iceriversprings.com", teamPass, "Requester"],
      ["Livia Lima", "llima@iceriversprings.com", teamPass, "Requester"],
      ["Colin Duncan", "cduncan@iceriversprings.com", teamPass, "Requester"],
      ["Jennifer Horner", "jhorner@bmpextrusion.com", teamPass, "Requester"],
      [
        "William Legere",
        "wlegere@bluemountainplastics.com",
        teamPass,
        "Requester",
      ],
      ["Kyle Strehl", "kstrehl@iceriversprings.com", teamPass, "Requester"],
      [
        "Conrad Williams",
        "conradwilliams@iceriversprings.com",
        teamPass,
        "Requester",
      ],
      ["Daniel Gagnon", "dgagnon@iceriversprings.com", teamPass, "Requester"],
      [
        "Ali El-Hourani",
        "aelhourani@iceriversprings.com",
        teamPass,
        "Requester",
      ],
      [
        "Stephanie Fonseca",
        "sfonseca@iceriversprings.com",
        teamPass,
        "Requester",
      ],
      [
        "Tara Parker",
        "tparker@bluemountainplastics.com",
        teamPass,
        "Requester",
      ],
      ["Vismay Soni", "vsoni@iceriversprings.com", teamPass, "Requester"],
      ["Renan Lucena", "rlucena@crplastics.com", teamPass, "Requester"],
      ["Durid Awaad", "dawaad@iceriversprings.com", teamPass, "Requester"],
      ["Bill Harper", "bharper@iceriversprings.com", teamPass, "Requester"],
      [
        "Logistics Group",
        "logistics@iceriversprings.com",
        teamPass,
        "Requester",
      ],
    ];

    for (const member of teamMembers) {
      await pool.query(
        `INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE password = VALUES(password), role = VALUES(role)`,
        member,
      );
    }

    console.log("✅ Database tables verified and accounts seeded!");
  } catch (error) {
    console.error("Failed to build tables:", error);
  }
}

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token)
    return res
      .status(401)
      .json({ status: "Error", message: "Access Denied: No Token" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err)
      return res
        .status(403)
        .json({ status: "Error", message: "Invalid Token" });
    req.user = user;
    next();
  });
};

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
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
      full_name: users[0].full_name,
      email: users[0].email,
      role: users[0].role,
    };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "8h" });
    res.json({ status: "Success", user, token });
  } catch (error) {
    res.status(500).json({ status: "Error", message: "Database error" });
  }
});

// ==========================================
// USER MANAGEMENT ENDPOINTS
// ==========================================
app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at DESC",
    );
    res.json({ status: "Success", data: rows });
  } catch (error) {
    res.status(500).json({ status: "Error" });
  }
});

app.put("/api/users/:id/role", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Admin")
      return res.status(403).json({ status: "Error" });
    await pool.query("UPDATE users SET role = ? WHERE id = ?", [
      req.body.role,
      req.params.id,
    ]);
    res.json({ status: "Success" });
  } catch (error) {
    res.status(500).json({ status: "Error" });
  }
});

// ==========================================
// TRANSFER SUBMISSION ENDPOINTS
// ==========================================
const generateReqCode = () =>
  "TRX-" + crypto.randomBytes(3).toString("hex").toUpperCase();

app.post(
  "/api/equipment-transfers",
  authenticateToken,
  upload.single("file"),
  async (req, res) => {
    try {
      const data = req.body;
      const reqCode = generateReqCode();

      let attachName = null;
      let attachUrl = null;
      if (req.file) {
        attachName = req.file.originalname;
        attachUrl = `/uploads/${req.file.filename}`;
      }

      await pool.query(
        `INSERT INTO transfers (
        request_code, type, initiator_id, origin, dest, shipping_earliest, shipping_latest, 
        pallets, pallet_positions, weight, dimensions, carrier, description, 
        equip_id, project_code, hs_code, unit_value, attachment_name, attachment_url
      ) VALUES (?, 'Equipment', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          reqCode,
          req.user.id,
          data.originName,
          data.destName,
          data.shippingEarliest,
          data.shippingLatest,
          data.pallets,
          data.palletPositions,
          data.weight,
          data.dimensions,
          data.carrier,
          data.description,
          data.equipId,
          data.projectCode,
          data.hsCode,
          data.unitValue || 0,
          attachName,
          attachUrl,
        ],
      );

      const coordinatorEmail =
        coordinatorMapping[data.originName] || coordinatorMapping["Default"];
      await sendLogisticsEmail(
        coordinatorEmail,
        `New Equipment Quote Required: ${reqCode}`,
        `A new equipment transfer originating from ${data.originName} has been submitted by ${req.user.full_name}. Please log in to source a rate.`,
      );

      io.emit("registryUpdate", { newTransfer: true });
      res.json({ status: "Success", requestId: reqCode });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: "Error" });
    }
  },
);

app.post(
  "/api/material-transfers",
  authenticateToken,
  upload.single("file"),
  async (req, res) => {
    try {
      const data = req.body;
      const reqCode = generateReqCode();

      let attachName = null;
      let attachUrl = null;
      if (req.file) {
        attachName = req.file.originalname;
        attachUrl = `/uploads/${req.file.filename}`;
      }

      await pool.query(
        `INSERT INTO transfers (
        request_code, type, initiator_id, origin, dest, shipping_earliest, shipping_latest, 
        pallets, pallet_positions, weight, dimensions, carrier, description, 
        material_number, batch_code, attachment_name, attachment_url
      ) VALUES (?, 'Material', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          reqCode,
          req.user.id,
          data.originName,
          data.destName,
          data.shippingEarliest,
          data.shippingLatest,
          data.pallets,
          data.palletPositions,
          data.weight,
          data.dimensions,
          data.carrier,
          data.description,
          data.materialNumber,
          data.batchCode,
          attachName,
          attachUrl,
        ],
      );

      const coordinatorEmail =
        coordinatorMapping[data.originName] || coordinatorMapping["Default"];
      await sendLogisticsEmail(
        coordinatorEmail,
        `New Material Quote Required: ${reqCode}`,
        `A new material transfer originating from ${data.originName} has been submitted by ${req.user.full_name}. Please log in to source a rate.`,
      );

      io.emit("registryUpdate", { newTransfer: true });
      res.json({ status: "Success", requestId: reqCode });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: "Error" });
    }
  },
);

// ==========================================
// REGISTRY & DASHBOARD ENDPOINTS
// ==========================================
app.get("/api/transfers", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, u.full_name as initiator 
       FROM transfers t 
       JOIN users u ON t.initiator_id = u.id 
       ORDER BY t.created_at DESC`,
    );

    const formattedData = rows.map((r) => ({
      raw_id: r.id,
      id: r.request_code,
      type: r.type,
      origin: r.origin,
      dest: r.dest,
      initiator: r.initiator,
      date: new Date(r.created_at).toLocaleDateString(),
      status: r.status,
      shippingEarliest: r.shipping_earliest,
      shippingLatest: r.shipping_latest,
      carrier: r.carrier,
      pallets: r.pallets,
      palletPositions: r.pallet_positions,
      weight: r.weight,
      dimensions: r.dimensions,
      equipId: r.equip_id,
      projectCode: r.project_code,
      hsCode: r.hs_code,
      unitValue: r.unit_value,
      materialNumber: r.material_number,
      batchCode: r.batch_code,
      description: r.description,
      secured_rate: r.secured_rate,
      attachmentName: r.attachment_name,
      attachmentUrl: r.attachment_url,
    }));

    res.json({ status: "Success", data: formattedData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "Error" });
  }
});

app.get("/api/dashboard-stats", authenticateToken, async (req, res) => {
  try {
    const [statusRows] = await pool.query(
      "SELECT status, COUNT(*) as count FROM transfers GROUP BY status",
    );
    const [facilityRows] = await pool.query(
      "SELECT origin, COUNT(*) as count FROM transfers GROUP BY origin",
    );

    let pending = 0,
      active = 0,
      completed = 0;
    const statusData = [];

    statusRows.forEach((row) => {
      statusData.push({
        name: row.status.replace(/_/g, " "),
        Transfers: row.count,
      });
      if (row.status === "Carrier Booked") completed += row.count;
      else if (
        row.status === "Pending Logistics Quote" ||
        row.status === "Pending Requester Approval"
      )
        pending += row.count;
      else active += row.count;
    });

    const facilityData = facilityRows.map((row) => ({
      name: row.origin,
      value: row.count,
    }));

    res.json({
      status: "Success",
      data: {
        metrics: { pending, active, completed },
        statusData: statusData.length
          ? statusData
          : [{ name: "No Data", Transfers: 0 }],
        facilityData: facilityData.length
          ? facilityData
          : [{ name: "No Data", value: 1 }],
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "Error" });
  }
});

// ==========================================
// 4-STEP WORKFLOW & LOGGING ENDPOINTS
// ==========================================
app.put("/api/transfers/:id/status", authenticateToken, async (req, res) => {
  const { status, comment, rate } = req.body;
  const transferRawId = req.params.id;

  try {
    const [transferRows] = await pool.query(
      `SELECT t.*, u.full_name as initiator_name, u.email as initiator_email
       FROM transfers t 
       JOIN users u ON t.initiator_id = u.id
       WHERE t.id = ?`,
      [transferRawId],
    );

    if (transferRows.length === 0)
      return res
        .status(404)
        .json({ status: "Error", message: "Transfer not found." });
    const transfer = transferRows[0];
    const originFacility = transfer.origin;
    const reqCode = transfer.request_code;

    if (rate && rate.toString().trim() !== "") {
      await pool.query(
        "UPDATE transfers SET status = ?, secured_rate = ? WHERE id = ?",
        [status, parseFloat(rate), transferRawId],
      );
    } else {
      await pool.query("UPDATE transfers SET status = ? WHERE id = ?", [
        status,
        transferRawId,
      ]);
    }

    const actionText = rate
      ? `Workflow Decision (${status}) - Rate Secured: $${rate}\nNotes: ${comment || "No comments provided."}`
      : `Workflow Decision (${status})\nNotes: ${comment || "No comments provided."}`;

    await pool.query(
      "INSERT INTO logs (transfer_id, user_id, text) VALUES (?, ?, ?)",
      [transferRawId, req.user.id, actionText],
    );

    const coordinatorEmail =
      coordinatorMapping[originFacility] || coordinatorMapping["Default"];
    const senderEmail = transfer.initiator_email;

    if (status === "Pending Requester Approval") {
      await sendLogisticsEmail(
        senderEmail,
        `Action Required: Quote Ready for ${reqCode}`,
        `A shipping rate of $${rate} has been secured for your transfer by ${req.user.full_name}. Please log in to approve or reject this cost.`,
      );
    } else if (status === "Approved - Pending Booking") {
      await sendLogisticsEmail(
        coordinatorEmail,
        `Quote Approved: Book Carrier for ${reqCode}`,
        `The sender (${transfer.initiator_name}) has approved the rate. Please proceed with booking the truck offline.`,
      );
    } else if (status === "Carrier Booked") {
      await sendLogisticsEmail(
        senderEmail,
        `Carrier Booked: ${reqCode}`,
        `Your transfer has been successfully booked by logistics and is now complete in the system.`,
      );
    } else if (status === "REJECTED") {
      await sendLogisticsEmail(
        coordinatorEmail,
        `Quote Rejected: ${reqCode}`,
        `The sender (${transfer.initiator_name}) has rejected the quote. Review notes in the portal.`,
      );
    }

    io.emit("registryUpdate", { transferId: transferRawId, newStatus: status });
    res.json({ status: "Success" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "Error", message: "Failed to update status." });
  }
});

app.get("/api/transfers/:id/logs", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT l.id, l.text, l.created_at, u.full_name as user_name 
       FROM logs l JOIN users u ON l.user_id = u.id 
       WHERE l.transfer_id = ? ORDER BY l.created_at ASC`,
      [req.params.id],
    );

    const formatted = rows.map((r) => ({
      id: r.id,
      text: r.text,
      user_name: r.user_name,
      date: new Date(r.created_at).toLocaleString(),
    }));

    res.json({ status: "Success", data: formatted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "Error" });
  }
});

app.post("/api/transfers/:id/logs", authenticateToken, async (req, res) => {
  try {
    await pool.query(
      "INSERT INTO logs (transfer_id, user_id, text) VALUES (?, ?, ?)",
      [req.params.id, req.user.id, req.body.text],
    );
    io.emit("transferUpdate", {
      action: "Commented",
      transferId: req.params.id,
    });
    res.json({ status: "Success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "Error" });
  }
});

server.listen(PORT, async () => {
  console.log(`Backend API with Live Sockets running on port ${PORT}`);
  await initializeDatabase();
});
