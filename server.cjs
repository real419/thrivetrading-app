const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- User Schema & Model ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, default: 'Pending' }, // 'Pending' / 'Approved'
  initialDeposit: { type: String, default: '$0.00' },
  interest: { type: String, default: '$0.00' },
  total: { type: String, default: '$0.00' },
  positions: [{
    id: String,
    asset: String,
    type: String,
    entry: String,
    amount: String,
    pnl: String,
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
        status: 'Approved',
        initialDeposit: '$50,000.00',
        interest: '$4,250.00',
        total: '$54,250.00'
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
    const { name, email, password, phone } = req.body;
    
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
      phone: phone || '',
      role: 'user',
      status: 'Pending', 
      initialDeposit: '$0.00',
      interest: '$0.00',
      total: '$0.00',
      positions: []
    });

    await newUser.save();
    res.status(201).json({ message: 'Registration successful! Awaiting administrator approval.' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// --- 2. LOGIN (Strict approval enforcement) ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Enforce that non-admin users must be approved by admin before accessing portal
    if (user.role !== 'admin' && user.status !== 'Approved') {
      return res.status(403).json({ message: 'Your account is currently pending administrator approval.' });
    }

    const userObj = user.toObject();
    delete userObj.password;
    userObj.id = userObj._id.toString();

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
    const formattedUsers = users.map(u => {
      const obj = u.toObject();
      obj.id = obj._id.toString();
      return obj;
    });
    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users.' });
  }
});

// --- 4. FETCH POSITIONS FOR USER ---
app.get('/api/positions', async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user.positions || []);
  } catch (error) {
    console.error('Error fetching positions:', error);
    res.status(500).json({ message: 'Error fetching positions.' });
  }
});

// --- 5. EXECUTE TRADE ---
app.post('/api/trades/execute', async (req, res) => {
  try {
    const { email, asset, type, amount } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found.' });

    const newPosition = {
      id: 'pos-' + Date.now(),
      asset,
      type,
      entry: asset.includes('Bitcoin') ? '$67,420.50' : asset.includes('Ethereum') ? '$3,610.80' : '1.0924',
      amount,
      pnl: '+$0.00',
      status: 'Open'
    };

    user.positions.unshift(newPosition);
    await user.save();

    res.json({ message: 'Trade executed successfully', position: newPosition });
  } catch (error) {
    console.error('Trade execution error:', error);
    res.status(500).json({ message: 'Error executing trade.' });
  }
});

// --- 6. ADMIN: UPDATE USER STATUS (Approve / Lock) ---
app.patch('/api/admin/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found.' });
    
    const userObj = user.toObject();
    userObj.id = userObj._id.toString();

    res.json({ message: 'User status updated successfully', user: userObj });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Error updating status.' });
  }
});

// --- 7. ADMIN: UPDATE USER INDIVIDUAL FIELDS (Edit Figures) ---
app.patch('/api/admin/users/:id/fields', async (req, res) => {
  try {
    const { field, value } = req.body;
    
    const allowedFields = ['initialDeposit', 'interest', 'total', 'status', 'name', 'phone'];
    if (!allowedFields.includes(field)) {
      return res.status(400).json({ message: 'Invalid field update request.' });
    }

    const updateData = { [field]: value };

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found.' });

    const userObj = user.toObject();
    userObj.id = userObj._id.toString();

    res.json({ message: 'User field updated successfully', user: userObj });
  } catch (error) {
    console.error('Field update error:', error);
    res.status(500).json({ message: 'Error updating user field.' });
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