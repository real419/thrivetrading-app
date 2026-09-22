const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  asset: { type: String, required: true },
  type: { type: String, enum: ['BUY', 'SELL'], required: true },
  amount: { type: Number, required: true },
  entryPrice: { type: Number, required: true },
  status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },
  pnl: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Trade', tradeSchema);