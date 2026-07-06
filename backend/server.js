const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Bind SQLite to your persistent Docker volume location
const dbPath = path.resolve(__dirname, "database", "logistics.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("Database connection error:", err.message);
  else console.log("Connected to the SQLite database.");
});

// Serialize database initialization to ensure tables are created in order
db.serialize(() => {
  // 1. Users & Contacts Table
  db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        department TEXT,
        role TEXT DEFAULT 'Requester'
    )`);

  // 2. Master Transfer Requests Table
  db.run(`CREATE TABLE IF NOT EXISTS transfer_requests (
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
        carrier_equipment TEXT,
        carrier_comments TEXT,
        status TEXT DEFAULT 'Pending Logistics Quote',
        quote_price REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

  // 3. Material Move Grid Items (Child Table)
  db.run(`CREATE TABLE IF NOT EXISTS material_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id INTEGER,
        material_number TEXT,
        description TEXT,
        pallets INTEGER,
        pallet_positions INTEGER,
        weight REAL,
        dimensions TEXT,
        FOREIGN KEY(request_id) REFERENCES transfer_requests(id) ON DELETE CASCADE
    )`);

  // 4. Equipment & Project Move Grid Items (Child Table)
  db.run(`CREATE TABLE IF NOT EXISTS equipment_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id INTEGER,
        project_code TEXT, -- Mandatory for Project moves
        hs_code TEXT,      -- Mandatory Tariff Code
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
    )`);

  // 5. Complete Live Timeline Audit Log
  db.run(`CREATE TABLE IF NOT EXISTS approval_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id INTEGER,
        approver_email TEXT,
        action TEXT, -- e.g., 'Approved', 'Rejected', 'Quote Uploaded'
        comments TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(request_id) REFERENCES transfer_requests(id) ON DELETE CASCADE
    )`);
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "Database structures fully initialized." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
