import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, TrendingUp, Users, Mail } from 'lucide-react';

export default function Home() {
  const [marketData, setMarketData] = useState([
    { symbol: 'BTC/USD', price: '64,230.50', change: '+2.45%', isRising: true },
    { symbol: 'ETH/USD', price: '3,480.20', change: '+1.82%', isRising: true },
    { symbol: 'EUR/USD', price: '1.0892', change: '-0.15%', isRising: false },
    { symbol: 'TSLA', price: '248.50', change: '+3.12%', isRising: true },
    { symbol: 'AAPL', price: '182.30', change: '-0.45%', isRising: false },
    { symbol: 'GOLD', price: '2,340.10', change: '+0.78%', isRising: true },
  ]);

  // Simulate subtle real-time fluctuations for professional stock exchange feel
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => 
        prev.map(item => {
          const fluctuation = (Math.random() * 0.4 - 0.2).toFixed(2);
          const newPrice = (parseFloat(item.price.replace(',', '')) + parseFloat(fluctuation)).toFixed(2);
          const isRising = parseFloat(fluctuation) >= 0;
          return {
            ...item,
            price: Number(newPrice).toLocaleString(),
            change: `${isRising ? '+' : ''}${fluctuation}%`,
            isRising
          };
        })
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-950 text-white min-h-screen">
      {/* Live Market Exchange Ticker */}
      <div className="bg-slate-900 border-b border-slate-800 py-2 overflow-x-auto whitespace-nowrap scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 flex space-x-6 text-xs font-mono justify-start sm:justify-center items-center">
          {marketData.map((item, index) => (
            <div key={index} className="inline-flex items-center space-x-2 px-3 py-1 bg-slate-950/70 rounded-md border border-slate-800">
              <span className="font-bold text-gray-300">{item.symbol}</span>
              <span className="text-white">${item.price}</span>
              <span className={`flex items-center font-semibold ${item.isRising ? 'text-emerald-400' : 'text-rose-400'}`}>
                {item.isRising ? '▲' : '▼'} {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="bg-emerald-500/10 text-emerald-400 text-sm font-semibold px-4 py-1.5 rounded-full border border-emerald-500/20">
            Institutional Grade Trading Platform
          </span>
          <h1 className="mt-6 text-4xl sm:text-6xl font-extrabold tracking-tight">
            Empowering Your <span className="text-emerald-400">Financial Growth</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
            Experience secure, lightning-fast execution and real-time market insights tailored for serious investors and traders worldwide.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/signup" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-emerald-600/20">
              Get Started
            </Link>
            <Link to="/login" className="border border-slate-700 hover:border-emerald-500 px-8 py-3 rounded-xl font-bold transition">
              User Portal
            </Link>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-emerald-400">About ThriveTrading</h2>
            <p className="mt-4 text-gray-400 max-w-3xl mx-auto">
              Founded with a vision to democratize access to elite trading tools, ThriveTrading LLC delivers transparent pricing, advanced analytics, and robust security protocols to protect your investments at every step.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center shadow-lg">
              <div className="bg-emerald-500/10 text-emerald-400 w-12 h-12 mx-auto flex items-center justify-center rounded-xl mb-4">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-semibold">Bank-Grade Security</h3>
              <p className="mt-2 text-gray-400 text-sm">Your assets and data are guarded with top-tier encryption and multi-factor safety measures.</p>
            </div>
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center shadow-lg">
              <div className="bg-emerald-500/10 text-emerald-400 w-12 h-12 mx-auto flex items-center justify-center rounded-xl mb-4">
                <TrendingUp size={28} />
              </div>
              <h3 className="text-xl font-semibold">Real-Time Analytics</h3>
              <p className="mt-2 text-gray-400 text-sm">Monitor market swings and portfolio valuations with zero lag and high-precision tracking.</p>
            </div>
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center shadow-lg">
              <div className="bg-emerald-500/10 text-emerald-400 w-12 h-12 mx-auto flex items-center justify-center rounded-xl mb-4">
                <Users size={28} />
              </div>
              <h3 className="text-xl font-semibold">Dedicated Support</h3>
              <p className="mt-2 text-gray-400 text-sm">Our customer service team is reachable around the clock via secure email support channels.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Compact Support Section */}
      <section id="contact" className="py-16 bg-slate-950">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-emerald-400 mb-2">Customer Support</h2>
          <p className="text-gray-400 text-sm mb-6">Have questions or require assistance? Reach out to our team.</p>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-xl">
            <div className="flex items-center space-x-3 text-left">
              <div className="bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 text-emerald-400">
                <Mail size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Direct Support Email</h4>
                <p className="text-xs text-gray-400">thrivetradingllc@outlook.com</p>
              </div>
            </div>
            <a 
              href="mailto:thrivetradingllc@outlook.com" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-md shadow-emerald-600/20"
            >
              Email Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}