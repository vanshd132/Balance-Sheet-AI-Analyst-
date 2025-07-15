const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
        // Get ALL balance sheet data for the company across all years
        const result = await client.query(
          `SELECT bs.data, bs.year, bs.quarter, c.name as company_name 
           FROM balance_sheets bs 
           LEFT JOIN companies c ON bs.company_id = c.id 
           WHERE bs.company_id = $1 
           ORDER BY bs.year DESC, bs.quarter DESC`,
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

        // Organize all balance sheet data by year and quarter
        const allBalanceSheetData = {};
        result.rows.forEach(row => {
          const yearKey = row.year;
          const quarterKey = row.quarter || 'annual';
          if (!allBalanceSheetData[yearKey]) {
            allBalanceSheetData[yearKey] = {};
          }
          allBalanceSheetData[yearKey][quarterKey] = row.data;
        });

        balanceSheetData = allBalanceSheetData;
        companyName = result.rows[0].company_name;
      } else {
        return res.status(400).json({ error: 'Either balance_sheet_id or company_id is required' });
      }

      // Prepare context for AI
      let balanceSheetContext;
      
      if (balance_sheet_id) {
        // Single balance sheet analysis
        balanceSheetContext = `
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
      } else {
        // Multi-year analysis
        balanceSheetContext = `
          Company: ${companyName}
          
          You have access to COMPLETE financial data for this company across ALL available years and quarters:
          ${JSON.stringify(balanceSheetData, null, 2)}
          
          This data is organized by year and quarter, showing the company's financial evolution over time.
          
          You are a senior financial analyst AI assistant. Provide comprehensive analysis using ALL available data:
          
          Analysis Requirements:
          1. **Multi-Year Trends**: Analyze how key metrics have changed over time
          2. **Quarterly Patterns**: Identify seasonal patterns and quarterly performance
          3. **Growth Analysis**: Calculate year-over-year and quarter-over-quarter growth rates
          4. **Financial Ratios**: Compute and compare ratios across all periods
          5. **Risk Assessment**: Identify trends in liquidity, solvency, and profitability
          6. **Strategic Insights**: Provide actionable recommendations based on historical patterns
          7. **Performance Comparison**: Compare different years and quarters
          
          When analyzing, always reference specific years and quarters, and provide concrete numbers and percentages.
          
          Focus on providing insights that help top management understand:
          - Long-term financial health trends
          - Seasonal performance patterns
          - Growth trajectory and sustainability
          - Risk factors and opportunities
          - Strategic recommendations for future planning
        `;
      }

      const promptWithContext = `
        ${balanceSheetContext}
        
        User Question: ${question}
        
        Please provide a comprehensive analysis using ALL available data. Include specific numbers, ratios, percentages, and actionable insights. Reference specific years and quarters when making comparisons.

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

      // Get ALL balance sheet data for the company
      const result = await client.query(
        `SELECT bs.data, bs.year, bs.quarter, c.name as company_name 
         FROM balance_sheets bs 
         LEFT JOIN companies c ON bs.company_id = c.id 
         WHERE bs.company_id = $1 
         ORDER BY bs.year DESC, bs.quarter DESC`,
        [companyId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'No balance sheet data found for this company' });
      }

      // Organize all balance sheet data by year and quarter
      const allBalanceSheetData = {};
      result.rows.forEach(row => {
        const yearKey = row.year;
        const quarterKey = row.quarter || 'annual';
        if (!allBalanceSheetData[yearKey]) {
          allBalanceSheetData[yearKey] = {};
        }
        allBalanceSheetData[yearKey][quarterKey] = row.data;
      });

      const balanceSheetData = allBalanceSheetData;
      const companyName = result.rows[0].company_name;

      // Generate comprehensive insights using all data
      const insightsPrompt = `
        Company: ${companyName}
        
        You have access to COMPLETE financial data for this company across ALL available years and quarters:
        ${JSON.stringify(balanceSheetData, null, 2)}
        
        Provide a comprehensive summary of key insights for top management using ALL available data:
        
        1. **Multi-Year Financial Health Overview**: Analyze trends across all years
        2. **Key Performance Indicators**: Calculate and compare ratios across all periods
        3. **Growth Trajectory**: Identify year-over-year and quarter-over-quarter patterns
        4. **Risk Assessment**: Identify potential concerns based on historical trends
        5. **Strategic Opportunities**: Highlight opportunities based on performance patterns
        6. **Quick Recommendations**: Provide actionable insights for management
        
        Reference specific years and quarters when making comparisons. Keep it comprehensive but concise.
      `;

      const result2 = await model.generateContent(insightsPrompt);
      const insights = result2.response.text();

      // Calculate summary statistics from all available data
      const years = Object.keys(allBalanceSheetData).sort((a, b) => b - a); // Sort years descending
      const latestYear = years[0];
      const latestQuarter = Object.keys(allBalanceSheetData[latestYear] || {}).sort((a, b) => b - a)[0];
      const latestData = allBalanceSheetData[latestYear]?.[latestQuarter] || {};

      res.json({
        company_name: companyName,
        insights: insights,
        data_summary: {
          total_assets: latestData.total_assets || 0,
          total_liabilities: latestData.total_liabilities || 0,
          total_equity: latestData.total_equity || 0,
          available_years: years,
          total_periods: result.rows.length,
          latest_period: `${latestYear} Q${latestQuarter || 'N/A'}`
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