const express = require('express');
const multer = require('multer');
const pool = require('../config/database');
const { authenticateToken, requireAnalyst, requireCEO } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json' || file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Only JSON and CSV files are allowed'), false);
    }
  }
});

// Upload balance sheet data
router.post('/upload', authenticateToken, requireAnalyst, upload.single('file'), async (req, res) => {
  try {
    const { company_id, year, quarter } = req.body;
    const file = req.file;

    if (!file || !company_id || !year) {
      return res.status(400).json({ error: 'File, company_id, and year are required' });
    }

    let balanceSheetData;
    
    try {
      if (file.mimetype === 'application/json') {
        balanceSheetData = JSON.parse(file.buffer.toString());
      } else {
        // Handle CSV parsing here if needed
        return res.status(400).json({ error: 'CSV parsing not implemented yet' });
      }
    } catch (error) {
      return res.status(400).json({ error: 'Invalid file format' });
    }

    const client = await pool.connect();
    
    try {
      // Check if balance sheet for this company and year already exists
      const existingResult = await client.query(
        'SELECT id FROM balance_sheets WHERE company_id = $1 AND year = $2 AND quarter = $3',
        [company_id, year, quarter || null]
      );
      
      if (existingResult.rows.length > 0) {
        return res.status(400).json({ error: 'Balance sheet for this company, year, and quarter already exists' });
      }

      // Insert balance sheet data
      const result = await client.query(
        'INSERT INTO balance_sheets (company_id, year, quarter, data, uploaded_by) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [company_id, year, quarter || null, JSON.stringify(balanceSheetData), req.user.id]
      );

      res.status(201).json({
        message: 'Balance sheet uploaded successfully',
        id: result.rows[0].id
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload balance sheet' });
  }
});

// Get balance sheets for a company
router.get('/company/:companyId', authenticateToken, async (req, res) => {
  try {
    const { companyId } = req.params;
    const { year, quarter } = req.query;

    const client = await pool.connect();
    
    try {
      let query = `
        SELECT bs.*, u.name as uploaded_by_name 
        FROM balance_sheets bs 
        LEFT JOIN users u ON bs.uploaded_by = u.id 
        WHERE bs.company_id = $1
      `;
      let params = [companyId];
      let paramIndex = 2;

      if (year) {
        query += ` AND bs.year = $${paramIndex}`;
        params.push(year);
        paramIndex++;
      }

      if (quarter) {
        query += ` AND bs.quarter = $${paramIndex}`;
        params.push(quarter);
      }

      query += ' ORDER BY bs.year DESC, bs.quarter DESC';

      const result = await client.query(query, params);

      res.json({
        balance_sheets: result.rows.map(row => ({
          id: row.id,
          year: row.year,
          quarter: row.quarter,
          data: row.data,
          uploaded_by: row.uploaded_by_name,
          created_at: row.created_at
        }))
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get balance sheets error:', error);
    res.status(500).json({ error: 'Failed to get balance sheets' });
  }
});

// Get specific balance sheet
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT bs.*, u.name as uploaded_by_name, c.name as company_name 
         FROM balance_sheets bs 
         LEFT JOIN users u ON bs.uploaded_by = u.id 
         LEFT JOIN companies c ON bs.company_id = c.id 
         WHERE bs.id = $1`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Balance sheet not found' });
      }

      const balanceSheet = result.rows[0];

      // Check if user has access to this company's data
      if (req.user.role !== 'top_management' && 
          req.user.company_id !== balanceSheet.company_id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({
        balance_sheet: {
          id: balanceSheet.id,
          year: balanceSheet.year,
          quarter: balanceSheet.quarter,
          data: balanceSheet.data,
          company_name: balanceSheet.company_name,
          uploaded_by: balanceSheet.uploaded_by_name,
          created_at: balanceSheet.created_at
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get balance sheet error:', error);
    res.status(500).json({ error: 'Failed to get balance sheet' });
  }
});

// Delete balance sheet
router.delete('/:id', authenticateToken, requireAnalyst, async (req, res) => {
  try {
    const { id } = req.params;

    const client = await pool.connect();
    
    try {
      // Check if balance sheet exists and user has access
      const checkResult = await client.query(
        'SELECT company_id FROM balance_sheets WHERE id = $1',
        [id]
      );
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Balance sheet not found' });
      }

      const balanceSheet = checkResult.rows[0];

      // Check if user has access to this company's data
      if (req.user.role !== 'top_management' && 
          req.user.company_id !== balanceSheet.company_id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await client.query('DELETE FROM balance_sheets WHERE id = $1', [id]);

      res.json({ message: 'Balance sheet deleted successfully' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete balance sheet error:', error);
    res.status(500).json({ error: 'Failed to delete balance sheet' });
  }
});

// Get balance sheet statistics
router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT data, company_id FROM balance_sheets WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Balance sheet not found' });
      }

      const balanceSheet = result.rows[0];

      // Check if user has access to this company's data
      if (req.user.role !== 'top_management' && 
          req.user.company_id !== balanceSheet.company_id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const data = balanceSheet.data;
      
      // Calculate basic statistics
      const stats = {
        total_assets: data.total_assets || 0,
        total_liabilities: data.total_liabilities || 0,
        total_equity: data.total_equity || 0,
        current_ratio: data.current_assets && data.current_liabilities ? 
          (data.current_assets / data.current_liabilities).toFixed(2) : null,
        debt_to_equity: data.total_liabilities && data.total_equity ? 
          (data.total_liabilities / data.total_equity).toFixed(2) : null
      };

      res.json({ stats });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

module.exports = router; 