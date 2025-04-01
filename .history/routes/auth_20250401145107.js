const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");
const router = express.Router();

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

    // ✅ Include the username in the response
    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username },  // Include username
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    

    res.json({
      message: "Login successful",
      token,
      username: user.username, // 👈 Send the username
    });
  } catch (error) {
    console.error("Error in /login route:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
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

    // Insert user into database with correct column names
    await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Server error" });
  }
});



// Example (Node.js/Express)
// New endpoint for detailed activities
router.get('/dashboard/activities', async (req, res) => {
  try {
    // Get recent activities from all tables
    const [wasteEntries, donations, collections] = await Promise.all([
      WasteEntry.find().sort({ created_at: -1 }).limit(5),
      FoodDonation.find().sort({ created_at: -1 }).limit(5),
      WasteCollection.find().sort({ created_at: -1 }).limit(5)
    ]);

    // Format response
    const activities = [
      ...wasteEntries.map(e => ({ 
        type: 'waste',
        description: e.description,
        category: e.category,
        quantity: e.quantity,
        date: e.created_at
      })),
      ...donations.map(d => ({
        type: 'donation',
        description: d.description,
        donor: d.donor_name,
        quantity: d.quantity,
        date: d.created_at
      })),
      ...collections.map(c => ({
        type: 'collection',
        description: c.description,
        status: c.status,
        pickup_date: c.pickup_date,
        date: c.created_at
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(activities);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;
