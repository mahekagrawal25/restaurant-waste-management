// routes/wasteEntries.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // your MySQL connection pool

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

module.exports = router;
