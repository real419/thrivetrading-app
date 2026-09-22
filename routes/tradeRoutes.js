const express = require('express');
const router = express.Router();
const Trade = require('../models/Trade');
const { protect } = require('../middleware/authMiddleware');

// Get user positions
router.get('/', protect, async (req, res) => {
  try {
    const trades = await Trade.find({ userEmail: req.query.email || req.user.email });
    res.json({ success: true, trades });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Execute new trade
router.post('/execute', protect, async (req, res) => {
  try {
    const { userEmail, asset, type, amount, entryPrice } = req.body;
    const trade = await Trade.create({
      userEmail,
      asset,
      type,
      amount,
      entryPrice,
      status: 'OPEN'
    });
    res.status(201).json({ success: true, trade });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;