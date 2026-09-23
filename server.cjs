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
  status: { type: String, default: 'Pending' }, // 'Pending' / 'Approved' / 'Rejected'
  initialDeposit: { type: String, default: '$0.00' },
  interest: { type: String, default: '$0.00' },
  total: { type: String, default: '$0.00' },
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

// --- Position / Trade Schema & Model ---
const positionSchema = new mongoose.Schema({
  email: { type: String, required: true },
  asset: { type: String, required: true },
  type: { type: String, required: true }, // BUY / SELL
  entry: { type: String, required: true },
  amount: { type: String, required: true },
  pnl: { type: String, default: '+$0.00' },
  status: { type: String, default: 'Open' },
  createdAt: { type: Date, default: Date.now }
});

const Position = mongoose.model('Position', positionSchema);

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
        status: 'Approved',
        initialDeposit: '$50,000',
        interest: '$4,250',
        total: '$54,250'
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
    const { name, phone, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    const newUser = new User({
      name,
      phone: phone || '',
      email,
      password,
      role: 'user',
      status: 'Pending',
      initialDeposit: '$1,000.00',
      interest: '$0.00',
      total: '$1,000.00',
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

    if (user.role !== 'admin' && user.status !== 'Approved') {
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
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users.' });
  }
});

// --- 4. ADMIN: UPDATE USER STATUS ---
app.patch('/api/admin/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'Status updated successfully', user });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ message: 'Error updating user status.' });
  }
});

// --- 5. ADMIN: UPDATE INDIVIDUAL USER FIELD (initialDeposit, interest, total) ---
app.patch('/api/admin/users/:id/fields', async (req, res) => {
  try {
    const { field, value } = req.body;
    const allowedFields = ['initialDeposit', 'interest', 'total', 'name', 'phone'];
    
    if (!allowedFields.includes(field)) {
      return res.status(400).json({ message: 'Invalid field update target.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { [field]: value },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'Field updated successfully', user });
  } catch (error) {
    console.error('Field update error:', error);
    res.status(500).json({ message: 'Error updating field.' });
  }
});

// --- 6. GET POSITIONS FOR USER ---
app.get('/api/positions', async (req, res) => {
  try {
    const { email } = req.query;
    const query = email ? { email } : {};
    const positions = await Position.find(query).sort({ createdAt: -1 });
    res.json(positions);
  } catch (error) {
    console.error('Error fetching positions:', error);
    res.status(500).json({ message: 'Error fetching positions.' });
  }
});

// --- 7. EXECUTE TRADE ---
app.post('/api/trades/execute', async (req, res) => {
  try {
    const { email, asset, type, amount } = req.body;
    if (!email || !asset || !type || !amount) {
      return res.status(400).json({ message: 'Missing trade execution parameters.' });
    }

    const entryPrices = {
      'Bitcoin (BTC)': '$67,420.50',
      'Ethereum (ETH)': '$3,610.80',
      'EUR/USD': '1.0924'
    };

    const newPosition = new Position({
      email,
      asset,
      type,
      entry: entryPrices[asset] || '$100.00',
      amount: String(amount),
      pnl: '+$0.00',
      status: 'Open'
    });

    await newPosition.save();
    res.status(201).json({ message: 'Trade executed successfully', position: newPosition });
  } catch (error) {
    console.error('Trade execution error:', error);
    res.status(500).json({ message: 'Error executing trade.' });
  }
});

// --- Database Connection & Server Startup ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/thrivetrading';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB successfully');
    await createDefaultAdmin();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });