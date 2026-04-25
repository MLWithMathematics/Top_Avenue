import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';

const inputStyle = {
  width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem',
  borderRadius: '6px', border: '1.5px solid rgba(0,0,0,0.12)',
  background: '#fff', color: '#1a1a2e', fontSize: '0.95rem',
  outline: 'none', transition: 'border-color 0.2s',
  fontFamily: 'var(--font-body)',
};

const labelStyle = { display: 'block', marginBottom: '0.4rem', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' };

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setError('Supabase is not configured. Please set up your .env file.');
      return;
    }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    const { data, error: err } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } }
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    if (data?.user?.identities?.length === 0) { setError('This email is already registered. Please log in.'); return; }
    alert('Account created! Please check your email to confirm, then sign in.');
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'stretch', background: 'var(--bg-subtle)' }}>
      {/* Left decorative panel */}
      <div style={{ flex: '0 0 45%', background: 'linear-gradient(145deg, #1a1a2e 0%, #2d2d5e 50%, #1a2744 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', position: 'relative', overflow: 'hidden' }} className="desktop-only">
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(201,168,76,0.04)', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.01) 40px, rgba(255,255,255,0.01) 80px)' }} />
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem' }}>TOP<span style={{ color: 'var(--accent-color)' }}>AVENUE</span></p>
          <div style={{ width: '40px', height: '2px', background: 'var(--accent-color)', margin: '1rem auto' }} />
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', maxWidth: '240px', lineHeight: 1.7 }}>Join TopAvenue Members for exclusive rates, early check-in, and personalised service.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Create Account</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Join TopAvenue and unlock exclusive member benefits</p>
          </div>

          {error && (
            <div style={{ background: 'var(--danger-bg)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '8px', padding: '0.9rem 1rem', marginBottom: '1.5rem', color: 'var(--danger)', fontSize: '0.88rem' }}>{error}</div>
          )}

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" required value={name} onChange={e => setName(e.target.value)}
                  style={inputStyle} placeholder="Your full name"
                  onFocus={e => e.target.style.borderColor = 'var(--accent-color)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.12)'}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
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
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '2.8rem' }} placeholder="Min. 6 characters"
                  onFocus={e => e.target.style.borderColor = 'var(--accent-color)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.12)'}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Must be at least 6 characters</p>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '0.9rem', fontSize: '0.9rem', width: '100%' }}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent-dark)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
