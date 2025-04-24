const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authenticateToken = require("./middleware/authMiddleware");
const pool = require("./db");  // ✅ Reusing the pool from the previous working version














require("dotenv").config();
const app = express();

app.use(cors());
app.use(bodyParser.json());



app.use(express.static('frontend'));

// ✅ Login Route
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [user] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if (user.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user[0].password_hash);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }


    // ✅ Include `role` in the token for better authorization management
    const token = jwt.sign(
      { id: user[0].id, email: user[0].email, role: user[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // ✅ Store user info in session
    req.session.user_id = user.id;
    req.session.role = user.role;
    req.session.username = user.username;

    res.json({
      message: "Login successful",
      token,
      username: user[0].username,
      role: user[0].role
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});


// ✅ Protected Route: Fetch Dashboard Stats
app.get("/api/dashboard", authenticateToken, async (req, res) => {
  try {
    const [waste] = await pool.query("SELECT COUNT(*) AS totalWaste FROM waste_entries");
    const [donations] = await pool.query("SELECT COUNT(*) AS totalDonations FROM food_donations");
    const [collections] = await pool.query("SELECT COUNT(*) AS totalCollections FROM waste_collection");

    res.json({
      totalWaste: waste[0].totalWaste,
      totalDonations: donations[0].totalDonations,
      totalCollections: collections[0].totalCollections,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Error fetching stats" });
  }
});


// ✅ Protected Route: Fetch Recent Activities
app.get("/api/recent-activities", authenticateToken, async (req, res) => {
  try {
    const [waste] = await pool.query(
      "SELECT 'Waste' AS type, description, created_at AS date FROM waste_entries ORDER BY created_at DESC LIMIT 5"
    );

    const [donations] = await pool.query(
      "SELECT 'Donation' AS type, description, created_at AS date FROM food_donations ORDER BY created_at DESC LIMIT 5"
    );

    const activities = [...waste, ...donations].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    res.json(activities);
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    res.status(500).json({ message: "Error fetching activities" });
  }
});


















// ✅ Use Auth Routes
app.use("/api/auth", require("./routes/auth"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = pool;  // ✅ Exporting the pool
