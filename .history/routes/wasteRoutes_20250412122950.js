const express = require("express");
const pool = require("../db");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

// POST route to add waste entry
router.post("/addWaste", authenticateToken, async (req, res) => {
  const { description, category, quantity, image_url } = req.body;

  // Validate input
  if (!description || !category || !quantity) {
    return res.status(400).json({ message: "Description, category, and quantity are required" });
  }

  try {
    // Insert the waste entry into the database
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

module.exports = router;
