const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// Get dashboard statistics (Admin only)
router.get('/stats', authenticate, authorize('admin'), async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [storeCount] = await connection.query('SELECT COUNT(*) as count FROM stores');
    const [ratingCount] = await connection.query('SELECT COUNT(*) as count FROM ratings');

    connection.release();

    res.json({
      totalUsers: userCount[0].count,
      totalStores: storeCount[0].count,
      totalRatings: ratingCount[0].count
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

module.exports = router;