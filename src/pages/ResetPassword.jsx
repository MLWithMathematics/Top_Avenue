import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Eye, EyeOff, Lock } from 'lucide-react';

const inputStyle = {
  width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem',
  borderRadius: '6px', border: '1.5px solid rgba(0,0,0,0.12)',
  background: '#fff', color: '#1a1a2e', fontSize: '0.95rem',
  outline: 'none', transition: 'border-color 0.2s',
  fontFamily: 'var(--font-body)',
};

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase automatically parses the #access_token from the URL
    // We just need to check if we have a session.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // If there's no session, the link is invalid or expired
        navigate('/login');
      }
    });
  }, [navigate]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    alert('Password updated successfully! You are now logged in.');
    navigate('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-subtle)' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '2rem' }}>
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Update Password</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Enter your new password below.</p>
        </div>

        {error && (
          <div style={{ background: 'var(--danger-bg)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '8px', padding: '0.9rem 1rem', marginBottom: '1.5rem', color: 'var(--danger)', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>New Password</label>
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
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '0.9rem', fontSize: '0.9rem', width: '100%' }}>
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
