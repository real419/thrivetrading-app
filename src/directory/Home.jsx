import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, TrendingUp, Users, Mail, Phone } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-slate-950 text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 bg-gradient-to-b from-slate-900 to-slate-950">
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
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center">
              <div className="bg-emerald-500/10 text-emerald-400 w-12 h-12 mx-auto flex items-center justify-center rounded-xl mb-4">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-semibold">Bank-Grade Security</h3>
              <p className="mt-2 text-gray-400 text-sm">Your assets and data are guarded with top-tier encryption and multi-factor safety measures.</p>
            </div>
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center">
              <div className="bg-emerald-500/10 text-emerald-400 w-12 h-12 mx-auto flex items-center justify-center rounded-xl mb-4">
                <TrendingUp size={28} />
              </div>
              <h3 className="text-xl font-semibold">Real-Time Analytics</h3>
              <p className="mt-2 text-gray-400 text-sm">Monitor market swings and portfolio valuations with zero lag and high-precision tracking.</p>
            </div>
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center">
              <div className="bg-emerald-500/10 text-emerald-400 w-12 h-12 mx-auto flex items-center justify-center rounded-xl mb-4">
                <Users size={28} />
              </div>
              <h3 className="text-xl font-semibold">Dedicated Support</h3>
              <p className="mt-2 text-gray-400 text-sm">Our customer service team is reachable around the clock via email and WhatsApp assistance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="py-20 bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-emerald-400">Get in Touch</h2>
            <p className="mt-2 text-gray-400">Have questions? Reach out to our team anytime.</p>
          </div>
          <div className="mt-12 flex flex-col md:flex-row justify-center items-center gap-8">
            <div className="flex items-center space-x-4">
              <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl"><Mail size={24} /></div>
              <div>
                <h4 className="text-sm font-medium text-gray-400">Company Email</h4>
                <a href="mailto:thrivetradingllc@outlook.com" className="text-lg font-semibold hover:text-emerald-400">thrivetradingllc@outlook.com</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl"><Phone size={24} /></div>
              <div>
                <h4 className="text-sm font-medium text-gray-400">Customer Support / WhatsApp</h4>
                <a href="https://wa.me/17653404351" target="_blank" rel="noreferrer" className="text-lg font-semibold hover:text-emerald-400">+1 (765) 340-4351</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}