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



// Request collection for a specific waste entry
router.post("/request/:wasteEntryId", authenticateToken, async (req, res) => {
    const { wasteEntryId } = req.params;
    const userId = req.user.id;
  
    try {
      // Update the waste collection status to "Pending" in the database
      const [result] = await pool.query(
        "INSERT INTO waste_collection (description, status, user_id, waste_entry_id) VALUES ((SELECT description FROM waste_entries WHERE id = ?), 'Pending', ?, ?)",
        [wasteEntryId, userId, wasteEntryId]
      );
  
      if (result.affectedRows > 0) {
        res.json({ success: true });
      } else {
        res.status(400).json({ success: false, message: "Failed to request collection." });
      }
    } catch (error) {
      console.error("Error requesting collection:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

module.exports = router;
