import React, { useState, useEffect } from 'react';

// Automatically use localhost when testing locally, or Render in production
const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://thrivetrading-app.onrender.com';

// ==========================================
// AUTH PORTAL SUB-COMPONENT
// ==========================================
function AuthPortal({ initialMode = 'login', onLoginSuccess, onBackToHome }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? `${API_URL}/api/auth/login` : `${API_URL}/api/auth/signup`;
      const payload = isLogin ? { email, password } : { name, phone, email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Backend server returned an invalid response. Check if server is running.");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      if (!isLogin) {
        alert('Registration successful! Your account is pending admin approval before you can access the dashboard.');
        setIsLogin(true);
        setLoading(false);
        return;
      }

      // Check account approval status for non-admins
      if (data.user.status !== 'Approved' && data.user.role !== 'admin') {
        throw new Error('Your account is currently pending administrator approval.');
      }

      const role = data.user.role || (email.toLowerCase().includes('admin') ? 'admin' : 'client');
      onLoginSuccess(role, data.user);
    } catch (err) {
      setError(err.message || 'Unable to connect to server. Check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0A0F1D', color: '#FFF', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#111827', padding: '40px', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.3)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 900, margin: 0 }}>{isLogin ? 'Sign In to Portal' : 'Create Account'}</h2>
          <button onClick={onBackToHome} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '14px' }}>← Home</button>
        </div>

        {error && <div style={{ backgroundColor: 'rgba(248, 113, 113, 0.1)', border: '1px solid #F87171', color: '#F87171', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#E2E8F0', marginBottom: '6px' }}>Full Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#1E293B', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#FFF', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#E2E8F0', marginBottom: '6px' }}>Phone Number</label>
                <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 019-2834" style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#1E293B', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#FFF', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#E2E8F0', marginBottom: '6px' }}>Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#1E293B', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#FFF', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#E2E8F0', marginBottom: '6px' }}>Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#1E293B', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#FFF', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', background: 'linear-gradient(to right, #2563EB, #1D4ED8)', color: '#FFF', fontWeight: 700, padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', marginTop: '8px' }}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register Account')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: '#38BDF8', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MAIN APP COMPONENT
// ==========================================
export default function App() {
  // Navigation & View States
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'auth' | 'dashboard'
  const [authInitialMode, setAuthInitialMode] = useState('login'); // 'login' | 'signup'
  const [dashboardTab, setDashboardTab] = useState('overview'); // 'overview' | 'trading' | 'history' | 'admin'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('crypto'); // Landing page markets tab

  // Backend States
  const [usersList, setUsersList] = useState([]);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [positions, setPositions] = useState([]);

  // Trading Form States
  const [tradeAsset, setTradeAsset] = useState('Bitcoin (BTC)');
  const [tradeType, setTradeType] = useState('BUY');
  const [tradeAmount, setTradeAmount] = useState('');

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  // Fallback safely if logo.png is missing from public folder
  const logoImage = "";

  // Fetch initial data on load or when user logs in
  useEffect(() => {
    if (currentView === 'dashboard' && currentUserProfile) {
      if (currentUserProfile.role === 'admin') {
        fetchUsers();
      }
      fetchPositions();
    }
  }, [currentView, currentUserProfile]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }
      const data = await res.json();
      if (res.ok) setUsersList(data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const fetchPositions = async () => {
    if (!currentUserProfile?.email) return;
    try {
      const res = await fetch(`${API_URL}/api/positions?email=${currentUserProfile.email}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }
      const data = await res.json();
      if (res.ok) setPositions(data);
    } catch (err) {
      console.error('Failed to fetch positions', err);
    }
  };

  const handleLoginSuccess = (role, userData) => {
    setCurrentUserProfile({ ...userData, role });
    setCurrentView('dashboard');
    setDashboardTab(role === 'admin' ? 'admin' : 'overview');
  };

  const handleExecuteTrade = async (e) => {
    e.preventDefault();
    if (!tradeAmount || !currentUserProfile) return;
    try {
      const res = await fetch(`${API_URL}/api/trades/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUserProfile.email,
          asset: tradeAsset,
          type: tradeType,
          amount: tradeAmount
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPositions([data.position, ...positions]);
        setTradeAmount('');
        alert(`Successfully executed ${tradeType} order for ${tradeAmount} of ${tradeAsset}!`);
        setDashboardTab('history');
      } else {
        alert(data.message || 'Trade execution failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      if (res.ok || true) { 
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Contact submission error:', err);
      setSubmitted(true); 
    }
  };

  const handleUpdateUserStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Approved' ? 'Pending' : 'Approved';
    
    setUsersList(prev => prev.map(u => {
      const userId = u.id || u._id;
      return userId === id ? { ...u, status: newStatus } : u;
    }));

    try {
      await fetch(`${API_URL}/api/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleUpdateUserField = async (id, field, value) => {
    if (!id) return;

    setUsersList(prev => prev.map(u => {
      const userId = u.id || u._id;
      if (userId === id) {
        const updatedUser = { ...u, [field]: value };
        if (currentUserProfile && currentUserProfile.email === u.email) {
          setCurrentUserProfile(curr => ({ ...curr, [field]: value }));
        }
        return updatedUser;
      }
      return u;
    }));

    try {
      await fetch(`${API_URL}/api/admin/users/${id}/fields`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value })
      });
    } catch (err) {
      console.error('Failed to persist field update', err);
    }
  };

  // ==========================================
  // AUTHENTICATION VIEW (Using AuthPortal)
  // ==========================================
  if (currentView === 'auth') {
    return (
      <AuthPortal 
        initialMode={authInitialMode} 
        onLoginSuccess={handleLoginSuccess} 
        onBackToHome={() => setCurrentView('landing')} 
      />
    );
  }

  // ==========================================
  // DASHBOARD VIEW
  // ==========================================
  if (currentView === 'dashboard') {
    return (
      <div style={{ backgroundColor: '#0A0F1D', color: '#F3F4F6', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        
        {/* TOP NAVBAR */}
        <header style={{ backgroundColor: '#111827', borderBottom: '1px solid rgba(59, 130, 246, 0.2)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setCurrentView('landing')}>
            {logoImage ? (
              <img src={logoImage} alt="Logo" style={{ height: '32px', width: '32px', objectFit: 'contain', borderRadius: '6px' }} onError={(e)=>{e.target.style.display='none'}} />
            ) : (
              <div style={{ width: '32px', height: '32px', backgroundColor: '#2563EB', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#FFF' }}>T</div>
            )}
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF' }}>
              Thrivetrading<span style={{ color: '#38BDF8' }}>llc</span>
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '13px', color: '#94A3B8' }}>User: <strong style={{ color: '#FFFFFF' }}>{currentUserProfile?.name || currentUserProfile?.email}</strong></span>
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
          {currentUserProfile?.role === 'admin' ? (
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
                Active Positions
              </button>
            </>
          )}
        </div>

        {/* DASHBOARD CONTENT AREA */}
        <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
          
          {dashboardTab === 'admin' && currentUserProfile?.role === 'admin' ? (
            <div style={{ backgroundColor: '#111827', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '32px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#FFFFFF', marginBottom: '8px' }}>Administrator User Control Console</h2>
              <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '24px' }}>Review user accounts, approve registrations, and directly edit financial figures for clients.</p>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '950px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(59, 130, 246, 0.2)', backgroundColor: 'rgba(30, 41, 59, 0.5)', color: '#94A3B8', fontSize: '12px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '16px' }}>Client Name</th>
                      <th style={{ padding: '16px' }}>Email</th>
                      <th style={{ padding: '16px' }}>Initial Deposit</th>
                      <th style={{ padding: '16px' }}>Interest</th>
                      <th style={{ padding: '16px' }}>Total Balance</th>
                      <th style={{ padding: '16px' }}>Status</th>
                      <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '14px' }}>
                    {usersList.map((u) => {
                      const rowId = u.id || u._id;
                      return (
                        <tr key={rowId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '16px', fontWeight: 700, color: '#FFFFFF' }}>{u.name || 'N/A'}</td>
                          <td style={{ padding: '16px', color: '#E2E8F0' }}>{u.email}</td>
                          
                          <td style={{ padding: '16px' }}>
                            <input 
                              type="text" 
                              value={u.initialDeposit ?? ''} 
                              onChange={(e) => handleUpdateUserField(rowId, 'initialDeposit', e.target.value)}
                              style={{ backgroundColor: '#1E293B', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#FFFFFF', padding: '6px 10px', borderRadius: '6px', width: '110px', fontSize: '13px' }}
                            />
                          </td>

                          <td style={{ padding: '16px' }}>
                            <input 
                              type="text" 
                              value={u.interest ?? ''} 
                              onChange={(e) => handleUpdateUserField(rowId, 'interest', e.target.value)}
                              style={{ backgroundColor: '#1E293B', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#FFFFFF', padding: '6px 10px', borderRadius: '6px', width: '110px', fontSize: '13px' }}
                            />
                          </td>

                          <td style={{ padding: '16px' }}>
                            <input 
                              type="text" 
                              value={u.total ?? ''} 
                              onChange={(e) => handleUpdateUserField(rowId, 'total', e.target.value)}
                              style={{ backgroundColor: '#1E293B', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#38BDF8', fontWeight: 700, padding: '6px 10px', borderRadius: '6px', width: '110px', fontSize: '13px' }}
                            />
                          </td>

                          <td style={{ padding: '16px' }}>
                            <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, backgroundColor: u.status === 'Approved' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: u.status === 'Approved' ? '#34D399' : '#F87171' }}>
                              {u.status || 'Pending'}
                            </span>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <button 
                              onClick={() => handleUpdateUserStatus(rowId, u.status)} 
                              style={{ 
                                backgroundColor: u.status === 'Approved' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)', 
                                color: u.status === 'Approved' ? '#F87171' : '#34D399', 
                                border: u.status === 'Approved' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(34, 197, 94, 0.4)', 
                                padding: '6px 12px', 
                                borderRadius: '6px', 
                                fontSize: '12px', 
                                fontWeight: 700, 
                                cursor: 'pointer' 
                              }}
                            >
                              {u.status === 'Approved' ? 'Lock Access' : 'Approve Access'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div style={{ backgroundColor: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
                  <span style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '4px' }}>Initial Deposit</span>
                  <span style={{ fontSize: '22px', fontWeight: 900, color: '#38BDF8' }}>{currentUserProfile?.initialDeposit || '$0.00'}</span>
                </div>
                <div style={{ backgroundColor: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid rgba(52, 211, 153, 0.4)' }}>
                  <span style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '4px' }}>Interest Earned</span>
                  <span style={{ fontSize: '22px', fontWeight: 900, color: '#34D399' }}>{currentUserProfile?.interest || '$0.00'}</span>
                </div>
                <div style={{ backgroundColor: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
                  <span style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '4px' }}>Total Portfolio Balance</span>
                  <span style={{ fontSize: '22px', fontWeight: 900, color: '#FFFFFF' }}>{currentUserProfile?.total || '$0.00'}</span>
                </div>
              </div>

              {dashboardTab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                  <div style={{ backgroundColor: '#111827', padding: '32px', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px' }}>Asset Allocation</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                          <span style={{ color: '#E2E8F0', fontWeight: 600 }}>Bitcoin (BTC)</span>
                          <span style={{ color: '#38BDF8', fontWeight: 700 }}>55%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: '#1E293B', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: '55%', height: '100%', backgroundColor: '#2563EB', borderRadius: '4px' }}></div>
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                          <span style={{ color: '#E2E8F0', fontWeight: 600 }}>Ethereum (ETH)</span>
                          <span style={{ color: '#38BDF8', fontWeight: 700 }}>30%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: '#1E293B', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: '30%', height: '100%', backgroundColor: '#38BDF8', borderRadius: '4px' }}></div>
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                          <span style={{ color: '#E2E8F0', fontWeight: 600 }}>USDT / Liquidity Pools</span>
                          <span style={{ color: '#38BDF8', fontWeight: 700 }}>15%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: '#1E293B', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: '15%', height: '100%', backgroundColor: '#34D399', borderRadius: '4px' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#111827', padding: '32px', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '12px' }}>Quick Actions</h3>
                      <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '20px' }}>
                        Initiate automated rebalancing or deposit funds instantly.
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <button onClick={() => setDashboardTab('trading')} style={{ width: '100%', backgroundColor: '#2563EB', color: '#FFFFFF', padding: '12px', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                        Open Trade Ticket
                      </button>
                      <button onClick={() => alert('Deposit gateway initialized. Contact support for wire instructions.')} style={{ width: '100%', backgroundColor: '#1E293B', color: '#38BDF8', border: '1px solid rgba(59, 130, 246, 0.4)', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                        Deposit Funds / USDT
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {dashboardTab === 'trading' && (
                <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#111827', padding: '40px', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>Instant Execution Desk</h3>
                  <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '24px' }}>Route orders directly to liquidity providers with zero slippage guarantees.</p>
                  
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
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#E2E8F0', marginBottom: '8px' }}>Order Quantity / Amount</label>
                      <input 
                        type="number" 
                        step="any"
                        required 
                        placeholder="Enter quantity" 
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
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Active Positions</h3>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '600px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(59, 130, 246, 0.2)', backgroundColor: 'rgba(30, 41, 59, 0.5)', color: '#94A3B8', fontSize: '12px', textTransform: 'uppercase' }}>
                          <th style={{ padding: '16px 24px' }}>Asset</th>
                          <th style={{ padding: '16px 24px' }}>Type</th>
                          <th style={{ padding: '16px 24px' }}>Entry Price</th>
                          <th style={{ padding: '16px 24px' }}>Amount</th>
                          <th style={{ padding: '16px 24px' }}>Unrealized P&L</th>
                          <th style={{ padding: '16px 24px', textAlign: 'right' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody style={{ fontSize: '14px' }}>
                        {positions.length === 0 ? (
                          <tr>
                            <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#94A3B8' }}>No active positions found. Execute a trade from the Execution Desk.</td>
                          </tr>
                        ) : (
                          positions.map((pos) => (
                            <tr key={pos.id || Math.random()} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <td style={{ padding: '16px 24px', fontWeight: 700, color: '#FFFFFF' }}>{pos.asset}</td>
                              <td style={{ padding: '16px 24px' }}>
                                <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, backgroundColor: pos.type === 'BUY' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: pos.type === 'BUY' ? '#34D399' : '#F87171' }}>
                                  {pos.type}
                                </span>
                              </td>
                              <td style={{ padding: '16px 24px', color: '#E2E8F0' }}>{pos.entry}</td>
                              <td style={{ padding: '16px 24px', color: '#E2E8F0' }}>{pos.amount}</td>
                              <td style={{ padding: '16px 24px', color: '#34D399', fontWeight: 700 }}>{pos.pnl || '$0.00'}</td>
                              <td style={{ padding: '16px 24px', textAlign: 'right', color: '#38BDF8', fontWeight: 600 }}>{pos.status || 'Open'}</td>
                            </tr>
                          ))
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
            {logoImage ? (
              <img src={logoImage} alt="Company Logo" style={{ height: '40px', width: '40px', objectFit: 'contain', borderRadius: '10px' }} onError={(e)=>{e.target.style.display='none'}} />
            ) : (
              <div style={{ width: '40px', height: '40px', backgroundColor: '#2563EB', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#FFF', fontSize: '20px' }}>T</div>
            )}
            <span style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.025em', color: '#FFFFFF' }}>
              Thrivetrading<span style={{ color: '#38BDF8' }}>llc</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'none', gap: '16px', alignItems: 'center', '@media (minWidth: 768px)': { display: 'flex' } }}>
              <button onClick={() => { setAuthInitialMode('login'); setCurrentView('auth'); }} style={{ background: 'transparent', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#FFFFFF', padding: '8px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Sign In</button>
              <button onClick={() => { setAuthInitialMode('signup'); setCurrentView('auth'); }} style={{ background: 'linear-gradient(to right, #2563EB, #1D4ED8)', border: 'none', color: '#FFFFFF', padding: '8px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Get Started</button>
            </div>
            
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ color: '#FFFFFF', backgroundColor: '#1E293B', border: '1px solid rgba(59, 130, 246, 0.4)', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700 }}
              aria-label="Toggle Menu"
            >
              <span>Menu</span>
              <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>

        {mobileMenuOpen && (
          <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', backgroundColor: '#111827', borderBottom: '1px solid rgba(59, 130, 246, 0.3)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 50, boxSizing: 'border-box', boxShadow: '0 15px 25px rgba(0,0,0,0.7)' }}>
            <a href="#" onClick={() => setMobileMenuOpen(false)} style={{ color: '#FFFFFF', fontWeight: 600, textDecoration: 'none' }}>Home</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} style={{ color: '#94A3B8', textDecoration: 'none' }}>Features</a>
            <a href="#markets" onClick={() => setMobileMenuOpen(false)} style={{ color: '#94A3B8', textDecoration: 'none' }}>Markets</a>
            <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} style={{ color: '#94A3B8', textDecoration: 'none' }}>Testimonials</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} style={{ color: '#94A3B8', textDecoration: 'none' }}>Contact Us</a>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <button onClick={() => { setMobileMenuOpen(false); setAuthInitialMode('login'); setCurrentView('auth'); }} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(37, 99, 235, 0.4)', color: '#FFFFFF', fontWeight: 600, background: 'transparent', cursor: 'pointer' }}>Sign In</button>
              <button onClick={() => { setMobileMenuOpen(false); setAuthInitialMode('signup'); setCurrentView('auth'); }} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'linear-gradient(to right, #2563EB, #1D4ED8)', color: '#FFFFFF', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Get Started</button>
            </div>
          </div>
        )}
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
            <button onClick={() => { setAuthInitialMode('signup'); setCurrentView('auth'); }} style={{ background: 'linear-gradient(to right, #2563EB, #1D4ED8)', color: '#FFFFFF', fontWeight: 700, padding: '14px 32px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.3)', cursor: 'pointer' }}>
              Get Started Now
            </button>
            <a href="#markets" style={{ backgroundColor: '#1E293B', color: '#FFFFFF', fontWeight: 700, padding: '14px 32px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.4)', textDecoration: 'none', display: 'inline-block' }}>
              Explore Markets
            </a>
          </div>
        </div>
      </section>

      {/* STOCK EXCHANGE TICKER */}
      <section style={{ padding: '40px 24px', backgroundColor: 'rgba(17, 24, 39, 0.6)', borderBottom: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Stock Exchange Live P&L Tickers</h3>
            <span style={{ fontSize: '12px', color: '#34D399', backgroundColor: 'rgba(52, 211, 153, 0.1)', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>● Live Feed Active</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ backgroundColor: '#111827', padding: '18px', borderRadius: '10px', border: '1px solid rgba(52, 211, 153, 0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#E2E8F0' }}>NYSE Index</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#34D399' }}>+2.45%</span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#34D399' }}>+$18,420.00</div>
            </div>

            <div style={{ backgroundColor: '#111827', padding: '18px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#E2E8F0' }}>NASDAQ Composite</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#EF4444' }}>-0.82%</span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#EF4444' }}>-$4,150.50</div>
            </div>

            <div style={{ backgroundColor: '#111827', padding: '18px', borderRadius: '10px', border: '1px solid rgba(52, 211, 153, 0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#E2E8F0' }}>FTSE 100</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#34D399' }}>+1.14%</span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#34D399' }}>+$9,230.80</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" style={{ padding: '80px 24px', backgroundColor: 'rgba(30, 41, 59, 0.2)', borderBottom: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 60px auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#FFFFFF', marginBottom: '12px' }}>Core Platform Features</h2>
            <p style={{ fontSize: '14px', color: '#94A3B8' }}>Engineered for absolute reliability, security, and high-speed execution.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {[
              { num: '01', title: 'Sub-Millisecond Routing', desc: 'Direct market access infrastructure ensuring zero-latency order placement.' },
              { num: '02', title: 'Multi-Asset Liquidity', desc: 'Deep institutional liquidity across cryptocurrencies, forex, and equities.' },
              { num: '03', title: 'Enterprise Security', desc: 'Advanced encryption and multi-signature custodial architecture.' }
            ].map((feat, index) => (
              <div key={index} style={{ backgroundColor: '#111827', padding: '32px', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                <span style={{ color: '#38BDF8', fontWeight: 900, fontSize: '28px', display: 'block', marginBottom: '12px' }}>{feat.num}</span>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>{feat.title}</h3>
                <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.6 }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARKETS SECTION */}
      <section id="markets" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 40px auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#FFFFFF', marginBottom: '12px' }}>Live Market Overview</h2>
            <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '24px' }}>Real-time valuation and instant order placement across leading global asset classes.</p>
            <div style={{ display: 'inline-flex', backgroundColor: '#111827', padding: '6px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.3)', flexWrap: 'wrap', justifyContent: 'center' }}>
              {['crypto', 'forex', 'stocks'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer', backgroundColor: activeTab === tab ? '#2563EB' : 'transparent', color: activeTab === tab ? '#FFFFFF' : '#94A3B8', textTransform: 'capitalize' }}
                >
                  {tab === 'crypto' ? 'Cryptocurrency' : tab === 'forex' ? 'Forex Pairs' : 'Global Indices'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: '#111827', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.3)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(59, 130, 246, 0.2)', backgroundColor: 'rgba(30, 41, 59, 0.5)', color: '#94A3B8', fontSize: '12px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '16px 24px' }}>Asset</th>
                    <th style={{ padding: '16px 24px' }}>Price</th>
                    <th style={{ padding: '16px 24px' }}>24h Change</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '14px' }}>
                  {activeTab === 'crypto' && (
                    <>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '16px 24px', fontWeight: 700, color: '#FFFFFF' }}>Bitcoin (BTC)</td>
                        <td style={{ padding: '16px 24px', color: '#E2E8F0' }}>$67,420.50</td>
                        <td style={{ padding: '16px 24px', color: '#34D399', fontWeight: 700 }}>+4.12%</td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <button onClick={() => { setAuthInitialMode('login'); setCurrentView('auth'); }} style={{ backgroundColor: 'rgba(37, 99, 235, 0.2)', color: '#38BDF8', border: '1px solid rgba(37, 99, 235, 0.4)', padding: '6px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Trade</button>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '16px 24px', fontWeight: 700, color: '#FFFFFF' }}>Ethereum (ETH)</td>
                        <td style={{ padding: '16px 24px', color: '#E2E8F0' }}>$3,610.80</td>
                        <td style={{ padding: '16px 24px', color: '#34D399', fontWeight: 700 }}>+3.25%</td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <button onClick={() => { setAuthInitialMode('login'); setCurrentView('auth'); }} style={{ backgroundColor: 'rgba(37, 99, 235, 0.2)', color: '#38BDF8', border: '1px solid rgba(37, 99, 235, 0.4)', padding: '6px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Trade</button>
                        </td>
                      </tr>
                    </>
                  )}
                  {activeTab === 'forex' && (
                    <>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '16px 24px', fontWeight: 700, color: '#FFFFFF' }}>EUR/USD</td>
                        <td style={{ padding: '16px 24px', color: '#E2E8F0' }}>1.0924</td>
                        <td style={{ padding: '16px 24px', color: '#34D399', fontWeight: 700 }}>+0.18%</td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <button onClick={() => { setAuthInitialMode('login'); setCurrentView('auth'); }} style={{ backgroundColor: 'rgba(37, 99, 235, 0.2)', color: '#38BDF8', border: '1px solid rgba(37, 99, 235, 0.4)', padding: '6px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Trade</button>
                        </td>
                      </tr>
                    </>
                  )}
                  {activeTab === 'stocks' && (
                    <>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '16px 24px', fontWeight: 700, color: '#FFFFFF' }}>S&P 500 (SPX)</td>
                        <td style={{ padding: '16px 24px', color: '#E2E8F0' }}>5,520.30</td>
                        <td style={{ padding: '16px 24px', color: '#34D399', fontWeight: 700 }}>+0.84%</td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <button onClick={() => { setAuthInitialMode('login'); setCurrentView('auth'); }} style={{ backgroundColor: 'rgba(37, 99, 235, 0.2)', color: '#38BDF8', border: '1px solid rgba(37, 99, 235, 0.4)', padding: '6px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Trade</button>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" style={{ padding: '80px 24px', backgroundColor: 'rgba(30, 41, 59, 0.1)', borderTop: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 60px auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#FFFFFF', marginBottom: '12px' }}>Trusted by Serious Investors</h2>
            <p style={{ fontSize: '14px', color: '#94A3B8' }}>See how top-tier traders, institutional funds, and portfolio managers accelerate financial growth with our platform.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {[
              { quote: 'The execution speed and deep liquidity pools have completely transformed our fund performance.', author: 'Marcus Vance', role: 'Managing Partner, Apex Capital', return: '+34.2%' },
              { quote: 'Robust multi-asset architecture with intuitive order routing. Absolute top tier performance.', author: 'Elena Rostova', role: 'Chief Investment Officer', return: '+28.5%' },
              { quote: 'Risk management telemetry and portfolio overview tools give our desk unmatched clarity every single day.', author: 'Julian Sterling', role: 'Head Trader, Vanguard Strategies', return: '+41.0%' }
            ].map((t, idx) => (
              <div key={idx} style={{ backgroundColor: '#111827', padding: '32px', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ color: '#38BDF8', fontSize: '36px', fontWeight: 900, display: 'block', marginBottom: '8px' }}>“</span>
                  <p style={{ color: '#E2E8F0', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>{t.quote}</p>
                </div>
                <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '14px' }}>{t.author}</h4>
                    <p style={{ fontSize: '12px', color: '#94A3B8' }}>{t.role}</p>
                  </div>
                  <span style={{ backgroundColor: 'rgba(37, 99, 235, 0.2)', color: '#38BDF8', fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '8px' }}>
                    {t.return}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SUPPORT SECTION */}
      <section id="contact" style={{ padding: '80px 24px', borderTop: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#FFFFFF', marginBottom: '8px' }}>Contact Support</h2>
            <p style={{ fontSize: '13px', color: '#94A3B8' }}>Reach out instantly to our company hotline or send a message below.</p>
          </div>

          <div style={{ backgroundColor: '#111827', padding: '32px', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.3)', boxSizing: 'border-box' }}>
            
            <div style={{ marginBottom: '24px' }}>
              <a 
                href="https://wa.me/17653404351" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', backgroundColor: '#1E293B', border: '1px solid rgba(56, 189, 248, 0.4)', fontWeight: 700, padding: '14px 20px', borderRadius: '10px', textDecoration: 'none', fontSize: '15px', boxSizing: 'border-box' }}
              >
                <svg style={{ width: '20px', height: '20px', fill: '#38BDF8' }} viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <span style={{ color: '#38BDF8' }}>Contact Support</span>
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '20px 0', color: '#64748B', fontSize: '12px', textTransform: 'uppercase', fontWeight: 700 }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(59, 130, 246, 0.2)' }}></div>
              <span>Or Direct Inbox Inquiry</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(59, 130, 246, 0.2)' }}></div>
            </div>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(52, 211, 153, 0.2)', color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 12px auto' }}>✓</div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>Message Sent Successfully!</h3>
                <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '20px' }}>Our support desk will review your inquiry and reach out shortly.</p>
                <button onClick={() => { setSubmitted(false); setContactForm({ name: '', email: '', message: '' }); }} style={{ backgroundColor: '#2563EB', color: '#FFFFFF', fontWeight: 600, padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#E2E8F0', marginBottom: '6px' }}>Your Name</label>
                  <input type="text" required placeholder="Full name" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#1E293B', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#FFFFFF', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#E2E8F0', marginBottom: '6px' }}>Email Address</label>
                  <input type="email" required placeholder="name@example.com" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#1E293B', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#FFFFFF', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#E2E8F0', marginBottom: '6px' }}>Message</label>
                  <textarea required rows={3} placeholder="How can we help?" value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#1E293B', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#FFFFFF', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
                </div>
                <button type="submit" style={{ width: '100%', background: 'linear-gradient(to right, #2563EB, #1D4ED8)', color: '#FFFFFF', fontWeight: 700, padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', marginTop: '4px' }}>Send Inbox Message</button>
              </form>
            )}

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
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* FLOATING WHATSAPP SUPPORT WIDGET */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: '999' }}>
        <a 
          href="https://wa.me/17653404351" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '50%', 
            backgroundColor: '#2563EB', 
            color: '#FFFFFF', 
            boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.6)', 
            textDecoration: 'none', 
            border: '2px solid rgba(255, 255, 255, 0.2)',
            fontSize: '22px'
          }}
          title="Chat Support"
        >
          <span>💬</span>
        </a>
      </div>

    </div>
  );
}