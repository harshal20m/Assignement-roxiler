const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const { validateStore, validateUser } = require('../middleware/validation');

// Get all stores
router.get('/', authenticate, async (req, res) => {
  try {
    const { name, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const connection = await pool.getConnection();

    let query = `
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             COALESCE(AVG(r.rating), 0) as rating,
             ${req.user.role === 'user' ? `(SELECT rating FROM ratings WHERE user_id = ? AND store_id = s.id) as user_rating,` : ''}
             COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    const params = req.user.role === 'user' ? [req.user.id] : [];

    if (name) {
      query += ' AND s.name LIKE ?';
      params.push(`%${name}%`);
    }
    if (address) {
      query += ' AND s.address LIKE ?';
      params.push(`%${address}%`);
    }

    query += ' GROUP BY s.id';

    const validSortColumns = ['name', 'email', 'address', 'rating'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    if (sortColumn === 'rating') {
      query += ` ORDER BY rating ${order}`;
    } else {
      query += ` ORDER BY s.${sortColumn} ${order}`;
    }

    const [stores] = await connection.query(query, params);
    connection.release();

    res.json(stores);
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ message: 'Failed to fetch stores' });
  }
});

// Get store details for owner
router.get('/my-store', authenticate, authorize('store_owner'), async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Get store owned by this user
    const [stores] = await connection.query(`
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             COALESCE(AVG(r.rating), 0) as rating,
             COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = ?
      GROUP BY s.id
    `, [req.user.id]);

    if (stores.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'No store found for this owner' });
    }

    // Get users who rated this store
    const [raters] = await connection.query(`
      SELECT u.id, u.name, u.email, r.rating, r.created_at
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
    `, [stores[0].id]);

    connection.release();

    res.json({
      store: stores[0],
      raters: raters
    });
  } catch (error) {
    console.error('Get my store error:', error);
    res.status(500).json({ message: 'Failed to fetch store details' });
  }
});

// Create store (Admin only)
router.post('/', authenticate, authorize('admin'), validateStore, async (req, res) => {
  try {
    const { name, email, address, ownerName, ownerEmail, ownerPassword, ownerAddress } = req.body;
    const connection = await pool.getConnection();

    await connection.beginTransaction();

    try {
      // Check if store email exists
      const [existingStore] = await connection.query('SELECT id FROM stores WHERE email = ?', [email]);
      if (existingStore.length > 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ message: 'Store email already registered' });
      }

      // Create owner user
      const [existingOwner] = await connection.query('SELECT id FROM users WHERE email = ?', [ownerEmail]);
      
      let ownerId;
      if (existingOwner.length > 0) {
        ownerId = existingOwner[0].id;
      } else {
        // Validate owner details
        if (!ownerName || ownerName.length < 20 || ownerName.length > 60) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({ message: 'Owner name must be between 20 and 60 characters' });
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
        if (!ownerPassword || !passwordRegex.test(ownerPassword)) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({ message: 'Owner password must be 8-16 characters with at least one uppercase letter and one special character' });
        }

        const hashedPassword = await bcrypt.hash(ownerPassword, 10);
        const [ownerResult] = await connection.query(
          'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
          [ownerName, ownerEmail, hashedPassword, ownerAddress, 'store_owner']
        );
        ownerId = ownerResult.insertId;
      }

      // Create store
      const [result] = await connection.query(
        'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
        [name, email, address, ownerId]
      );

      await connection.commit();
      connection.release();

      res.status(201).json({ 
        message: 'Store created successfully',
        id: result.insertId 
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({ message: 'Failed to create store' });
  }
});

module.exports = router;