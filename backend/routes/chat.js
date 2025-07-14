const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Chat with AI about balance sheet data
router.post('/analyze', authenticateToken, async (req, res) => {
  try {
    const { question, balance_sheet_id, company_id } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const client = await pool.connect();
    
    try {
      let balanceSheetData = null;
      let companyName = null;

      if (balance_sheet_id) {
        // Get specific balance sheet data
        const result = await client.query(
          `SELECT bs.data, c.name as company_name, bs.company_id 
           FROM balance_sheets bs 
           LEFT JOIN companies c ON bs.company_id = c.id 
           WHERE bs.id = $1`,
          [balance_sheet_id]
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

        balanceSheetData = balanceSheet.data;
        companyName = balanceSheet.company_name;
      } else if (company_id) {
        // Get latest balance sheet data for the company
        const result = await client.query(
          `SELECT bs.data, c.name as company_name 
           FROM balance_sheets bs 
           LEFT JOIN companies c ON bs.company_id = c.id 
           WHERE bs.company_id = $1 
           ORDER BY bs.year DESC, bs.quarter DESC 
           LIMIT 1`,
          [company_id]
        );
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'No balance sheet data found for this company' });
        }

        // Check if user has access to this company's data
        if (req.user.role !== 'top_management' && 
            req.user.company_id !== company_id) {
          return res.status(403).json({ error: 'Access denied' });
        }

        balanceSheetData = result.rows[0].data;
        companyName = result.rows[0].company_name;
      } else {
        return res.status(400).json({ error: 'Either balance_sheet_id or company_id is required' });
      }

      // Prepare context for AI
      const balanceSheetContext = `
        Company: ${companyName}
        Balance Sheet Data: ${JSON.stringify(balanceSheetData, null, 2)}
        
        You are a financial analyst AI assistant. Analyze the balance sheet data and provide insights to help top management understand the company's financial performance.
        
        Focus on:
        - Key financial ratios and metrics
        - Trends and patterns
        - Risk assessment
        - Recommendations for management
        - Comparison with industry standards (if applicable)
        
        Provide clear, actionable insights that would be valuable for top management decision-making.
      `;

      const promptWithContext = `
        ${balanceSheetContext}
        
        User Question: ${question}
        
        Please provide a comprehensive analysis based on the balance sheet data. Include specific numbers, ratios, and actionable insights.

        At the end of your answer, output a JSON array of up to 3 suggested follow-up questions, like this:
        SuggestedQuestions: ["What is the trend in revenue?", "How does the debt-to-equity ratio compare to last year?", "What are the main risks for this company?"]
        Do not add any explanation or text after the array.
      `;

      // Generate AI response
      const result = await model.generateContent(promptWithContext);
      const aiResponse = result.response.text();

      // Save chat history
      await client.query(
        'INSERT INTO chat_history (user_id, question, response, balance_sheet_id, company_id) VALUES ($1, $2, $3, $4, $5)',
        [req.user.id, question, aiResponse, balance_sheet_id || null, company_id || null]
      );

      res.json({
        question: question,
        response: aiResponse,
        company_name: companyName
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Chat analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze balance sheet' });
  }
});

// Get chat history for user
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { company_id, limit = 50 } = req.query;

    const client = await pool.connect();
    
    try {
      let query = `
        SELECT ch.*, c.name as company_name 
        FROM chat_history ch 
        LEFT JOIN companies c ON ch.company_id = c.id 
        WHERE ch.user_id = $1
      `;
      let params = [req.user.id];
      let paramIndex = 2;

      if (company_id) {
        query += ` AND ch.company_id = $${paramIndex}`;
        params.push(company_id);
        paramIndex++;
      }

      query += ' ORDER BY ch.created_at DESC LIMIT $' + paramIndex;
      params.push(parseInt(limit));

      const result = await client.query(query, params);

      res.json({
        chat_history: result.rows.map(row => ({
          id: row.id,
          question: row.question,
          response: row.response,
          company_name: row.company_name,
          created_at: row.created_at
        }))
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
});

// Get quick insights for a company
router.get('/insights/:companyId', authenticateToken, async (req, res) => {
  try {
    const { companyId } = req.params;

    const client = await pool.connect();
    
    try {
      // Check if user has access to this company's data
      if (req.user.role !== 'top_management' && 
          req.user.company_id !== parseInt(companyId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Get latest balance sheet data
      const result = await client.query(
        `SELECT bs.data, c.name as company_name 
         FROM balance_sheets bs 
         LEFT JOIN companies c ON bs.company_id = c.id 
         WHERE bs.company_id = $1 
         ORDER BY bs.year DESC, bs.quarter DESC 
         LIMIT 1`,
        [companyId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'No balance sheet data found for this company' });
      }

      const balanceSheetData = result.rows[0].data;
      const companyName = result.rows[0].company_name;

      // Generate quick insights
      const insightsPrompt = `
        Company: ${companyName}
        Balance Sheet Data: ${JSON.stringify(balanceSheetData, null, 2)}
        
        Provide a brief summary of key insights for top management:
        1. Financial health overview
        2. Key ratios and metrics
        3. Potential concerns or opportunities
        4. Quick recommendations
        
        Keep it concise and actionable.
      `;

      const result2 = await model.generateContent(insightsPrompt);
      const insights = result2.response.text();

      res.json({
        company_name: companyName,
        insights: insights,
        data_summary: {
          total_assets: balanceSheetData.total_assets || 0,
          total_liabilities: balanceSheetData.total_liabilities || 0,
          total_equity: balanceSheetData.total_equity || 0
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ error: 'Failed to get insights' });
  }
});

module.exports = router; 