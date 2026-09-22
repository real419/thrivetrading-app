import React, { useState } from 'react';

export default function Navbar({ onNavigate, onOpenAuth }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (id) => {
    setMobileMenuOpen(false);
    if (id === 'home') {
      onNavigate('landing');
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'rgba(10, 15, 29, 0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(59, 130, 246, 0.2)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => handleLinkClick('home')}>
          <div style={{ height: '36px', width: '36px', borderRadius: '10px', backgroundColor: '#1E293B', border: '1px solid rgba(59, 130, 246, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#38BDF8', fontSize: '14px' }}>
            TT
          </div>
          <span style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.025em', color: '#FFFFFF' }}>
            Thrivetrading<span style={{ color: '#38BDF8' }}>llc</span>
          </span>
        </div>

        {/* Exclusive Hamburger Menu Trigger (No desktop text links in header) */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '28px', height: '20px', background: 'none', border: 'none', cursor: 'pointer', zIndex: 60, padding: 0 }}
          aria-label="Toggle Menu"
        >
          <span style={{ width: '100%', height: '2px', backgroundColor: '#FFF', borderRadius: '2px', transform: mobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none', transition: '0.2s' }}></span>
          <span style={{ width: '100%', height: '2px', backgroundColor: '#FFF', borderRadius: '2px', opacity: mobileMenuOpen ? 0 : 1, transition: '0.2s' }}></span>
          <span style={{ width: '100%', height: '2px', backgroundColor: '#FFF', borderRadius: '2px', transform: mobileMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none', transition: '0.2s' }}></span>
        </button>
      </div>

      {/* Expanded Dropdown Menu containing all Navigation links & Auth Actions */}
      {mobileMenuOpen && (
        <div style={{ position: 'absolute', top: '70px', left: 0, width: '100%', backgroundColor: '#0A0F1D', borderBottom: '1px solid rgba(59, 130, 246, 0.3)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 15px 25px rgba(0,0,0,0.7)', boxSizing: 'border-box' }}>
          <button onClick={() => handleLinkClick('home')} style={{ background: 'none', border: 'none', color: '#FFF', textAlign: 'left', fontSize: '16px', fontWeight: 600, padding: '8px 0', cursor: 'pointer' }}>Home</button>
          <button onClick={() => handleLinkClick('features')} style={{ background: 'none', border: 'none', color: '#94A3B8', textAlign: 'left', fontSize: '16px', fontWeight: 600, padding: '8px 0', cursor: 'pointer' }}>Features</button>
          <button onClick={() => handleLinkClick('testimonials')} style={{ background: 'none', border: 'none', color: '#94A3B8', textAlign: 'left', fontSize: '16px', fontWeight: 600, padding: '8px 0', cursor: 'pointer' }}>Testimonials</button>
          <button onClick={() => handleLinkClick('contact')} style={{ background: 'none', border: 'none', color: '#94A3B8', textAlign: 'left', fontSize: '16px', fontWeight: 600, padding: '8px 0', cursor: 'pointer' }}>Contact Us</button>
          
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={() => { setMobileMenuOpen(false); onOpenAuth('login'); }} style={{ width: '100%', backgroundColor: '#1E293B', color: '#FFF', padding: '12px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.4)', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
              Sign In
            </button>
            <button onClick={() => { setMobileMenuOpen(false); onOpenAuth('register'); }} style={{ width: '100%', background: 'linear-gradient(to right, #2563EB, #1D4ED8)', color: '#FFF', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
}