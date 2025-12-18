const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRating } = require('../middleware/validation');

// Submit or update rating
router.post('/', authenticate, authorize('user'), validateRating, async (req, res) => {
  try {
    const { storeId, rating } = req.body;
    const connection = await pool.getConnection();

    // Check if store exists
    const [stores] = await connection.query('SELECT id FROM stores WHERE id = ?', [storeId]);
    if (stores.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if rating exists
    const [existing] = await connection.query(
      'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
      [req.user.id, storeId]
    );

    if (existing.length > 0) {
      // Update existing rating
      await connection.query(
        'UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?',
        [rating, req.user.id, storeId]
      );
      connection.release();
      res.json({ message: 'Rating updated successfully' });
    } else {
      // Insert new rating
      await connection.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [req.user.id, storeId, rating]
      );
      connection.release();
      res.status(201).json({ message: 'Rating submitted successfully' });
    }
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ message: 'Failed to submit rating' });
  }
});

// Get user's rating for a store
router.get('/store/:storeId', authenticate, authorize('user'), async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [ratings] = await connection.query(
      'SELECT rating FROM ratings WHERE user_id = ? AND store_id = ?',
      [req.user.id, req.params.storeId]
    );

    connection.release();

    if (ratings.length === 0) {
      return res.json({ rating: null });
    }

    res.json({ rating: ratings[0].rating });
  } catch (error) {
    console.error('Get rating error:', error);
    res.status(500).json({ message: 'Failed to fetch rating' });
  }
});

module.exports = router;