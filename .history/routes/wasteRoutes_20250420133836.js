// routes/wasteRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // MySQL connection
const authenticateToken = require('../middleware/authenticateToken');

// GET /api/waste/entries - fetch waste entries for the logged-in user
router.get('/entries', authenticateToken, async (req, res) => {
  const userId = req.user.user_id;

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

// POST /api/waste/request-collection - submit a collection request
router.post('/request-collection', authenticateToken, async (req, res) => {
  const { waste_entry_id, description } = req.body;
  const userId = req.user.user_id;

  if (!waste_entry_id || !description) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const [entryCheck] = await pool.query(
      'SELECT id FROM waste_entries WHERE id = ? AND user_id = ?',
      [waste_entry_id, userId]
    );

    if (entryCheck.length === 0) {
      return res.status(403).json({ message: 'Not authorized to request collection for this entry' });
    }

    await pool.query(
      'INSERT INTO waste_collection (waste_entry_id, description, status, requested_at) VALUES (?, ?, ?, NOW())',
      [waste_entry_id, description, 'pending']
    );

    res.status(201).json({ message: 'Collection request submitted successfully' });
  } catch (err) {
    console.error('Error submitting collection request:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
