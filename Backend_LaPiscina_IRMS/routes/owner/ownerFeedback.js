const express = require('express');
const router = express.Router();
const db = require('../../config/db'); 

// GET FeedbackDb Data
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, filter } = req.query;

    let query = 'SELECT * FROM FeedbackDb';
    const params = [];
    const conditions = [];

    // 1. DATE FILTER
    if (startDate && endDate) {
      conditions.push('date BETWEEN ? AND ?');
      params.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
    }

    // 2. CATEGORY FILTER
    if (filter === 'positive') {
        conditions.push('rating >= 4');
    } else if (filter === 'negative') {
        conditions.push('rating <= 2');
    } else if (filter === 'neutral') {
        conditions.push('rating = 3');
    }

    // Pagsamahin ang mga conditions
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Sort by newest first
    query += ' ORDER BY date DESC';
    
    // Query the database
    const [rows] = await db.query(query, params);
    
    // IMPORTANT FIX:
    // Ibinabalik natin ito bilang 'feedback' (small letter f) 
    // kasi 'yun ang kilala ng Frontend mo dati.
    res.json({ feedback: rows });

  } catch (error) {
    console.error('Error fetching FeedbackDb:', error);
    
    // Handle case kung wala pang table
    if (error.code === 'ER_NO_SUCH_TABLE') {
        return res.json({ feedback: [] }); 
    }
    res.status(500).json({ message: 'Error fetching FeedbackDb data', feedback: [] });
  }
});

module.exports = router;