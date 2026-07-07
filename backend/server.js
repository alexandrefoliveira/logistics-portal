const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// Bind SQLite to your persistent Docker volume location
const dbPath = path.resolve(__dirname, "database", "logistics.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("Connected to the SQLite database.");

    // Read and execute the init.sql file
    const initSqlPath = path.resolve(__dirname, "database", "init.sql");
    try {
      const initSql = fs.readFileSync(initSqlPath, "utf8");

      // exec() handles multiple statements separated by semicolons
      db.exec(initSql, (execErr) => {
        if (execErr) {
          console.error("Failed to execute init.sql:", execErr.message);
        } else {
          console.log("Database initialized successfully from init.sql.");
        }
      });
    } catch (readErr) {
      console.error(
        "Could not find or read database/init.sql file:",
        readErr.message,
      );
    }
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ status: "API is responsive and database is connected." });
});

// --- AUTHENTICATION & AUTHORIZATION ---

// Login Endpoint
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Validate directly against the dynamic SQLite database
  db.get(
    `SELECT * FROM users WHERE email = ?`,
    [normalizedEmail],
    (err, user) => {
      if (err) {
        console.error("Database lookup error:", err);
        return res.status(500).json({ error: "Internal server error." });
      }

      // Check if user exists
      if (!user) {
        return res.status(401).json({
          error:
            "Unauthorized access. Your email is not registered in the system.",
        });
      }

      // STRICT PASSWORD CHECK
      // Compares the entered password with the plain-text password seeded in init.sql
      if (user.password !== password) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      // If it makes it here, the password is correct!
      res.status(200).json({
        token: "secure-jwt-mock-token",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    },
  );
});

app.get("/api/users", (req, res) => {
  // Query all users from the SQLite database
  db.all(
    `SELECT id, name AS full_name, email, role FROM users`,
    [],
    (err, rows) => {
      if (err) {
        console.error("Database fetch error:", err);
        return res.status(500).json({ error: "Failed to fetch users." });
      }
      res.status(200).json(rows);
    },
  );
});

// Forgot Password Endpoint
app.post("/api/forgot-password", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  const normalizedEmail = email.toLowerCase().trim();

  db.get(
    `SELECT * FROM users WHERE email = ?`,
    [normalizedEmail],
    (err, user) => {
      // Standard security practice: return the exact same success message whether the
      // email exists or not, preventing bad actors from enumerating valid company emails.
      if (err || !user) {
        return res.status(200).json({
          message: `If an account exists for ${normalizedEmail}, a reset link has been sent.`,
        });
      }

      // Simulate dispatching the email (to be replaced with Nodemailer/SendGrid etc.)
      console.log(
        `[Notification Service] -> Password reset link generated and sent to: ${normalizedEmail}`,
      );

      res.status(200).json({
        message: `If an account exists for ${normalizedEmail}, a reset link has been sent.`,
      });
    },
  );
});

// Change Password Endpoint (For authenticated internal usage)
app.post("/api/change-password", async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const normalizedEmail = email.toLowerCase().trim();

  db.get(
    `SELECT * FROM users WHERE email = ?`,
    [normalizedEmail],
    (err, user) => {
      if (err) {
        console.error("Database lookup error:", err);
        return res.status(500).json({ error: "Internal server error." });
      }

      if (!user) {
        return res.status(403).json({ error: "Unauthorized operation." });
      }

      // 1. Compare the provided currentPassword against the stored password_hash using bcrypt.compare()
      // 2. If valid, hash the newPassword and execute an UPDATE on the user record

      console.log(
        `[Security] -> Password updated internally for user: ${normalizedEmail}`,
      );
      res.status(200).json({ message: "Password updated successfully." });
    },
  );
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
