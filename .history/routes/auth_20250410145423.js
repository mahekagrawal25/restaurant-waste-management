const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");
const router = express.Router();

const jwt = require("jsonwebtoken");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const pool = require("../../db"); // adjust if needed

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Create JWT with user info
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // ✅ Send role back so frontend can redirect accordingly
    res.json({
      message: "Login successful",
      token,
      username: user.username,
      role: user.role,
    });

  } catch (error) {
    console.error("Error in /login route:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

router.post("/signup", async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required including role" });
  }

  try {
    // Check if email already exists
    const [existingUser] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database with role
    await pool.query(
      "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, role]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Server error" });
  }
});



// Example (Node.js/Express)
router.get('/dashboard/activities', async (req, res) => {
  try {
    // Get recent 3 entries from each table using your MySQL pool
    const [wasteEntries] = await pool.query(
      'SELECT * FROM waste_entries ORDER BY created_at DESC LIMIT 3'
    );
    
    const [donations] = await pool.query(
      'SELECT * FROM food_donations ORDER BY created_at DESC LIMIT 3'
    );
    
    const [collections] = await pool.query(
      'SELECT * FROM waste_collection ORDER BY created_at DESC LIMIT 3'
    );

    // Combine and format the data
    const activities = [
      ...wasteEntries.map(e => ({ ...e, type: 'waste' })),
      ...donations.map(d => ({ ...d, type: 'donation' })),
      ...collections.map(c => ({ ...c, type: 'collection' }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(activities);
    
  } catch (err) {
    console.error('Error fetching activities:', err);
    res.status(500).json({ message: 'Server error' });
  }
});







module.exports = router;
