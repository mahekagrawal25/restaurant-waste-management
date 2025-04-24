// In routes/collections.js

const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateToken = require("../middleware/authMiddleware");

// Get pending waste entries for the logged-in user
router.get("/pending/:userId", authenticateToken, async (req, res) => {
  const { userId } = req.params;
  
  if (req.user.id !== parseInt(userId)) {
    return res.status(403).json({ message: "Unauthorized access to other user's data." });
  }

  try {
    const [pendingEntries] = await pool.query(
      "SELECT * FROM waste_entries WHERE user_id = ? AND status = 'Pending'",
      [userId]
    );
    res.json(pendingEntries);
  } catch (error) {
    console.error("Error fetching pending waste entries:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
