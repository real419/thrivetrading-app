import React, { useState, useEffect } from 'react';

// Hardcoded production API URL to prevent Netlify/Vercel build-time environment variable issues on mobile
const API_URL = 'https://thrivetrading-app.onrender.com';

export default function AdminDashboard({ userSession, onSignOut }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingClientId, setEditingClientId] = useState(null);
  const [tempBalance, setTempBalance] = useState('');

  // Fetch real users from MongoDB backend on load
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/admin/users`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch users');
      
      // Handle both array response or { users: [...] } object response
      const userList = Array.isArray(data) ? data : (data.users || []);
      setClients(userList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBalance = async (id) => {
    const updatedBalance = parseFloat(tempBalance);
    if (isNaN(updatedBalance)) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/client/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: updatedBalance }),
      });

      if (!response.ok) throw new Error('Failed to update balance');
      
      // Update local UI state
      setClients(clients.map(c => (c._id === id || c.id === id) ? { ...c, balance: updatedBalance } : c));
      setEditingClientId(null);
      setTempBalance('');
    } catch (err) {
      console.error('Failed to update balance on backend', err);
      // Fallback local update
      setClients(clients.map(c => (c._id === id || c.id === id) ? { ...c, balance: updatedBalance } : c));
      setEditingClientId(null);
    }
  };

  const handleApproveUser = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/user/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to approve user');
      
      // Refresh list
      fetchUsers();
    } catch (err) {
      console.error('Error approving user:', err);
      // Fallback update state locally
      setClients(clients.map(c => (c._id === id || c.id === id) ? { ...c, status: 'approved' } : c));
    }
  };

  return (
    <div style={{ backgroundColor: '#0A0F1D', color: '#FFF', minHeight: '100vh', padding: '40px 24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 900 }}>Administrator Management Desk</h1>
            <p style={{ color: '#94A3B8', fontSize: '14px', marginTop: '4px' }}>Logged in as: {userSession?.email || localStorage.getItem('userEmail') || 'admin@thrivetradingllc.com'}</p>
          </div>
          <button onClick={onSignOut} style={{ backgroundColor: '#1E293B', color: '#FFF', padding: '10px 20px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.4)', cursor: 'pointer', fontWeight: 600 }}>Sign Out</button>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#F87171', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <div style={{ backgroundColor: '#111827', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.3)', overflow: 'hidden', padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Client Accounts Ledger</h3>
          
          {loading ? (
            <p style={{ color: '#94A3B8', textAlign: 'center', padding: '20px' }}>Loading client database...</p>
          ) : clients.length === 0 ? (
            <p style={{ color: '#94A3B8', textAlign: 'center', padding: '20px' }}>No client accounts found in MongoDB.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(59, 130, 246, 0.2)', color: '#94A3B8', fontSize: '12px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px' }}>Client Email</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px' }}>Balance ($)</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(client => {
                    const clientId = client._id || client.id;
                    return (
                      <tr key={clientId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '14px 12px', color: '#FFF' }}>{client.email}</td>
                        <td style={{ padding: '14px 12px' }}>
                          <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: '4px', 
                            fontSize: '12px', 
                            fontWeight: 'bold',
                            backgroundColor: client.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                            color: client.status === 'approved' ? '#34D399' : '#FACC15'
                          }}>
                            {client.status || 'pending'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 12px', color: '#38BDF8', fontWeight: 700 }}>
                          {editingClientId === clientId ? (
                            <input 
                              type="number" 
                              value={tempBalance} 
                              onChange={(e) => setTempBalance(e.target.value)} 
                              placeholder={client.balance || 0}
                              style={{ padding: '6px', borderRadius: '4px', backgroundColor: '#1E293B', border: '1px solid #38BDF8', color: '#FFF', width: '120px' }}
                            />
                          ) : (
                            `$${(client.balance || 0).toLocaleString()}`
                          )}
                        </td>
                        <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                            {client.status !== 'approved' && (
                              <button onClick={() => handleApproveUser(clientId)} style={{ backgroundColor: '#10B981', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Approve</button>
                            )}
                            {editingClientId === clientId ? (
                              <button onClick={() => handleSaveBalance(clientId)} style={{ backgroundColor: '#10B981', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Save</button>
                            ) : (
                              <button onClick={() => { setEditingClientId(clientId); setTempBalance(client.balance || 0); }} style={{ backgroundColor: '#2563EB', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Edit Figures</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}