// routes/wasteRoutes.js

const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const db = require("../db"); // ⬅️ Ensure this exports your MySQL connection pool

// 🗑️ Add new waste entry
router.post("/add", authenticateToken, (req, res) => {
  const { description, category, quantity, image_url } = req.body;
  const user_id = req.user.id;

  if (!description || !category || !quantity) {
    return res.status(400).json({ message: "All fields except image are required." });
  }

  const sql = `
    INSERT INTO waste_entries (user_id, description, category, quantity, image_url, created_at)
    VALUES (?, ?, ?, ?, ?, NOW())
  `;

  db.query(sql, [user_id, description, category, quantity, image_url || null], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Failed to add waste entry." });
    }

    res.status(201).json({ message: "Waste entry added successfully." });
  });
});

module.exports = router;
