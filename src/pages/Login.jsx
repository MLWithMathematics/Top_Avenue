import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from 'lucide-react';

const inputStyle = {
  width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem',
  borderRadius: '6px', border: '1.5px solid rgba(0,0,0,0.12)',
  background: '#fff', color: '#1a1a2e', fontSize: '0.95rem',
  outline: 'none', transition: 'border-color 0.2s',
  fontFamily: 'var(--font-body)',
};

const Label = ({ children }) => (
  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
    {children}
  </label>
);

const ErrorBox = ({ msg }) => msg ? (
  <div style={{ background: 'var(--danger-bg)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '8px', padding: '0.9rem 1rem', marginBottom: '1.5rem', color: 'var(--danger)', fontSize: '0.88rem' }}>
    {msg}
  </div>
) : null;

const Login = () => {
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPw,       setShowPw]       = useState(false);
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [mode,         setMode]         = useState('login');   // 'login' | 'forgot'
  const [resetSent,    setResetSent]    = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();

  // ── Sign in ───────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setError('Supabase is not configured. Please set up your .env file.');
      return;
    }
    setLoading(true);
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { setError(authError.message); setLoading(false); return; }

    const userRole = data?.user?.user_metadata?.role;
    if (userRole === 'admin') { navigate('/admin'); setLoading(false); return; }

    try {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
      navigate(profile?.role === 'admin' ? '/admin' : '/dashboard');
    } catch { navigate('/dashboard'); }
    setLoading(false);
  };

  // ── Forgot password ───────────────────────────────────────────
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email address.'); return; }
    setError('');
    setResetLoading(true);
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResetLoading(false);
    if (resetErr) { setError(resetErr.message); return; }
    setResetSent(true);
  };

  // ── Left decorative panel ────────────────────────────────────
  const LeftPanel = () => (
    <div style={{ flex: '0 0 45%', background: 'linear-gradient(145deg, #1a1a2e 0%, #2d2d5e 50%, #1a2744 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', position: 'relative', overflow: 'hidden' }} className="desktop-only">
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(201,168,76,0.04)', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.01) 40px, rgba(255,255,255,0.01) 80px)' }} />
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem' }}>TOP<span style={{ color: 'var(--accent-color)' }}>AVENUE</span></p>
        <div style={{ width: '40px', height: '2px', background: 'var(--accent-color)', margin: '1rem auto' }} />
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', maxWidth: '240px', lineHeight: 1.7 }}>Sign in to manage your bookings and access exclusive member benefits.</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'stretch', background: 'var(--bg-subtle)' }}>
      <LeftPanel />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* ── FORGOT PASSWORD ── */}
          {mode === 'forgot' && (
            <>
              {!resetSent ? (
                <>
                  <button
                    onClick={() => { setMode('login'); setError(''); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.75rem', padding: 0 }}
                  >
                    <ArrowLeft size={15} /> Back to Sign In
                  </button>
                  <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Reset Password</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Enter your email and we'll send you a reset link.</p>
                  </div>
                  <ErrorBox msg={error} />
                  <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <Label>Email Address</Label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                          style={inputStyle} placeholder="you@example.com"
                          onFocus={e => e.target.style.borderColor = 'var(--accent-color)'}
                          onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.12)'}
                        />
                      </div>
                    </div>
                    <button type="submit" disabled={resetLoading} className="btn btn-primary" style={{ padding: '0.9rem', fontSize: '0.9rem', width: '100%' }}>
                      {resetLoading ? 'Sending…' : 'Send Reset Link'}
                    </button>
                  </form>
                </>
              ) : (
                /* ── Email sent confirmation ── */
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(5,150,105,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <Mail size={28} color="#059669" />
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>Check your inbox</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.7 }}>
                    We sent a password reset link to <strong style={{ color: 'var(--text-main)' }}>{email}</strong>.
                    Check your spam folder if you don't see it within a minute.
                  </p>
                  <button onClick={() => { setMode('login'); setResetSent(false); setError(''); }} className="btn btn-primary" style={{ width: '100%', padding: '0.9rem' }}>
                    Back to Sign In
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── LOGIN ── */}
          {mode === 'login' && (
            <>
              <div style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Welcome Back</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Sign in to your TopAvenue account</p>
              </div>
              <ErrorBox msg={error} />
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <Label>Email Address</Label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      style={inputStyle} placeholder="you@example.com"
                      onFocus={e => e.target.style.borderColor = 'var(--accent-color)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.12)'}
                    />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <Label>Password</Label>
                    {/* Forgot password link sits inline with the label */}
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(''); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-dark)', fontSize: '0.78rem', fontWeight: 600, padding: 0, marginBottom: '0.35rem' }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                      style={{ ...inputStyle, paddingRight: '2.8rem' }} placeholder="••••••••"
                      onFocus={e => e.target.style.borderColor = 'var(--accent-color)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.12)'}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '0.9rem', fontSize: '0.9rem', width: '100%' }}>
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>
              <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Don't have an account? <Link to="/signup" style={{ color: 'var(--accent-dark)', fontWeight: 600 }}>Create one free</Link>
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;
