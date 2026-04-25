import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import WhyBookDirect from './pages/WhyBookDirect';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BookingFlow from './pages/BookingFlow';
import { supabase } from './supabaseClient';

// ── Guard: signup is only accessible if no admin session exists
// In production, the admin account already exists so this effectively
// blocks new admin creation via the UI for non-admin visitors.
const SignupGuard = () => {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const role = session.user?.user_metadata?.role;
        setIsAdmin(role === 'admin');
      }
      setChecking(false);
    });
  }, []);

  if (checking) return null;
  // Admin already logged in — redirect to admin panel
  if (isAdmin) return <Navigate to="/admin" replace />;
  // Allow regular visitors to sign up as customers
  return <Signup />;
};

// ── Placeholder page ──────────────────────────────────────────────
const ComingSoon = ({ title }) => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-subtle)', paddingTop: 'var(--nav-height)' }}>
    <div style={{ textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>{title}</h1>
      <p style={{ color: 'var(--text-muted)' }}>This page is coming soon.</p>
    </div>
  </div>
);

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"                 element={<Home />} />
        <Route path="/why-book-direct"  element={<WhyBookDirect />} />
        <Route path="/login"            element={<Login />} />
        <Route path="/signup"           element={<SignupGuard />} />
        <Route path="/dashboard"        element={<CustomerDashboard />} />
        <Route path="/admin"            element={<AdminDashboard />} />
        <Route path="/book"             element={<BookingFlow />} />
        <Route path="/rooms"            element={<ComingSoon title="Rooms & Suites" />} />
        <Route path="/dining"           element={<ComingSoon title="Dining" />} />
        <Route path="/contact"          element={<ComingSoon title="Contact Us" />} />
        <Route path="*"                 element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
