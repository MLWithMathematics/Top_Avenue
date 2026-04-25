import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          <Link to="/login" className="btn btn-ghost">Login</Link>
          <Link to="/signup" className="btn btn-outline" style={{ marginRight: '1rem' }}>Sign Up</Link>
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
          <Link to="/rooms" onClick={() => setMobileMenuOpen(false)}>Rooms & Suites</Link>
          <Link to="/dining" onClick={() => setMobileMenuOpen(false)}>Dining</Link>
          <Link to="/why-book-direct" onClick={() => setMobileMenuOpen(false)}>Why Book Direct</Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          <div className="mobile-actions">
            <Link to="/login" className="btn btn-ghost">Login</Link>
            <Link to="/signup" className="btn btn-outline">Sign Up</Link>
            <Link to="/book" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>Book Now</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
