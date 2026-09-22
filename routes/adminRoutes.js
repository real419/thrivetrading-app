const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Get all users (Admin dashboard view)
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Toggle user status / approval
router.patch('/users/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { isApproved } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isApproved }, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update client financial figures (Deposit, Interest, Total Balance)
router.patch('/users/:id/fields', protect, adminOnly, async (req, res) => {
  try {
    const { initialDeposit, interest, totalBalance } = req.body;
    const updateData = {};
    if (initialDeposit !== undefined) updateData.initialDeposit = initialDeposit;
    if (interest !== undefined) updateData.interest = interest;
    if (totalBalance !== undefined) updateData.totalBalance = totalBalance;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;