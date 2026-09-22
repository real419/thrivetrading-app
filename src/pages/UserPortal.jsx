import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TrendingUp, DollarSign, ArrowUpRight, LogOut, Wallet } from 'lucide-react';

export default function UserPortal() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState('12,450.00');
  const [profit, setProfit] = useState('+2,340.50');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail') || 'user@thrivetrading.com';
    setEmail(storedEmail);

    // Fetch custom figures if edited by admin
    const customBalance = localStorage.getItem('userBalance');
    const customProfit = localStorage.getItem('userProfit');
    if (customBalance) setBalance(customBalance);
    if (customProfit) setProfit(customProfit);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Portal Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-emerald-500 p-2 rounded-lg text-slate-900 font-bold">
            <TrendingUp size={20} />
          </div>
          <span className="text-xl font-bold text-emerald-400">User Dashboard</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400 hidden sm:inline">{email}</span>
          <button onClick={handleLogout} className="flex items-center space-x-1 text-red-400 hover:text-red-300 text-sm font-medium">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 lg:p-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Portfolio Overview</h1>
            <p className="text-gray-400 text-sm">Welcome back! Here is your live account summary.</p>
          </div>
          <Link to="/" className="text-xs bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg border border-slate-700 transition">
            Return to Home
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm font-medium">Total Balance</span>
              <Wallet className="text-emerald-400" size={24} />
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold">${balance}</span>
              <span className="text-emerald-400 text-sm font-semibold flex items-center"><ArrowUpRight size={16} /> Verified</span>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm font-medium">Total Profit / Loss</span>
              <TrendingUp className="text-emerald-400" size={24} />
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-emerald-400">{profit}</span>
              <span className="text-gray-400 text-sm">All Time</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}