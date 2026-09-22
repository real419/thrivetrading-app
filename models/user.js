const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'admin'], default: 'client' },
  isApproved: { type: Boolean, default: false }, // Controlled by admin dashboard
  initialDeposit: { type: Number, default: 0 },
  interest: { type: Number, default: 0 },
  totalBalance: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);