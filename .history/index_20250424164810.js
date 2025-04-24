const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authenticateToken = require("./middleware/authMiddleware");
const pool = require("./db");  



require("dotenv").config();
const app = express();

app.use(cors());
app.use(bodyParser.json());



app.use(express.static('frontend'));



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


app.get("/api/recent-activities", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [waste] = await pool.query(
      "SELECT 'Waste' AS type, description, created_at AS date FROM waste_entries WHERE user_id = ? ORDER BY created_at DESC LIMIT 5",
      [userId]
    );

    const [donations] = await pool.query(
      "SELECT 'Donation' AS type, description, created_at AS date FROM food_donations WHERE user_id = ? ORDER BY created_at DESC LIMIT 5",
      [userId]
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



// ✅ Protected Route: Add Waste Entry
app.post("/api/waste/add", authenticateToken, async (req, res) => {
  const { description, category, quantity, image_url } = req.body;
  const userId = req.user.id;

  if (!description || !category || !quantity) {
    return res.status(400).json({ message: "Please provide all required fields." });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO waste_entries (user_id, description, category, quantity, image_url) VALUES (?, ?, ?, ?, ?)",
      [userId, description, category, quantity, image_url || null]
    );

    res.status(201).json({ message: "Waste entry added successfully." });
  } catch (error) {
    console.error("Error adding waste entry:", error);
    res.status(500).json({ message: "Failed to add waste entry." });
  }
});





// ... your existing code

// ✅ Request Waste Collection
app.post("/api/request-collection", authenticateToken, async (req, res) => {
  const { waste_entry_id, description } = req.body;
  const user_id = req.user.id;

  if (!waste_entry_id || !description) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    await pool.query(
      `INSERT INTO waste_collection (description, status, user_id, waste_entry_id)
       VALUES (?, 'Pending', ?, ?)`,
      [description, user_id, waste_entry_id]
    );

    res.status(201).json({ message: "Collection request submitted successfully" });
  } catch (error) {
    console.error("Error submitting request:", error);
    res.status(500).json({ message: "Database error" });
  }
});

// ✅ Fetch User's Waste Entries
app.get("/api/waste-entries", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [entries] = await pool.query(
      "SELECT id, description FROM waste_entries WHERE user_id = ?",
      [userId]
    );

    res.json(entries);
  } catch (err) {
    console.error("Error fetching waste entries:", err);
    res.status(500).json({ message: "Error fetching entries" });
  }
});



































// ✅ Use Auth Routes
app.use("/api/auth", require("./routes/auth"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = pool;  // ✅ Exporting the pool


