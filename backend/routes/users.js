const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireTopManagement } = require('../middleware/auth');

const router = express.Router();

// Get all companies (for top management)
router.get('/companies', authenticateToken, requireTopManagement, async (req, res) => {
  try {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT id, name, industry, created_at FROM companies ORDER BY name'
      );

      res.json({ companies: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ error: 'Failed to get companies' });
  }
});

// Get users for a company (for top management)
router.get('/company/:companyId/users', authenticateToken, requireTopManagement, async (req, res) => {
  try {
    const { companyId } = req.params;

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT id, name, email, role, created_at FROM users WHERE company_id = $1 ORDER BY name',
        [companyId]
      );

      res.json({ users: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get user's accessible companies
router.get('/my-companies', authenticateToken, async (req, res) => {
  try {
    const client = await pool.connect();
    
    try {
      let query;
      let params;

      if (req.user.role === 'top_management') {
        // Top management can see all companies
        query = 'SELECT id, name, industry, created_at FROM companies ORDER BY name';
        params = [];
      } else {
        // Regular users can only see their assigned company
        query = 'SELECT id, name, industry, created_at FROM companies WHERE id = $1';
        params = [req.user.company_id];
      }

      const result = await client.query(query, params);

      res.json({ companies: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get my companies error:', error);
    res.status(500).json({ error: 'Failed to get companies' });
  }
});

// Create new company (for top management)
router.post('/companies', authenticateToken, requireTopManagement, async (req, res) => {
  try {
    const { name, industry } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const client = await pool.connect();
    
    try {
      // Check if company already exists
      const existingResult = await client.query(
        'SELECT id FROM companies WHERE name = $1',
        [name]
      );
      
      if (existingResult.rows.length > 0) {
        return res.status(400).json({ error: 'Company already exists' });
      }

      const result = await client.query(
        'INSERT INTO companies (name, industry) VALUES ($1, $2) RETURNING id, name, industry',
        [name, industry]
      );

      res.status(201).json({
        message: 'Company created successfully',
        company: result.rows[0]
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ error: 'Failed to create company' });
  }
});

// Update user role (for top management)
router.put('/users/:userId/role', authenticateToken, requireTopManagement, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !['analyst', 'ceo', 'top_management'].includes(role)) {
      return res.status(400).json({ error: 'Valid role is required' });
    }

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
        [role, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        message: 'User role updated successfully',
        user: result.rows[0]
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const client = await pool.connect();
    
    try {
      let balanceSheetsCount, chatHistoryCount;

      if (req.user.role === 'top_management') {
        // Top management can see all data
        balanceSheetsCount = await client.query('SELECT COUNT(*) as count FROM balance_sheets');
        chatHistoryCount = await client.query('SELECT COUNT(*) as count FROM chat_history');
      } else {
        // Regular users can only see their company's data
        balanceSheetsCount = await client.query(
          'SELECT COUNT(*) as count FROM balance_sheets WHERE company_id = $1',
          [req.user.company_id]
        );
        chatHistoryCount = await client.query(
          'SELECT COUNT(*) as count FROM chat_history WHERE user_id = $1',
          [req.user.id]
        );
      }

      res.json({
        balance_sheets_count: parseInt(balanceSheetsCount.rows[0].count),
        chat_history_count: parseInt(chatHistoryCount.rows[0].count)
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

module.exports = router; 