const express = require('express');
const router = express.Router();
const db = require('../../config/db'); 

// GET Dashboard Overview Stats
router.get('/stats', async (req, res) => {
  try {
    // 1. TOTAL REVENUE & TRANSACTIONS (All Time)
    // Note: Ang 'sales' ay View na ginawa natin sa database, kaya okay lang na 'sales' ang tawag dito.
    const [salesStats] = await db.query(`
      SELECT 
        IFNULL(SUM(amount), 0) as totalRevenue, 
        COUNT(*) as totalTransactions 
      FROM sales
    `);

    // 2. SALES BY SERVICE TYPE (Pie Chart)
    const [salesByService] = await db.query(`
      SELECT serviceType as name, SUM(amount) as value 
      FROM sales 
      GROUP BY serviceType 
      ORDER BY value DESC
    `);

    // 3. FEEDBACK STATS
    // FIXED: Pinalitan ang 'feedback' -> 'FeedbackDb'
    const [feedbackStats] = await db.query(`
      SELECT COUNT(*) as totalFeedback FROM FeedbackDb
    `);

    // 4. FEEDBACK DISTRIBUTION (Pie Chart)
    // FIXED: Pinalitan ang 'feedback' -> 'FeedbackDb'
    const [feedbackDist] = await db.query(`
      SELECT 
        CASE 
          WHEN rating >= 4 THEN 'Positive'
          WHEN rating = 3 THEN 'Neutral'
          ELSE 'Negative'
        END as name,
        COUNT(*) as value
      FROM FeedbackDb
      GROUP BY 
        CASE 
          WHEN rating >= 4 THEN 'Positive'
          WHEN rating = 3 THEN 'Neutral'
          ELSE 'Negative'
        END
    `);

    res.json({
      totalRevenue: salesStats[0].totalRevenue,
      totalTransactions: salesStats[0].totalTransactions,
      totalFeedback: feedbackStats[0].totalFeedback,
      salesByService,
      feedbackDistribution: feedbackDist
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return default zero values on error para hindi sumabog ang frontend
    res.status(500).json({ 
      totalRevenue: 0, 
      totalTransactions: 0, 
      totalFeedback: 0, 
      salesByService: [], 
      feedbackDistribution: [] 
    });
  }
});

module.exports = router;