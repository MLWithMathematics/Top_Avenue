import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Eye, EyeOff, Lock, Mail, ArrowLeft, KeyRound, CheckCircle, RefreshCw } from 'lucide-react';

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

const SuccessBox = ({ msg }) => msg ? (
  <div style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.25)', borderRadius: '8px', padding: '0.9rem 1rem', marginBottom: '1.5rem', color: '#059669', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <CheckCircle size={15} /> {msg}
  </div>
) : null;

// MODES: 'login' | 'forgot' | 'otp-sent' | 'otp-newpw' | 'link-sent'
const Login = () => {
  const [email,          setEmail]          = useState('');
  const [password,       setPassword]       = useState('');
  const [showPw,         setShowPw]         = useState(false);
  const [error,          setError]          = useState('');
  const [success,        setSuccess]        = useState('');
  const [loading,        setLoading]        = useState(false);
  const [mode,           setMode]           = useState('login');
  const [otpCode,        setOtpCode]        = useState('');
  const [newPassword,    setNewPassword]    = useState('');
  const [showNewPw,      setShowNewPw]      = useState(false);
  const [otpLoading,     setOtpLoading]     = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();

  const reset = (toMode) => { setError(''); setSuccess(''); setOtpCode(''); setMode(toMode); };

  // Sign in
  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
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

  // Method A: Email reset link
  const handleEmailLink = async (e) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email address.'); return; }
    setError(''); setLoading(true);
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (resetErr) { setError(resetErr.message); return; }
    setMode('link-sent');
  };

  // Method B: Send OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email) { setError('Please enter your email address.'); return; }
    setError(''); setOtpLoading(true);
    const { error: otpErr } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    setOtpLoading(false);
    if (otpErr) { setError(otpErr.message); return; }
    setMode('otp-sent');
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown(c => { if (c <= 1) { clearInterval(timer); return 0; } return c - 1; });
    }, 1000);
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpCode.length < 6) { setError('Please enter the full 6-digit code.'); return; }
    setError(''); setOtpLoading(true);
    const { error: verifyErr } = await supabase.auth.verifyOtp({ email, token: otpCode, type: 'email' });
    setOtpLoading(false);
    if (verifyErr) { setError('Invalid or expired code. Please try again.'); return; }
    setMode('otp-newpw');
    setSuccess('Code verified! Set your new password below.');
  };

  // Set new password
  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setError(''); setLoading(true);
    const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (updateErr) { setError(updateErr.message); return; }
    setSuccess('Password updated! Redirecting...');
    setTimeout(() => navigate('/dashboard'), 1800);
  };

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

  const BackBtn = ({ to = 'login', label = 'Back to Sign In' }) => (
    <button onClick={() => reset(to)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.75rem', padding: 0 }}>
      <ArrowLeft size={15} /> {label}
    </button>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'stretch', background: 'var(--bg-subtle)' }}>
      <LeftPanel />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* LOGIN */}
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
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} placeholder="you@example.com"
                      onFocus={e => e.target.style.borderColor = 'var(--accent-color)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.12)'} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <Label>Password</Label>
                    <button type="button" onClick={() => reset('forgot')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-dark)', fontSize: '0.78rem', fontWeight: 600, padding: 0, marginBottom: '0.35rem' }}>
                      Forgot password?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                      style={{ ...inputStyle, paddingRight: '2.8rem' }} placeholder="Your Password"
                      onFocus={e => e.target.style.borderColor = 'var(--accent-color)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.12)'} />
                    <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '0.9rem', fontSize: '0.9rem', width: '100%' }}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
              <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Don't have an account? <Link to="/signup" style={{ color: 'var(--accent-dark)', fontWeight: 600 }}>Create one free</Link>
              </p>
            </>
          )}

          {/* FORGOT */}
          {mode === 'forgot' && (
            <>
              <BackBtn />
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Reset Password</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Enter your email and choose a reset method.</p>
              </div>
              <ErrorBox msg={error} />
              <div style={{ marginBottom: '1.5rem' }}>
                <Label>Email Address</Label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} placeholder="you@example.com"
                    onFocus={e => e.target.style.borderColor = 'var(--accent-color)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.12)'} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ border: '1.5px solid var(--glass-border)', borderRadius: 10, padding: '1.25rem', background: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.9rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Mail size={16} color="var(--accent-dark)" />
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>Email Reset Link</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>Sends a secure link to your inbox. Click to set a new password.</p>
                    </div>
                  </div>
                  <button onClick={handleEmailLink} disabled={loading} className="btn btn-outline" style={{ width: '100%', padding: '0.65rem', fontSize: '0.82rem' }}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
                <div style={{ border: '1.5px solid var(--accent-color)', borderRadius: 10, padding: '1.25rem', background: 'rgba(201,168,76,0.04)', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '-11px', left: '1rem', background: 'var(--accent-color)', color: '#1a1a2e', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '0.2rem 0.7rem', borderRadius: 20 }}>Recommended</span>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.9rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(201,168,76,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <KeyRound size={16} color="var(--accent-dark)" />
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>6-Digit OTP Code</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>We email you a one-time code. Enter it here to reset instantly.</p>
                    </div>
                  </div>
                  <button onClick={handleSendOtp} disabled={otpLoading} className="btn btn-primary" style={{ width: '100%', padding: '0.65rem', fontSize: '0.82rem' }}>
                    {otpLoading ? 'Sending code...' : 'Send OTP Code'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* LINK SENT */}
          {mode === 'link-sent' && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(5,150,105,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Mail size={28} color="#059669" />
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>Check your inbox</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem', lineHeight: 1.7 }}>A reset link was sent to <strong style={{ color: 'var(--text-main)' }}>{email}</strong>.</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '2rem' }}>Check spam if you don't see it, or try the OTP method instead.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button onClick={() => reset('forgot')} className="btn btn-outline" style={{ width: '100%', padding: '0.8rem', fontSize: '0.85rem' }}>Try OTP Method Instead</button>
                <button onClick={() => reset('login')} className="btn btn-ghost" style={{ width: '100%', padding: '0.8rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Back to Sign In</button>
              </div>
            </div>
          )}

          {/* OTP SENT */}
          {mode === 'otp-sent' && (
            <>
              <BackBtn to="forgot" label="Change email / method" />
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(201,168,76,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <KeyRound size={24} color="var(--accent-dark)" />
                </div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Enter OTP Code</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>A 6-digit code was sent to <strong style={{ color: 'var(--text-main)' }}>{email}</strong>. Expires in 10 minutes.</p>
              </div>
              <ErrorBox msg={error} />
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <Label>6-Digit Code</Label>
                  <input type="text" inputMode="numeric" maxLength={6} value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="______"
                    style={{ ...inputStyle, paddingLeft: '1rem', textAlign: 'center', fontSize: '2rem', letterSpacing: '0.6rem', fontWeight: 700, color: 'var(--accent-dark)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent-color)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.12)'} />
                </div>
                <button type="submit" disabled={otpLoading || otpCode.length < 6} className="btn btn-primary" style={{ padding: '0.9rem', fontSize: '0.9rem', width: '100%', opacity: otpCode.length < 6 ? 0.6 : 1 }}>
                  {otpLoading ? 'Verifying...' : 'Verify Code'}
                </button>
              </form>
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                {resendCooldown > 0
                  ? <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Resend in <strong>{resendCooldown}s</strong></p>
                  : <button onClick={handleSendOtp} disabled={otpLoading} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-dark)', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: 0 }}>
                      <RefreshCw size={13} /> Resend Code
                    </button>}
              </div>
            </>
          )}

          {/* OTP NEW PASSWORD */}
          {mode === 'otp-newpw' && (
            <>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Set New Password</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Choose a strong password for your account.</p>
              </div>
              <SuccessBox msg={success} />
              <ErrorBox msg={error} />
              <form onSubmit={handleSetNewPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <Label>New Password</Label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type={showNewPw ? 'text' : 'password'} required minLength={8} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters" style={{ ...inputStyle, paddingRight: '2.8rem' }}
                      onFocus={e => e.target.style.borderColor = 'var(--accent-color)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.12)'} />
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                      {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {newPassword.length > 0 && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: 4 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, transition: 'background 0.2s',
                          background: newPassword.length >= i * 3 ? (newPassword.length >= 10 ? '#059669' : newPassword.length >= 7 ? 'var(--accent-color)' : '#f59e0b') : 'var(--glass-border)' }} />
                      ))}
                    </div>
                  )}
                </div>
                <button type="submit" disabled={loading || newPassword.length < 8} className="btn btn-primary" style={{ padding: '0.9rem', fontSize: '0.9rem', width: '100%', opacity: newPassword.length < 8 ? 0.6 : 1 }}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;