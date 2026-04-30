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

// ── Generic route-level auth guard ─────────────────────────────
// requireRole: 'admin' | 'customer' | 'any'
// Prevents unauthenticated/wrong-role direct URL navigation before
// the destination component even mounts.
const AuthGuard = ({ children, requireRole = 'any' }) => {
  const [status, setStatus] = useState('checking'); // checking | ok | redirect
  const [destination, setDestination] = useState('/');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setDestination('/login');
        setStatus('redirect');
        return;
      }
      const role = session.user?.user_metadata?.role;
      if (requireRole === 'admin' && role !== 'admin') {
        // Logged-in customer tried to access /admin
        setDestination('/dashboard');
        setStatus('redirect');
        return;
      }
      if (requireRole === 'customer' && role === 'admin') {
        // Admin tried to access /dashboard
        setDestination('/admin');
        setStatus('redirect');
        return;
      }
      setStatus('ok');
    });
  }, [requireRole]);

  if (status === 'checking') return null;          // brief blank — avoids flash
  if (status === 'redirect') return <Navigate to={destination} replace />;
  return children;
};

// ── Guard: signup is only accessible if no admin session exists
// In production, the admin account already exists so this effectively
// blocks new admin creation via the UI for non-admin visitors.
const SignupGuard = () => {
  const [checking, setChecking] = useState(true);
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Any logged-in user is redirected — admin to /admin, customers to /dashboard
        const role = session.user?.user_metadata?.role;
        setRedirect(role === 'admin' ? '/admin' : '/dashboard');
      }
      setChecking(false);
    });
  }, []);

  if (checking) return null;
  if (redirect) return <Navigate to={redirect} replace />;
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
        <Route path="/dashboard"        element={<AuthGuard requireRole="customer"><CustomerDashboard /></AuthGuard>} />
        <Route path="/admin"            element={<AuthGuard requireRole="admin"><AdminDashboard /></AuthGuard>} />
        <Route path="/book"             element={<AuthGuard requireRole="any"><BookingFlow /></AuthGuard>} />
        <Route path="/rooms"            element={<ComingSoon title="Rooms & Suites" />} />
        <Route path="/dining"           element={<ComingSoon title="Dining" />} />
        <Route path="/contact"          element={<ComingSoon title="Contact Us" />} />
        <Route path="*"                 element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
