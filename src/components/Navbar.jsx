import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled]         = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser]                 = useState(null);
  const [userRole, setUserRole]         = useState('customer');
  const [accountOpen, setAccountOpen]   = useState(false);
  const accountRef = useRef(null);
  const navigate = useNavigate();

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auth state listener — keeps Navbar in sync with login/logout
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setUserRole(session?.user?.user_metadata?.role || 'customer');
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setUserRole(session?.user?.user_metadata?.role || 'customer');
      if (_event === 'SIGNED_OUT') setAccountOpen(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const dashboardPath = userRole === 'admin' ? '/admin' : '/dashboard';

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setAccountOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled glass-panel' : ''}`}>
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          TOP<span>AVENUE</span>
        </Link>

        <div className="nav-links desktop-only">
          <Link to="/rooms">Rooms & Suites</Link>
          <Link to="/dining">Dining</Link>
          <Link to="/why-book-direct">Why Book Direct</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="nav-actions desktop-only">
          {user ? (
            /* ── Logged-in: My Account dropdown ── */
            <div className="account-menu" ref={accountRef}>
              <button
                className="btn btn-ghost account-trigger"
                onClick={() => setAccountOpen(o => !o)}
              >
                <User size={15} />
                My Account
                <ChevronDown size={13} className={`chevron ${accountOpen ? 'open' : ''}`} />
              </button>
              {accountOpen && (
                <div className="account-dropdown">
                  <Link
                    to={dashboardPath}
                    className="dropdown-item"
                    onClick={() => setAccountOpen(false)}
                  >
                    <LayoutDashboard size={15} /> Dashboard
                  </Link>
                  <button className="dropdown-item danger" onClick={handleSignOut}>
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── Guest: Login / Sign Up ── */
            <>
              <Link to="/login" className="btn btn-ghost">Login</Link>
              <Link to="/signup" className="btn btn-outline" style={{ marginRight: '0.5rem' }}>Sign Up</Link>
            </>
          )}
          <Link to="/book" className="btn btn-primary">Book Now</Link>
        </div>

        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu glass-panel">
          <Link to="/rooms"          onClick={() => setMobileMenuOpen(false)}>Rooms & Suites</Link>
          <Link to="/dining"         onClick={() => setMobileMenuOpen(false)}>Dining</Link>
          <Link to="/why-book-direct" onClick={() => setMobileMenuOpen(false)}>Why Book Direct</Link>
          <Link to="/contact"        onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          <div className="mobile-actions">
            {user ? (
              <>
                <Link to={dashboardPath} className="btn btn-outline" onClick={() => setMobileMenuOpen(false)}>
                  <LayoutDashboard size={14} style={{ marginRight: '0.4rem' }} />Dashboard
                </Link>
                <button className="btn btn-ghost" onClick={handleSignOut}>
                  <LogOut size={14} style={{ marginRight: '0.4rem' }} />Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login"  className="btn btn-ghost"   onClick={() => setMobileMenuOpen(false)}>Login</Link>
                <Link to="/signup" className="btn btn-outline" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
              </>
            )}
            <Link to="/book" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>Book Now</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
