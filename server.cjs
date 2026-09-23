const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware with explicit CORS configuration
app.use(cors({
  origin: [
    'https://thrivetradingllc.com',
    'https://www.thrivetradingllc.com',
    'https://spectacular-moonbeam-708ac2.netlify.app',
    'http://localhost:5173',
    'http://localhost:5175',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// --- User Schema & Model ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, default: 'pending' }, // 'pending' / 'approved' / 'rejected'
  balance: { type: Number, default: 0 },
  activeTrades: { type: Number, default: 0 },
  totalProfit: { type: Number, default: 0 },
  portfolio: {
    equity: { type: Number, default: 0 },
    margin: { type: Number, default: 0 },
    pnl: { type: Number, default: 0 }
  },
  transactions: [{
    id: String,
    type: String,
    amount: Number,
    date: String,
    status: String
  }],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// --- Contact Schema & Model ---
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

// --- Auto-Create Admin Helper ---
async function createDefaultAdmin() {
  try {
    const adminEmail = 'thrivetradingllc@outlook.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const adminUser = new User({
        name: 'Administrator',
        email: adminEmail,
        password: 'AdminPassword123!',
        role: 'admin',
        status: 'approved',
        balance: 50000,
        activeTrades: 5,
        totalProfit: 4250,
        portfolio: { equity: 50000, margin: 5000, pnl: 4250 }
      });
      await adminUser.save();
      console.log('✅ Default admin account created successfully!');
    } else {
      console.log('ℹ️ Default admin account exists.');
    }
  } catch (err) {
    console.error('❌ Error creating default admin:', err);
  }
}

// --- Status Check Endpoint ---
app.get('/api/status', (req, res) => {
  res.json({ message: 'Thrivetrading backend server is active and running!' });
});

// --- Contact Form Endpoint ---
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    const newInquiry = new Contact({ name, email, message });
    await newInquiry.save();
    res.status(200).json({ success: true, message: 'Inquiry received successfully!' });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ success: false, message: 'Server error saving inquiry.' });
  }
});

// --- 1. USER SIGN UP ---
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    const newUser = new User({
      name,
      email,
      password,
      role: 'user',
      status: 'pending',
      balance: 1000, // Starting demo balance
      activeTrades: 0,
      totalProfit: 0,
      portfolio: { equity: 1000, margin: 0, pnl: 0 },
      transactions: []
    });

    await newUser.save();
    res.status(201).json({ message: 'Registration successful! Awaiting administrator approval.' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// --- 2. LOGIN ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.role !== 'admin' && user.status !== 'approved') {
      return res.status(403).json({ message: 'Your account is currently pending administrator approval.' });
    }

    const userObj = user.toObject();
    delete userObj.password;

    res.json({ message: 'Login successful', user: userObj });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// --- 3. ADMIN: GET ALL USERS ---
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users.' });
  }
});

// --- 4. EXECUTE TRADE ---
app.post('/api/trade/execute', async (req, res) => {
  try {
    const { userId, asset, amount, type } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient account balance.' });
    }

    user.balance -= amount;
    user.activeTrades += 1;
    
    const newTx = {
      id: 'TX-' + Date.now(),
      type: `${type} ${asset}`,
      amount: amount,
      date: new Date().toLocaleDateString(),
      status: 'Completed'
    };

    user.transactions.unshift(newTx);
    user.portfolio.equity = user.balance + amount;
    user.portfolio.margin += amount;

    await user.save();

    res.json({
      message: 'Trade executed successfully',
      balance: user.balance,
      portfolio: user.portfolio,
      activeTrades: user.activeTrades,
      transactions: user.transactions
    });
  } catch (error) {
    console.error('Trade execution error:', error);
    res.status(500).json({ message: 'Error executing trade.' });
  }
});

// --- 5. ADMIN: APPROVE USER ---
app.patch('/api/admin/users/:id/approve', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User approved successfully', user });
  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ message: 'Error approving user.' });
  }
});

// --- 6. ADMIN: REJECT / LOCK USER ---
app.patch('/api/admin/users/:id/reject', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User locked successfully', user });
  } catch (error) {
    console.error('Reject error:', error);
    res.status(500).json({ message: 'Error locking user.' });
  }
});

// --- 7. ADMIN: UPDATE USER FIGURES (Balance, Trades, Profit) ---
app.patch('/api/admin/users/:id/update', async (req, res) => {
  try {
    const { balance, activeTrades, totalProfit } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          balance: Number(balance), 
          activeTrades: Number(activeTrades), 
          totalProfit: Number(totalProfit) 
        } 
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.json({ message: 'User figures updated successfully', user });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Error updating user figures.' });
  }
});

// --- Database Connection & Server Startup ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/thrivetrading';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB successfully');
    await createDefaultAdmin();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });