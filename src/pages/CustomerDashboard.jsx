import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BedDouble, Star, User, LogOut,
  Calendar, Clock, Phone, Mail, MapPin, Globe,
  Edit2, Save, X, CheckCircle, MessageSquareWarning, Send
} from 'lucide-react';
import { supabase } from '../supabaseClient';

// ── Shared styles ────────────────────────────────────────────────
const fi = {
  width: '100%', padding: '0.75rem 0.9rem',
  border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: '6px',
  background: '#fff', color: '#1a1a2e', fontSize: '0.9rem',
  fontFamily: 'var(--font-body)', outline: 'none',
};
const lbl = {
  display: 'block', marginBottom: '0.35rem',
  fontSize: '0.72rem', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.07em',
  color: 'var(--text-muted)',
};

// ── Sidebar nav item ─────────────────────────────────────────────
const NavItem = ({ icon: Icon, label, id, active, onClick }) => (
  <button onClick={() => onClick(id)} style={{
    display: 'flex', alignItems: 'center', gap: '0.85rem',
    width: '100%', padding: '0.72rem 1.1rem',
    background: active ? 'rgba(201,168,76,0.1)' : 'transparent',
    border: 'none',
    color: active ? 'var(--accent-dark)' : 'var(--text-muted)',
    cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s',
    borderRadius: '8px',
  }}>
    <Icon size={18} />
    <span style={{ fontSize: '0.88rem', fontFamily: 'var(--font-body)', fontWeight: active ? 700 : 400 }}>{label}</span>
  </button>
);

// ── Star picker ──────────────────────────────────────────────────
const StarPicker = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: '0.25rem' }}>
    {[1, 2, 3, 4, 5].map(n => (
      <button key={n} type="button" className="star-btn" onClick={() => onChange(n)}>
        <Star size={24} fill={n <= value ? 'var(--accent-color)' : 'none'} color={n <= value ? 'var(--accent-color)' : '#d1d5db'} />
      </button>
    ))}
  </div>
);

// ── Review Modal ─────────────────────────────────────────────────
const ReviewModal = ({ booking, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    await onSubmit({ bookingId: booking.id, roomId: booking.room_id, rating, comment });
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--text-main)' }}>Review Your Stay</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
          Reviewing: <strong style={{ color: 'var(--text-main)' }}>{booking.room_name || `Room #${booking.room_id}`}</strong>
          &nbsp;· {booking.check_in} → {booking.check_out}
        </p>
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={lbl}>Your Rating</label>
          <StarPicker value={rating} onChange={setRating} />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={lbl}>Your Review</label>
          <textarea
            style={{ ...fi, resize: 'vertical', minHeight: '100px' }}
            placeholder="Tell us about your experience — the room, service, amenities…"
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || !comment.trim()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star size={15} />{submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Complaint Modal ──────────────────────────────────────────────
const ComplaintModal = ({ bookings, onClose, onSubmit }) => {
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim()) return;
    setSubmitting(true);
    const booking = bookings.find(b => b.id === selectedBookingId);
    await onSubmit({
      bookingId: selectedBookingId,
      roomId: booking?.room_id || null,
      subject,
      description,
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--text-main)' }}>Register a Complaint</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>

        <div style={{ marginBottom: '1.1rem' }}>
          <label style={lbl}>Related Booking (optional)</label>
          <select style={fi} value={selectedBookingId} onChange={e => setSelectedBookingId(e.target.value)}>
            <option value="">— Select a booking —</option>
            {bookings.map(b => (
              <option key={b.id} value={b.id}>
                {b.room_name || `Room #${b.room_id}`} · {b.check_in} → {b.check_out}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1.1rem' }}>
          <label style={lbl}>Subject *</label>
          <input
            style={fi}
            placeholder="e.g. Noisy AC, dirty linen, billing issue…"
            value={subject}
            onChange={e => setSubject(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={lbl}>Description *</label>
          <textarea
            style={{ ...fi, resize: 'vertical', minHeight: '110px' }}
            placeholder="Please describe the issue in detail…"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting || !subject.trim() || !description.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Send size={15} />{submitting ? 'Submitting…' : 'Submit Complaint'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [toast, setToast] = useState('');

  const [profile, setProfile] = useState({
    full_name: '', email: '', phone: '', nationality: '',
    address: '', city: '', state: '', country: '',
    date_of_birth: '', gender: '', id_type: '', id_number: '',
    emergency_contact_name: '', emergency_contact_phone: '',
    dietary_preferences: '', special_requests: '',
  });
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  const navigate = useNavigate();

  // ── Auth ───────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate('/login'); return; }
      setUser(session.user);
      setProfile(prev => ({
        ...prev,
        full_name: session.user.user_metadata?.full_name || '',
        email: session.user.email || '',
      }));
      setAuthLoading(false);
    });
  }, [navigate]);

  // ── Fetch data ─────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const { data: bk, error: bkErr } = await supabase
        .from('bookings').select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (bkErr) console.error('bookings fetch:', bkErr.message);
      setBookings(bk || []);

      const { data: rv, error: rvErr } = await supabase
        .from('reviews').select('*')
        .eq('user_id', user.id);
      if (rvErr) console.error('reviews fetch:', rvErr.message);
      setReviews(rv || []);

      const { data: cp, error: cpErr } = await supabase
        .from('complaints').select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (cpErr) console.error('complaints fetch:', cpErr.message);
      setComplaints(cp || []);

      const stored = JSON.parse(localStorage.getItem(`ta_profile_${user.id}`) || '{}');
      setProfile(prev => ({
        ...prev,
        ...stored,
        email: user.email,
        full_name: stored.full_name || user.user_metadata?.full_name || '',
      }));
    } catch (e) { console.error(e); }
    setDataLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Save profile ───────────────────────────────────────────────
  const saveProfile = async () => {
    setProfileSaving(true);
    localStorage.setItem(`ta_profile_${user.id}`, JSON.stringify(profile));
    await supabase.auth.updateUser({ data: { full_name: profile.full_name } });
    setProfileSaving(false);
    setProfileEditing(false);
    showToast('Profile updated successfully!');
  };

  // ── Submit review ──────────────────────────────────────────────
  // Helper: returns value only if it looks like a UUID, otherwise null
  const toUuidOrNull = (val) => {
    if (!val) return null;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(String(val)) ? val : null;
  };

  const submitReview = async ({ bookingId, roomId, rating, comment }) => {
    const { error } = await supabase.from('reviews').insert([{
      user_id: user.id,
      booking_id: toUuidOrNull(bookingId),
      room_id: toUuidOrNull(roomId),
      rating,
      comment,
      guest_name: profile.full_name || user.email,
      created_at: new Date().toISOString(),
    }]);
    if (error) { alert('Could not submit review: ' + error.message); return; }
    showToast('Review submitted — thank you!');
    fetchData();
  };

  // ── Submit complaint ───────────────────────────────────────────
  const submitComplaint = async ({ bookingId, roomId, subject, description }) => {
    const { error } = await supabase.from('complaints').insert([{
      user_id: user.id,
      room_id: toUuidOrNull(roomId),
      subject,
      description,
      status: 'open',
      guest_name: profile.full_name || user.email,
      guest_email: user.email,
      created_at: new Date().toISOString(),
    }]);
    if (error) { alert('Could not submit complaint: ' + error.message); return; }
    showToast('Complaint registered. We will look into it shortly!');
    fetchData();
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const hasReviewed = (bookingId) => reviews.some(r => r.booking_id === bookingId);

  const statusBadge = (status) => {
    const map = {
      confirmed: 'badge badge-success', cancelled: 'badge badge-danger',
      pending: 'badge badge-warning', completed: 'badge badge-neutral',
      open: 'badge badge-danger', in_progress: 'badge badge-warning',
      resolved: 'badge badge-success',
    };
    return <span className={map[status] || 'badge badge-neutral'}>{status?.replace('_', ' ')}</span>;
  };

  const cardStyle = {
    background: '#fff', border: '1px solid var(--glass-border)',
    borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  };

  if (authLoading) return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-subtle)' }}>
      <p style={{ color: 'var(--text-muted)' }}>Loading your dashboard…</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-subtle)', paddingTop: 'var(--nav-height)' }}>

      {/* ── Toast ────────────────────────────────────────────── */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#059669', color: '#fff', padding: '0.85rem 1.5rem', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', fontWeight: 600 }}>
          <CheckCircle size={18} /> {toast}
        </div>
      )}

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside style={{ width: '240px', background: '#ffffff', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 'var(--nav-height)', height: 'calc(100vh - var(--nav-height))' }}>
        <div style={{ padding: '1.5rem 1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-color), var(--accent-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#1a1a2e', fontSize: '1.1rem', flexShrink: 0 }}>
            {(profile.full_name || user?.email || 'G')[0].toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '0.9rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.full_name || 'Guest'}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
          <NavItem icon={LayoutDashboard}      label="Overview"    id="overview"    active={activeTab==='overview'}    onClick={setActiveTab} />
          <NavItem icon={BedDouble}            label="My Bookings" id="bookings"    active={activeTab==='bookings'}    onClick={setActiveTab} />
          <NavItem icon={Star}                 label="My Reviews"  id="reviews"     active={activeTab==='reviews'}     onClick={setActiveTab} />
          <NavItem icon={MessageSquareWarning} label="Complaints"  id="complaints"  active={activeTab==='complaints'}  onClick={setActiveTab} />
          <NavItem icon={User}                 label="Profile"     id="profile"     active={activeTab==='profile'}     onClick={setActiveTab} />
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)' }}>
          <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'transparent', border: '1px solid rgba(220,38,38,0.4)', color: '#f87171', cursor: 'pointer', padding: '0.6rem 1rem', borderRadius: '6px', width: '100%', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '2rem', overflowX: 'hidden' }}>

        {/* ════ OVERVIEW ════ */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
              Welcome back, {profile.full_name?.split(' ')[0] || 'Guest'}
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>Here's a summary of your TopAvenue stays.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              {[
                { label: 'Total Bookings',  value: bookings.length,                                                               accent: '#2563eb' },
                { label: 'Confirmed Stays', value: bookings.filter(b => b.status === 'confirmed').length,                         accent: '#059669' },
                { label: 'Total Spent',     value: `$${bookings.reduce((s, b) => s + (b.total_price || 0), 0).toLocaleString()}`, accent: 'var(--accent-color)' },
                { label: 'Reviews Given',   value: reviews.length,                                                                accent: '#d97706' },
                { label: 'Complaints',      value: complaints.length,                                                             accent: '#dc2626' },
              ].map((s, i) => (
                <div key={i} style={{ ...cardStyle, padding: '1.25rem', borderLeft: `4px solid ${s.accent}` }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', margin: '0 0 0.4rem' }}>{s.label}</p>
                  <p style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{s.value}</p>
                </div>
              ))}
            </div>

            <div style={{ ...cardStyle, overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Recent Bookings</h3>
              </div>
              {dataLoading ? (
                <p style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</p>
              ) : bookings.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <BedDouble size={36} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                  <p>No bookings yet.</p>
                  <button className="btn btn-primary" onClick={() => navigate('/book')} style={{ marginTop: '1rem' }}>Book a Room</button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead><tr><th>Room</th><th>Check In</th><th>Check Out</th><th>Amount</th><th>Status</th><th>Review</th></tr></thead>
                    <tbody>
                      {bookings.slice(0, 5).map(b => (
                        <tr key={b.id}>
                          <td style={{ fontWeight: 600 }}>{b.room_name || `Room #${b.room_id}`}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{b.check_in}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{b.check_out}</td>
                          <td style={{ fontWeight: 700, color: 'var(--accent-dark)' }}>${b.total_price}</td>
                          <td>{statusBadge(b.status)}</td>
                          <td>
                            {b.status === 'confirmed' || b.status === 'completed' ? (
                              hasReviewed(b.id)
                                ? <span className="badge badge-neutral">Reviewed</span>
                                : <button className="btn btn-ghost" style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }} onClick={() => setReviewTarget(b)}>
                                    <Star size={12} style={{ marginRight: 4 }} />Write Review
                                  </button>
                            ) : <span style={{ color: 'var(--text-light)', fontSize: '0.82rem' }}>—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════ BOOKINGS ════ */}
        {activeTab === 'bookings' && (
          <div className="animate-fade-in">
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '1.5rem' }}>My Bookings</h1>
            <div style={{ ...cardStyle, overflow: 'hidden' }}>
              {dataLoading ? (
                <p style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</p>
              ) : bookings.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <BedDouble size={48} style={{ opacity: 0.25, marginBottom: '1rem' }} />
                  <p style={{ marginBottom: '1.5rem' }}>You haven't made any bookings yet.</p>
                  <button className="btn btn-primary" onClick={() => navigate('/book')}>Browse Rooms</button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead><tr><th>Booking Ref</th><th>Room</th><th>Check In</th><th>Check Out</th><th>Guests</th><th>Amount</th><th>Status</th><th>Review</th></tr></thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b.id}>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'monospace' }}>#{String(b.id).slice(0,8).toUpperCase()}</td>
                          <td style={{ fontWeight: 600 }}>{b.room_name || `Room #${b.room_id}`}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{b.check_in}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{b.check_out}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{b.guests || 1}</td>
                          <td style={{ fontWeight: 700, color: 'var(--accent-dark)' }}>${b.total_price}</td>
                          <td>{statusBadge(b.status)}</td>
                          <td>
                            {(b.status === 'confirmed' || b.status === 'completed') ? (
                              hasReviewed(b.id)
                                ? <span className="badge badge-success"><CheckCircle size={11} style={{ marginRight: 4 }} />Reviewed</span>
                                : <button className="btn btn-ghost" style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }} onClick={() => setReviewTarget(b)}>
                                    <Star size={12} />Review
                                  </button>
                            ) : <span style={{ color: 'var(--text-light)', fontSize: '0.82rem' }}>—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════ REVIEWS ════ */}
        {activeTab === 'reviews' && (
          <div className="animate-fade-in">
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '1.5rem' }}>My Reviews</h1>
            {reviews.length === 0 ? (
              <div style={{ ...cardStyle, padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Star size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p>You haven't written any reviews yet.</p>
                <p style={{ fontSize: '0.88rem', marginTop: '0.5rem' }}>After a confirmed stay, you can review your room from the Bookings tab.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {reviews.map(r => (
                  <div key={r.id} style={{ ...cardStyle, padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <p style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>{r.room_name || `Room #${r.room_id}`}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(r.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.2rem' }}>
                        {[1,2,3,4,5].map(n => <Star key={n} size={16} fill={n <= r.rating ? 'var(--accent-color)' : 'none'} color={n <= r.rating ? 'var(--accent-color)' : '#d1d5db'} />)}
                      </div>
                    </div>
                    <p style={{ color: 'var(--text-main)', fontStyle: 'italic', lineHeight: 1.7, margin: 0 }}>"{r.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════ COMPLAINTS ════ */}
        {activeTab === 'complaints' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--text-main)', margin: 0 }}>My Complaints</h1>
              <button
                className="btn btn-primary"
                onClick={() => setShowComplaintModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <MessageSquareWarning size={16} /> New Complaint
              </button>
            </div>

            {complaints.length === 0 ? (
              <div style={{ ...cardStyle, padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <MessageSquareWarning size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p>No complaints registered.</p>
                <p style={{ fontSize: '0.88rem', marginTop: '0.5rem' }}>If you face any issue during your stay, click "New Complaint" to let us know.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {complaints.map(c => (
                  <div key={c.id} style={{ ...cardStyle, padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <p style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem', fontSize: '1rem' }}>{c.subject}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {c.room_id ? `Room #${c.room_id} · ` : ''}
                          {new Date(c.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      {statusBadge(c.status)}
                    </div>
                    <p style={{ color: 'var(--text-main)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>{c.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════ PROFILE ════ */}
        {activeTab === 'profile' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--text-main)', margin: 0 }}>My Profile</h1>
              {!profileEditing ? (
                <button className="btn btn-outline" onClick={() => setProfileEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <Edit2 size={15} /> Edit Profile
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-ghost" onClick={() => setProfileEditing(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                    <X size={15} /> Cancel
                  </button>
                  <button className="btn btn-primary" onClick={saveProfile} disabled={profileSaving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <Save size={15} />{profileSaving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              <div style={{ ...cardStyle, padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={18} color="var(--accent-color)" /> Personal Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                  {[
                    { key: 'full_name', label: 'Full Name', placeholder: 'Your full name', icon: User },
                    { key: 'email', label: 'Email Address', placeholder: 'your@email.com', icon: Mail, readOnly: true },
                    { key: 'phone', label: 'Phone Number', placeholder: '+91 98XXXXXXXX', icon: Phone },
                    { key: 'date_of_birth', label: 'Date of Birth', type: 'date', icon: Calendar },
                    { key: 'gender', label: 'Gender', select: ['Prefer not to say', 'Male', 'Female', 'Non-binary', 'Other'] },
                    { key: 'nationality', label: 'Nationality', placeholder: 'e.g. Indian', icon: Globe },
                  ].map(({ key, label, placeholder, icon: Icon, type, select, readOnly }) => (
                    <div key={key}>
                      <label style={lbl}>{label}</label>
                      {select ? (
                        profileEditing ? (
                          <select style={fi} value={profile[key]} onChange={e => setProfile({...profile, [key]: e.target.value})}>
                            {select.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <p style={{ margin: 0, color: profile[key] ? 'var(--text-main)' : 'var(--text-light)', fontSize: '0.9rem', padding: '0.75rem 0' }}>{profile[key] || '—'}</p>
                        )
                      ) : profileEditing && !readOnly ? (
                        <input style={fi} type={type || 'text'} value={profile[key]} onChange={e => setProfile({...profile, [key]: e.target.value})} placeholder={placeholder} />
                      ) : (
                        <p style={{ margin: 0, color: profile[key] ? 'var(--text-main)' : 'var(--text-light)', fontSize: '0.9rem', padding: '0.75rem 0' }}>{profile[key] || '—'}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ ...cardStyle, padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={18} color="var(--accent-color)" /> Address
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                  {[
                    { key: 'address', label: 'Street Address', placeholder: 'House no., Street name' },
                    { key: 'city', label: 'City', placeholder: 'e.g. Mumbai' },
                    { key: 'state', label: 'State / Province', placeholder: 'e.g. Maharashtra' },
                    { key: 'country', label: 'Country', placeholder: 'e.g. India' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label style={lbl}>{label}</label>
                      {profileEditing
                        ? <input style={fi} value={profile[key]} onChange={e => setProfile({...profile, [key]: e.target.value})} placeholder={placeholder} />
                        : <p style={{ margin: 0, color: profile[key] ? 'var(--text-main)' : 'var(--text-light)', fontSize: '0.9rem', padding: '0.75rem 0' }}>{profile[key] || '—'}</p>
                      }
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ ...cardStyle, padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={18} color="var(--accent-color)" /> ID &amp; Verification
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <label style={lbl}>ID Type</label>
                    {profileEditing ? (
                      <select style={fi} value={profile.id_type} onChange={e => setProfile({...profile, id_type: e.target.value})}>
                        {['', 'Passport', 'Aadhaar Card', 'PAN Card', "Driver's License", 'Voter ID'].map(o => <option key={o} value={o}>{o || 'Select…'}</option>)}
                      </select>
                    ) : (
                      <p style={{ margin: 0, color: profile.id_type ? 'var(--text-main)' : 'var(--text-light)', fontSize: '0.9rem', padding: '0.75rem 0' }}>{profile.id_type || '—'}</p>
                    )}
                  </div>
                  <div>
                    <label style={lbl}>ID Number</label>
                    {profileEditing
                      ? <input style={fi} value={profile.id_number} onChange={e => setProfile({...profile, id_number: e.target.value})} placeholder="XXXXXXXXXXXXXX" />
                      : <p style={{ margin: 0, color: profile.id_number ? 'var(--text-main)' : 'var(--text-light)', fontSize: '0.9rem', padding: '0.75rem 0' }}>{profile.id_number ? '••••' + profile.id_number.slice(-4) : '—'}</p>
                    }
                  </div>
                </div>
              </div>

              <div style={{ ...cardStyle, padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={18} color="var(--accent-color)" /> Emergency Contact
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                  {[
                    { key: 'emergency_contact_name', label: 'Contact Name', placeholder: 'Full name' },
                    { key: 'emergency_contact_phone', label: 'Contact Phone', placeholder: '+91 98XXXXXXXX' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label style={lbl}>{label}</label>
                      {profileEditing
                        ? <input style={fi} value={profile[key]} onChange={e => setProfile({...profile, [key]: e.target.value})} placeholder={placeholder} />
                        : <p style={{ margin: 0, color: profile[key] ? 'var(--text-main)' : 'var(--text-light)', fontSize: '0.9rem', padding: '0.75rem 0' }}>{profile[key] || '—'}</p>
                      }
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ ...cardStyle, padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Star size={18} color="var(--accent-color)" /> Stay Preferences
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {[
                    { key: 'dietary_preferences', label: 'Dietary Preferences', placeholder: 'e.g. Vegetarian, Vegan, Gluten-free…' },
                    { key: 'special_requests', label: 'Special Requests / Notes', placeholder: 'Early check-in, ground floor, accessibility needs…' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label style={lbl}>{label}</label>
                      {profileEditing
                        ? <textarea style={{ ...fi, resize: 'vertical', minHeight: '80px' }} value={profile[key]} onChange={e => setProfile({...profile, [key]: e.target.value})} placeholder={placeholder} />
                        : <p style={{ margin: 0, color: profile[key] ? 'var(--text-main)' : 'var(--text-light)', fontSize: '0.9rem', padding: '0.75rem 0', lineHeight: 1.6 }}>{profile[key] || '—'}</p>
                      }
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      {reviewTarget && (
        <ReviewModal
          booking={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSubmit={submitReview}
        />
      )}

      {showComplaintModal && (
        <ComplaintModal
          bookings={bookings}
          onClose={() => setShowComplaintModal(false)}
          onSubmit={submitComplaint}
        />
      )}
    </div>
  );
};

export default CustomerDashboard;
