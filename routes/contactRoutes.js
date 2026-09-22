const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    // Here you could plug in Nodemailer to forward client messages to your inbox
    console.log(`Support Message from ${name} (${email}): ${message}`);
    res.json({ success: true, message: 'Message sent successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;