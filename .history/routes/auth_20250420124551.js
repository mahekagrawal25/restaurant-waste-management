const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware"); 

const jwt = require("jsonwebtoken");


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
      user_id: user.id,
      
    });

  } catch (error) {
    console.error("Error in /login route:", error);
    res.status(500).json({ error: "Server error" });
  }
});





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
router.get('/dashboard/activities', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [wasteEntries] = await pool.query(
      'SELECT * FROM waste_entries WHERE user_id = ? ORDER BY created_at DESC LIMIT 3',
      [userId]
    );
    
    const [donations] = await pool.query(
      'SELECT * FROM food_donations WHERE user_id = ? ORDER BY created_at DESC LIMIT 3',
      [userId]
    );
    
    const [collections] = await pool.query(
      'SELECT * FROM waste_collection WHERE user_id = ? ORDER BY created_at DESC LIMIT 3',
      [userId]
    );

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


// ✅ Protected POST route to add waste entry
router.post("/addWaste", authenticateToken, async (req, res) => {
  const { description, category, quantity, image_url } = req.body;

  if (!description || !category || !quantity) {
    console.log("req.user in /addWaste:", req.user); 
    return res.status(400).json({ message: "Description, category, and quantity are required" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO waste_entries (user_id, description, category, quantity, image_url) VALUES (?, ?, ?, ?, ?)",
      [req.user.id, description, category, quantity, image_url || null]
    );

    res.status(201).json({ message: "Waste entry added successfully", entryId: result.insertId });
  } catch (error) {
    console.error("Error adding waste entry:", error);
    res.status(500).json({ message: "Server error. Please try again later" });
  }
});










// Middleware to get user's waste entries
router.get('/user/waste-entries', (req, res) => {
  const userId = req.user.id; // Or from session/cookies

  if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
  }

  const sql = `SELECT id, category, quantity FROM waste_entries WHERE user_id = ? ORDER BY created_at DESC`;

  db.query(sql, [userId], (err, results) => {
      if (err) {
          console.error("Error fetching waste entries:", err);
          return res.status(500).json({ message: "Database error" });
      }
      return res.json(results);
  });
});



router.post('/request-collection', (req, res) => {
  const userId = req.user.id; // Get from session/token
  const { waste_entry_id, description } = req.body;

  if (!userId || !waste_entry_id || !description) {
      return res.status(400).json({ message: "Missing required fields" });
  }

  const sql = `
      INSERT INTO waste_collection (description, status, user_id, waste_entry_id)
      VALUES (?, 'Pending', ?, ?)
  `;

  db.query(sql, [description, userId, waste_entry_id], (err, result) => {
      if (err) {
          console.error("Error inserting collection request:", err);
          return res.status(500).json({ message: "Database insert failed" });
      }
      return res.status(201).json({ message: "Collection request submitted" });
  });
});





module.exports = router;
