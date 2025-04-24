// routes/wasteRoutes.js or similar
const express = require('express');
const router = express.Router();
const pool = require('../db'); // your MySQL connection
const authenticateToken = require('../middleware/authenticateToken'); // JWT middleware

// GET /api/waste/entries
router.get('/entries', authenticateToken, async (req, res) => {
  const userId = req.user.user_id; // from JWT

  try {
    const [entries] = await pool.query(
      'SELECT id, description, category, quantity, image_url, created_at FROM waste_entries WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.status(200).json({ entries });
  } catch (err) {
    console.error('Error fetching waste entries:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
