import React, { useState } from 'react';

// Hardcoded production API URL to prevent Netlify/Vercel and mobile localhost connection failures
const API_URL = 'https://thrivetrading-app.onrender.com';

export default function AuthPortal({ initialMode = 'login', onLoginSuccess, onBackToHome }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Connects to your live Express backend endpoints: /api/auth/login or /api/auth/signup
      const endpoint = isLogin ? `${API_URL}/api/auth/login` : `${API_URL}/api/auth/signup`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      const role = data.role || (email.toLowerCase().includes('admin') ? 'admin' : 'client');
      onLoginSuccess(role, data.user || { email });
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
          <h2 style={{ fontSize: '24px', fontWeight: 900 }}>{isLogin ? 'Sign In to Portal' : 'Create Account'}</h2>
          <button onClick={onBackToHome} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '14px' }}>← Home</button>
        </div>

        {error && <div style={{ backgroundColor: 'rgba(248, 113, 113, 0.1)', border: '1px solid #F87171', color: '#F87171', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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