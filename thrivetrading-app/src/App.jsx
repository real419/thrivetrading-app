import React, { useState, useEffect } from 'react';

// Use environment variables for API base, falling back to localhost for local development
const API_BASE = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api` 
  : 'http://localhost:5000/api';

export default function App() {
  // Navigation & View States
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'auth' | 'dashboard' | 'admin'
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [dashboardTab, setDashboardTab] = useState('overview'); // 'overview' | 'trading' | 'history' | 'admin'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('crypto'); // Landing page markets tab

  // Database Users State for Admin Panel
  const [usersList, setUsersList] = useState([]);

  // Mock User & Profile States
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  // Auth Form State
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '', phone: '' });

  // Trading Form States
  const [tradeAsset, setTradeAsset] = useState('Bitcoin (BTC)');
  const [tradeType, setTradeType] = useState('BUY');
  const [tradeAmount, setTradeAmount] = useState('');

  // Active Positions State
  const [positions, setPositions] = useState([
    { id: 1, asset: 'Bitcoin (BTC)', type: 'BUY', entry: '$67,420.50', amount: '0.75 BTC', pnl: '+$1,420.00', status: 'Active' },
    { id: 2, asset: 'Ethereum (ETH)', type: 'BUY', entry: '$3,610.80', amount: '4.20 ETH', pnl: '+$340.50', status: 'Active' },
    { id: 3, asset: 'EUR/USD', type: 'SELL', entry: '1.0924', amount: '10,000 EUR', pnl: '+$115.20', status: 'Active' }
  ]);

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  // Logo asset reference
  const logoImage = "logo.png";

  // Fetch Admin Data when viewing admin tab
  useEffect(() => {
    if (dashboardTab === 'admin' && currentUserProfile?.role === 'admin') {
      fetchAdminData();
    }
  }, [dashboardTab, currentUserProfile]);

  const fetchAdminData = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/users`);
      const data = await res.json();
      if (res.ok) {
        setUsersList(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Handlers
  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    if (authMode === 'signin') {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authForm.email, password: authForm.password })
        });
        const data = await res.json();

        if (!res.ok) {
          alert(data.message || 'Login failed.');
          return;
        }

        setCurrentUserProfile({
          id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          balance: data.user.balance,
          activeTrades: data.user.activeTrades,
          totalProfit: data.user.totalProfit,
          portfolio: data.user.portfolio,
          transactions: data.user.transactions
        });

        setCurrentView('dashboard');
        setDashboardTab(data.role === 'admin' ? 'admin' : 'overview');
      } catch (err) {
        console.error('Login error:', err);
        alert('Network error connecting to backend server.');
      }
    } else {
      // Signup mode
      try {
        const res = await fetch(`${API_BASE}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: authForm.name, email: authForm.email, password: authForm.password })
        });
        const data = await res.json();

        if (!res.ok) {
          alert(data.message || 'Registration failed.');
          return;
        }

        alert(data.message);
        setAuthMode('signin');
      } catch (err) {
        console.error('Signup error:', err);
        alert('Network error connecting to backend server.');
      }
    }
  };

  const handleExecuteTrade = async (e) => {
    e.preventDefault();
    if (!tradeAmount) return;

    try {
      const res = await fetch(`${API_BASE}/trade/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserProfile.id,
          asset: tradeAsset,
          amount: parseFloat(tradeAmount),
          type: tradeType
        })
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Trade execution failed.');
        return;
      }

      setCurrentUserProfile(prev => ({
        ...prev,
        balance: data.balance,
        portfolio: data.portfolio,
        activeTrades: data.activeTrades,
        transactions: data.transactions
      }));

      setTradeAmount('');
      alert(`Successfully executed ${tradeType} order for ${tradeAsset}!`);
      setDashboardTab('history');
    } catch (err) {
      console.error('Trade error:', err);
      alert('Error executing trade.');
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Contact error:', err);
    }
  };

  const handleUpdateUserStatus = async (id, newStatus) => {
    try {
      const endpoint = newStatus === 'approved' ? 'approve' : 'reject';
      const res = await fetch(`${API_BASE}/admin/users/${id}/${endpoint}`, {
        method: 'PATCH'
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  const handleUpdateUserFigures = async (id, balance, activeTrades, totalProfit) => {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${id}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance, activeTrades, totalProfit })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error('Figure update error:', err);
    }
  };

  // ==========================================
  // AUTHENTICATION VIEW
  // ==========================================
  if (currentView === 'auth') {
    return (
      <div style={{ backgroundColor: '#0A0F1D', color: '#F3F4F6', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: '440px', backgroundColor: '#111827', padding: '40px', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.3)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '16px' }} onClick={() => setCurrentView('landing')}>
              <img src={logoImage} alt="Logo" style={{ height: '36px', width: '36px', objectFit: 'contain', borderRadius: '8px' }} onError={(e)=>{e.target.style.display='none'}} />
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#FFFFFF' }}>
                Thrivetrading<span style={{ color: '#38BDF8' }}>llc</span>
              </span>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#FFFFFF', marginBottom: '8px' }}>
              {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p style={{ fontSize: '13px', color: '#94A3B8' }}>
              {authMode === 'signin' ? 'Sign in with your registered account credentials.' : 'Register for institutional portfolio management. Requires admin approval.'}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {authMode === 'signup' && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#E2E8F0', marginBottom: '6px' }}>Full Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="John Doe"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', backgroundColor: '#1E293B', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#FFFFFF', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#E2E8F0', marginBottom: '6px' }}>Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="thrivetradingllc@outlook.com"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', backgroundColor: '#1E293B', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#FFFFFF', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#E2E8F0', marginBottom: '6px' }}>Password</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', backgroundColor: '#1E293B', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#FFFFFF', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button 
              type="submit"
              style={{ width: '100%', background: 'linear-gradient(to right, #2563EB, #1D4ED8)', color: '#FFFFFF', fontWeight: 700, padding: '14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '15px', marginTop: '8px' }}
            >
              {authMode === 'signin' ? 'Sign In' : 'Complete Registration'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#94A3B8' }}>
            {authMode === 'signin' ? (
              <span>Don't have an account? <button onClick={() => setAuthMode('signup')} style={{ background: 'none', border: 'none', color: '#38BDF8', fontWeight: 700, cursor: 'pointer' }}>Sign up</button></span>
            ) : (
              <span>Already registered? <button onClick={() => setAuthMode('signin')} style={{ background: 'none', border: 'none', color: '#38BDF8', fontWeight: 700, cursor: 'pointer' }}>Sign in</button></span>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button onClick={() => setCurrentView('landing')} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '12px', cursor: 'pointer' }}>← Return to Home</button>
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD VIEW
  // ==========================================
  if (currentView === 'dashboard' && currentUserProfile) {
    return (
      <div style={{ backgroundColor: '#0A0F1D', color: '#F3F4F6', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        
        {/* TOP NAVBAR */}
        <header style={{ backgroundColor: '#111827', borderBottom: '1px solid rgba(59, 130, 246, 0.2)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setCurrentView('landing')}>
            <img src={logoImage} alt="Logo" style={{ height: '32px', width: '32px', objectFit: 'contain', borderRadius: '6px' }} onError={(e)=>{e.target.style.display='none'}} />
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF' }}>
              Thrivetrading<span style={{ color: '#38BDF8' }}>llc</span>
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '13px', color: '#94A3B8' }}>User: <strong style={{ color: '#FFFFFF' }}>{currentUserProfile.name}</strong></span>
            <button 
              onClick={() => { setCurrentUserProfile(null); setCurrentView('landing'); }}
              style={{ backgroundColor: '#1E293B', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* SUB-NAV TABS */}
        <div style={{ backgroundColor: '#070A14', borderBottom: '1px solid rgba(59, 130, 246, 0.2)', padding: '12px 24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {currentUserProfile.role === 'admin' ? (
            <button 
              onClick={() => setDashboardTab('admin')}
              style={{ backgroundColor: '#2563EB', color: '#FFFFFF', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              Admin Management Console
            </button>
          ) : (
            <>
              <button 
                onClick={() => setDashboardTab('overview')}
                style={{ backgroundColor: dashboardTab === 'overview' ? '#2563EB' : '#111827', color: dashboardTab === 'overview' ? '#FFFFFF' : '#94A3B8', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                Portfolio Overview
              </button>
              <button 
                onClick={() => setDashboardTab('trading')}
                style={{ backgroundColor: dashboardTab === 'trading' ? '#2563EB' : '#111827', color: dashboardTab === 'trading' ? '#FFFFFF' : '#94A3B8', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                Execution Desk
              </button>
              <button 
                onClick={() => setDashboardTab('history')}
                style={{ backgroundColor: dashboardTab === 'history' ? '#2563EB' : '#111827', color: dashboardTab === 'history' ? '#FFFFFF' : '#94A3B8', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                Transactions & History
              </button>
            </>
          )}
        </div>

        {/* DASHBOARD CONTENT AREA */}
        <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
          
          {/* ADMIN EDITING PANEL */}
          {dashboardTab === 'admin' && currentUserProfile.role === 'admin' ? (
            <div style={{ backgroundColor: '#111827', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '32px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#FFFFFF', marginBottom: '8px' }}>Administrator User Control Console</h2>
              <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '24px' }}>Review user accounts, approve registrations, and directly edit account balances and performance figures.</p>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '950px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(59, 130, 246, 0.2)', backgroundColor: 'rgba(30, 41, 59, 0.5)', color: '#94A3B8', fontSize: '12px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '16px' }}>Client Name</th>
                      <th style={{ padding: '16px' }}>Email</th>
                      <th style={{ padding: '16px' }}>Balance ($)</th>
                      <th style={{ padding: '16px' }}>Active Trades</th>
                      <th style={{ padding: '16px' }}>Total Profit ($)</th>
                      <th style={{ padding: '16px' }}>Status</th>
                      <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '14px' }}>
                    {usersList.map((u) => {
                      return (
                        <AdminUserRow key={u._id} user={u} onUpdateStatus={handleUpdateUserStatus} onUpdateFigures={handleUpdateUserFigures} />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <>
              {/* PROMINENT USER ACCOUNT TICKERS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div style={{ backgroundColor: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
                  <span style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '4px' }}>Account Balance</span>
                  <span style={{ fontSize: '22px', fontWeight: 900, color: '#38BDF8' }}>${currentUserProfile.balance?.toFixed(2)}</span>
                </div>
                <div style={{ backgroundColor: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid rgba(52, 211, 153, 0.4)' }}>
                  <span style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '4px' }}>Total Profit</span>
                  <span style={{ fontSize: '22px', fontWeight: 900, color: '#34D399' }}>${currentUserProfile.totalProfit?.toFixed(2)}</span>
                </div>
                <div style={{ backgroundColor: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
                  <span style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '4px' }}>Active Trades</span>
                  <span style={{ fontSize: '22px', fontWeight: 900, color: '#FFFFFF' }}>{currentUserProfile.activeTrades}</span>
                </div>
              </div>

              {dashboardTab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                  <div style={{ backgroundColor: '#111827', padding: '32px', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px' }}>Portfolio Margin & Equity</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#1E293B', borderRadius: '8px' }}>
                        <span style={{ color: '#94A3B8' }}>Equity</span>
                        <span style={{ color: '#FFFFFF', fontWeight: 700 }}>${currentUserProfile.portfolio?.equity?.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#1E293B', borderRadius: '8px' }}>
                        <span style={{ color: '#94A3B8' }}>Margin Used</span>
                        <span style={{ color: '#38BDF8', fontWeight: 700 }}>${currentUserProfile.portfolio?.margin?.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#1E293B', borderRadius: '8px' }}>
                        <span style={{ color: '#94A3B8' }}>PnL</span>
                        <span style={{ color: '#34D399', fontWeight: 700 }}>${currentUserProfile.portfolio?.pnl?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#111827', padding: '32px', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '12px' }}>Quick Actions</h3>
                      <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '20px' }}>
                        Execute orders instantly or fund your account.
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <button onClick={() => setDashboardTab('trading')} style={{ width: '100%', backgroundColor: '#2563EB', color: '#FFFFFF', padding: '12px', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                        Open Trade Ticket
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {dashboardTab === 'trading' && (
                <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#111827', padding: '40px', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>Instant Execution Desk</h3>
                  <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '24px' }}>Route orders directly against your available account balance.</p>
                  
                  <form onSubmit={handleExecuteTrade} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', backgroundColor: '#1E293B', padding: '4px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                      <button 
                        type="button" 
                        onClick={() => setTradeType('BUY')}
                        style={{ flex: 1, padding: '10px', borderRadius: '6px', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer', backgroundColor: tradeType === 'BUY' ? '#22C55E' : 'transparent', color: tradeType === 'BUY' ? '#FFFFFF' : '#94A3B8' }}
                      >
                        BUY / LONG
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setTradeType('SELL')}
                        style={{ flex: 1, padding: '10px', borderRadius: '6px', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer', backgroundColor: tradeType === 'SELL' ? '#EF4444' : 'transparent', color: tradeType === 'SELL' ? '#FFFFFF' : '#94A3B8' }}
                      >
                        SELL / SHORT
                      </button>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#E2E8F0', marginBottom: '8px' }}>Select Asset</label>
                      <select 
                        value={tradeAsset} 
                        onChange={(e) => setTradeAsset(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', backgroundColor: '#1E293B', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#FFFFFF', fontSize: '14px', outline: 'none' }}
                      >
                        <option value="Bitcoin (BTC)">Bitcoin (BTC) - $67,420.50</option>
                        <option value="Ethereum (ETH)">Ethereum (ETH) - $3,610.80</option>
                        <option value="EUR/USD">EUR/USD Forex - 1.0924</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#E2E8F0', marginBottom: '8px' }}>Trade Capital / Amount ($)</label>
                      <input 
                        type="number" 
                        step="any"
                        required 
                        placeholder="Enter amount in USD" 
                        value={tradeAmount} 
                        onChange={(e) => setTradeAmount(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', backgroundColor: '#1E293B', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#FFFFFF', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} 
                      />
                    </div>

                    <button 
                      type="submit" 
                      style={{ width: '100%', background: tradeType === 'BUY' ? 'linear-gradient(to right, #16A34A, #15803D)' : 'linear-gradient(to right, #DC2626, #B91C1C)', color: '#FFFFFF', fontWeight: 700, padding: '14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '15px', marginTop: '8px' }}
                    >
                      Execute {tradeType} Market Order
                    </button>
                  </form>
                </div>
              )}

              {dashboardTab === 'history' && (
                <div style={{ backgroundColor: '#111827', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.3)', overflow: 'hidden' }}>
                  <div style={{ padding: '24px', borderBottom: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Transaction & Trade History</h3>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '600px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(59, 130, 246, 0.2)', backgroundColor: 'rgba(30, 41, 59, 0.5)', color: '#94A3B8', fontSize: '12px', textTransform: 'uppercase' }}>
                          <th style={{ padding: '16px 24px' }}>Transaction ID</th>
                          <th style={{ padding: '16px 24px' }}>Type</th>
                          <th style={{ padding: '16px 24px' }}>Amount</th>
                          <th style={{ padding: '16px 24px' }}>Date</th>
                          <th style={{ padding: '16px 24px', textAlign: 'right' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody style={{ fontSize: '14px' }}>
                        {currentUserProfile.transactions && currentUserProfile.transactions.length > 0 ? (
                          currentUserProfile.transactions.map((tx) => (
                            <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <td style={{ padding: '16px 24px', fontWeight: 700, color: '#FFFFFF' }}>{tx.id}</td>
                              <td style={{ padding: '16px 24px', color: '#E2E8F0' }}>{tx.type}</td>
                              <td style={{ padding: '16px 24px', color: '#38BDF8', fontWeight: 700 }}>${tx.amount?.toFixed(2)}</td>
                              <td style={{ padding: '16px 24px', color: '#E2E8F0' }}>{tx.date}</td>
                              <td style={{ padding: '16px 24px', textAlign: 'right', color: '#34D399', fontWeight: 600 }}>{tx.status}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>No transaction history found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

        </main>
      </div>
    );
  }

  // ==========================================
  // LANDING PAGE VIEW
  // ==========================================
  return (
    <div style={{ backgroundColor: '#0A0F1D', color: '#F3F4F6', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', position: 'relative' }}>
      
      {/* HEADER */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'rgba(10, 15, 29, 0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <img src={logoImage} alt="Company Logo" style={{ height: '40px', width: '40px', objectFit: 'contain', borderRadius: '10px' }} onError={(e)=>{e.target.style.display='none'}} />
            <span style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.025em', color: '#FFFFFF' }}>
              Thrivetrading<span style={{ color: '#38BDF8' }}>llc</span>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => { setAuthMode('signin'); setCurrentView('auth'); }} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid rgba(37, 99, 235, 0.4)', color: '#FFFFFF', fontWeight: 600, background: 'transparent', cursor: 'pointer' }}>Sign In</button>
            <button onClick={() => { setAuthMode('signup'); setCurrentView('auth'); }} style={{ padding: '10px 20px', borderRadius: '8px', background: 'linear-gradient(to right, #2563EB, #1D4ED8)', color: '#FFFFFF', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Get Started</button>
          </div>

        </div>
      </header>

      {/* HERO SECTION */}
      <section style={{ padding: '80px 24px', textAlign: 'center', borderBottom: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '9999px', backgroundColor: '#1E293B', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38BDF8', fontSize: '12px', fontWeight: 700, marginBottom: '24px', textTransform: 'uppercase' }}>
            Next-Generation Institutional Desk
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.15, marginBottom: '24px' }}>
            Algorithmic Precision & Dynamic <span style={{ color: '#38BDF8' }}>Portfolio Intelligence</span>
          </h1>
          <p style={{ fontSize: '16px', color: '#94A3B8', maxWidth: '600px', margin: '0 auto 40px auto', lineHeight: 1.6 }}>
            Manage your assets, execute live multi-asset strategies, and monitor real-time execution performance inside a unified high-performance SaaS engine.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button onClick={() => { setAuthMode('signup'); setCurrentView('auth'); }} style={{ background: 'linear-gradient(to right, #2563EB, #1D4ED8)', color: '#FFFFFF', fontWeight: 700, padding: '14px 32px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.3)', cursor: 'pointer' }}>
              Get Started Now
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#111827', borderTop: '1px solid rgba(59, 130, 246, 0.2)', padding: '32px 24px', textAlign: 'center', fontSize: '14px', color: '#94A3B8' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, color: '#FFFFFF' }}>Thrivetradingllc</span>
            <span>©️ {new Date().getFullYear()} All rights reserved.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Helper sub-component to manage admin editing rows independently
function AdminUserRow({ user, onUpdateStatus, onUpdateFigures }) {
  const [balance, setBalance] = useState(user.balance);
  const [activeTrades, setActiveTrades] = useState(user.activeTrades);
  const [totalProfit, setTotalProfit] = useState(user.totalProfit);

  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <td style={{ padding: '16px', fontWeight: 700, color: '#FFFFFF' }}>{user.name}</td>
      <td style={{ padding: '16px', color: '#E2E8F0' }}>{user.email}</td>
      
      <td style={{ padding: '16px' }}>
        <input 
          type="number" 
          value={balance} 
          onChange={(e) => setBalance(e.target.value)}
          style={{ backgroundColor: '#1E293B', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#FFFFFF', padding: '6px 10px', borderRadius: '6px', width: '90px', fontSize: '13px' }}
        />
      </td>

      <td style={{ padding: '16px' }}>
        <input 
          type="number" 
          value={activeTrades} 
          onChange={(e) => setActiveTrades(e.target.value)}
          style={{ backgroundColor: '#1E293B', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#FFFFFF', padding: '6px 10px', borderRadius: '6px', width: '60px', fontSize: '13px' }}
        />
      </td>

      <td style={{ padding: '16px' }}>
        <input 
          type="number" 
          value={totalProfit} 
          onChange={(e) => setTotalProfit(e.target.value)}
          style={{ backgroundColor: '#1E293B', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#38BDF8', fontWeight: 700, padding: '6px 10px', borderRadius: '6px', width: '90px', fontSize: '13px' }}
        />
      </td>

      <td style={{ padding: '16px' }}>
        <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, backgroundColor: user.status === 'approved' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: user.status === 'approved' ? '#34D399' : '#F87171' }}>
          {user.status}
        </span>
      </td>
      <td style={{ padding: '16px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
        <button 
          onClick={() => onUpdateFigures(user._id, parseFloat(balance), parseInt(activeTrades), parseFloat(totalProfit))}
          style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#38BDF8', border: '1px solid rgba(59, 130, 246, 0.4)', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
        >
          Save
        </button>
        {user.status === 'approved' ? (
          <button onClick={() => onUpdateStatus(user._id, 'rejected')} style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>Lock</button>
        ) : (
          <button onClick={() => onUpdateStatus(user._id, 'approved')} style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#34D399', border: '1px solid rgba(34, 197, 94, 0.4)', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>Approve</button>
        )}
      </td>
    </tr>
  );
}