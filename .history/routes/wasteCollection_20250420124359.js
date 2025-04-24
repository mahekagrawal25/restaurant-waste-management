// routes/wasteCollection.js
const express = require('express');
const router = express.Router();
const db = require('../db');

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
