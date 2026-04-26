import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BedDouble, CreditCard, UserCog,
  LogOut, ShieldAlert, RefreshCw, Plus, X, Save,
  TrendingUp, CheckCircle, AlertCircle, Trash2
} from 'lucide-react';
import { supabase } from '../supabaseClient';

// ── Shared input style for light theme ──────────────────────────
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

// ── Stat Card ────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, accent }) => (
  <div style={{
    background: '#fff', border: '1px solid rgba(0,0,0,0.07)',
    borderRadius: '12px', padding: '1.5rem',
    borderLeft: `4px solid ${accent}`,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  }}>
    <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{label}</p>
    <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{value}</p>
    {sub && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{sub}</p>}
  </div>
);

// ── Modal wrapper ────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="modal-box">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--text-main)' }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
      </div>
      {children}
    </div>
  </div>
);

// ── Sidebar item ─────────────────────────────────────────────────
const SidebarItem = ({ icon: Icon, label, id, active, onClick }) => (
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

// ════════════════════════════════════════════════════════════════
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [authState, setAuthState] = useState('loading');
  const [adminUser, setAdminUser] = useState(null);
  const [stats, setStats] = useState({ revenue: 0, occupancy: 0, activeBookings: 0, totalGuests: 0 });
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [staff, setStaff] = useState([]);
  const [guests, setGuests] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Modals
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);

  // Add Room form
  const [roomForm, setRoomForm] = useState({ name: '', description: '', price: '', capacity: 2, status: 'vacant' });
  const [roomSaving, setRoomSaving] = useState(false);

  // Add Staff form
  const [staffForm, setStaffForm] = useState({ name: '', role: '', email: '', phone: '' });
  const [staffSaving, setStaffSaving] = useState(false);

  const navigate = useNavigate();

  // ── Auth check ─────────────────────────────────────────────────
  useEffect(() => {
    const verifyAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setAuthState('denied'); return; }

      const role = session.user?.user_metadata?.role;
      if (role === 'admin') { setAdminUser(session.user); setAuthState('authorized'); return; }

      try {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        if (profile?.role === 'admin') { setAdminUser(session.user); setAuthState('authorized'); return; }
      } catch { /* profiles table may not exist */ }

      setAuthState('denied');
    };
    verifyAdmin();
  }, []);

  // ── Data fetch ──────────────────────────────────────────────────
  const fetchDashboardData = useCallback(async () => {
    if (authState !== 'authorized') return;
    setDataLoading(true);
    try {
      const { data: allBookings } = await supabase
        .from('bookings').select('*').order('created_at', { ascending: false });
      const bookingsList = allBookings || [];
      setBookings(bookingsList);

      const { data: allRooms } = await supabase.from('rooms').select('*').order('name');
      setRooms(allRooms || []);

      const storedStaff = JSON.parse(localStorage.getItem('ta_staff') || '[]');
      setStaff(storedStaff);

      // Build guests list from bookings
      const uniqueGuests = [];
      const seenKeys = new Set();
      bookingsList.forEach(b => {
        const key = b.guest_email || b.user_id;
        if (key && !seenKeys.has(key)) {
          seenKeys.add(key);
          uniqueGuests.push({
            id: b.user_id || b.guest_email,
            name: b.guest_name || 'Guest',
            email: b.guest_email || '—',
            bookingCount: bookingsList.filter(x => (x.guest_email || x.user_id) === key).length,
            lastStay: b.check_in,
            totalSpent: bookingsList
              .filter(x => (x.guest_email || x.user_id) === key)
              .reduce((s, x) => s + (x.total_price || 0), 0),
          });
        }
      });
      setGuests(uniqueGuests);

      const revenue = bookingsList.reduce((s, b) => s + (b.total_price || 0), 0);
      const confirmed = bookingsList.filter(b => b.status === 'confirmed').length;
      const totalRooms = (allRooms || []).length;
      const occupied = (allRooms || []).filter(r => r.status === 'occupied').length;
      setStats({
        revenue,
        occupancy: totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0,
        activeBookings: confirmed,
        totalGuests: uniqueGuests.length,
      });
    } catch (err) { console.error(err); }
    setDataLoading(false);
  }, [authState]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  useEffect(() => {
    if (authState !== 'authorized') return;
    const ch = supabase.channel('admin-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, fetchDashboardData)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [authState, fetchDashboardData]);

  // ── Room CRUD ────────────────────────────────────────────────────
  const saveRoom = async () => {
    if (!roomForm.name || !roomForm.price) return;
    setRoomSaving(true);
    const { error } = await supabase.from('rooms').insert([{
      name: roomForm.name, description: roomForm.description,
      price: parseFloat(roomForm.price), capacity: parseInt(roomForm.capacity),
      status: roomForm.status,
    }]);
    setRoomSaving(false);
    if (error) { alert('Error: ' + error.message); return; }
    setShowAddRoom(false);
    setRoomForm({ name: '', description: '', price: '', capacity: 2, status: 'vacant' });
    fetchDashboardData();
  };

  const deleteRoom = async (id) => {
    if (!confirm('Delete this room?')) return;
    await supabase.from('rooms').delete().eq('id', id);
    fetchDashboardData();
  };

  // ── Staff CRUD (localStorage) ────────────────────────────────────
  const saveStaff = () => {
    if (!staffForm.name || !staffForm.role) return;
    setStaffSaving(true);
    const updated = [...staff, { id: Date.now(), ...staffForm }];
    localStorage.setItem('ta_staff', JSON.stringify(updated));
    setStaff(updated);
    setShowAddStaff(false);
    setStaffForm({ name: '', role: '', email: '', phone: '' });
    setStaffSaving(false);
  };

  const deleteStaff = (id) => {
    const updated = staff.filter(s => s.id !== id);
    localStorage.setItem('ta_staff', JSON.stringify(updated));
    setStaff(updated);
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); navigate('/login'); };

  const statusBadge = (status) => {
    const map = {
      confirmed: 'badge badge-success', cancelled: 'badge badge-danger',
      pending: 'badge badge-warning', completed: 'badge badge-neutral',
      vacant: 'badge badge-success', occupied: 'badge badge-warning',
      maintenance: 'badge badge-danger',
    };
    return <span className={map[status] || 'badge badge-neutral'}>{status}</span>;
  };

  // ── Guards ───────────────────────────────────────────────────────
  if (authState === 'loading') return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-subtle)' }}>
      <p style={{ color: 'var(--text-muted)' }}>Verifying admin access…</p>
    </div>
  );

  if (authState === 'denied') return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-subtle)', flexDirection: 'column', gap: '1.5rem' }}>
      <ShieldAlert size={64} color="var(--danger)" />
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--text-main)' }}>Access Denied</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '400px', textAlign: 'center' }}>You do not have administrator privileges. Please log in with your admin account.</p>
      <button className="btn btn-primary" onClick={() => navigate('/login')}>Go to Login</button>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-subtle)', paddingTop: 'var(--nav-height)' }}>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside style={{ width: '240px', background: '#ffffff', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 'var(--nav-height)', height: 'calc(100vh - var(--nav-height))' }}>
        <div style={{ padding: '1.5rem 1rem 1rem', borderBottom: '1px solid var(--glass-border)' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: 'var(--text-main)', margin: 0 }}>TOP<span style={{ color: 'var(--accent-color)' }}>AVENUE</span></p>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.2rem 0 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin Console</p>
        </div>
        <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
          <SidebarItem icon={LayoutDashboard} label="Overview"  id="overview" active={activeTab==='overview'} onClick={setActiveTab} />
          <SidebarItem icon={BedDouble}       label="Rooms"     id="rooms"    active={activeTab==='rooms'}    onClick={setActiveTab} />
          <SidebarItem icon={Users}           label="Guests"    id="guests"   active={activeTab==='guests'}   onClick={setActiveTab} />
          <SidebarItem icon={CreditCard}      label="Payments"  id="payments" active={activeTab==='payments'} onClick={setActiveTab} />
          <SidebarItem icon={UserCog}         label="Staff"     id="staff"    active={activeTab==='staff'}    onClick={setActiveTab} />
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', wordBreak: 'break-all' }}>{adminUser?.email}</p>
          <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'transparent', border: '1px solid rgba(220,38,38,0.4)', color: '#f87171', cursor: 'pointer', padding: '0.6rem 1rem', borderRadius: '6px', width: '100%', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '2rem', overflowX: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--text-main)', margin: 0 }}>
              { {overview:'Overview', rooms:'Room Management', guests:'Guests', payments:'Payments', staff:'Staff Management'}[activeTab] }
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
              TopAvenue Admin · {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}
            </p>
          </div>
          <button onClick={fetchDashboardData} style={{ background: 'none', border: '1px solid var(--glass-border)', borderRadius: '6px', padding: '0.5rem 0.75rem', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* ════ OVERVIEW ════ */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              <StatCard label="Total Revenue"   value={`$${stats.revenue.toLocaleString()}`} sub="All bookings"   accent="#059669" />
              <StatCard label="Occupancy Rate"  value={`${stats.occupancy}%`}                sub="Current rooms"  accent="#2563eb" />
              <StatCard label="Active Bookings" value={stats.activeBookings}                  sub="Confirmed"      accent="#d97706" />
              <StatCard label="Total Guests"    value={stats.totalGuests}                     sub="Unique guests"  accent="var(--accent-color)" />
            </div>
            <div style={{ background: '#fff', border: '1px solid var(--glass-border)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Recent Bookings</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{bookings.length} total</span>
              </div>
              {dataLoading ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>Loading…</p>
              ) : bookings.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>No bookings yet.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead><tr><th>Guest</th><th>Room</th><th>Check In</th><th>Check Out</th><th>Amount</th><th>Status</th></tr></thead>
                    <tbody>
                      {bookings.slice(0, 10).map(b => (
                        <tr key={b.id}>
                          <td><div style={{ fontWeight: 600 }}>{b.guest_name || '—'}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.guest_email}</div></td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{b.room_id ? `Room #${b.room_id}` : '—'}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{b.check_in}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{b.check_out}</td>
                          <td style={{ fontWeight: 700, color: 'var(--accent-dark)' }}>${b.total_price}</td>
                          <td>{statusBadge(b.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════ ROOMS ════ */}
        {activeTab === 'rooms' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
              <button className="btn btn-primary" onClick={() => setShowAddRoom(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={16} /> Add Room
              </button>
            </div>
            <div style={{ background: '#fff', border: '1px solid var(--glass-border)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              {rooms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                  <BedDouble size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                  <p>No rooms yet. Click "Add Room" to get started.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead><tr><th>Name</th><th>Description</th><th>Price/Night</th><th>Capacity</th><th>Status</th><th></th></tr></thead>
                    <tbody>
                      {rooms.map(r => (
                        <tr key={r.id}>
                          <td style={{ fontWeight: 600 }}>{r.name}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '220px' }}>{r.description}</td>
                          <td style={{ fontWeight: 700, color: 'var(--accent-dark)' }}>${r.price}</td>
                          <td style={{ color: 'var(--text-muted)' }}>{r.capacity} guests</td>
                          <td>{statusBadge(r.status)}</td>
                          <td>
                            <button onClick={() => deleteRoom(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '0.3rem' }}><Trash2 size={16} /></button>
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

        {/* ════ GUESTS ════ */}
        {activeTab === 'guests' && (
          <div className="animate-fade-in">
            <div style={{ background: '#fff', border: '1px solid var(--glass-border)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>All Guests</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>Auto-populated from customer bookings in real time</p>
              </div>
              {guests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                  <Users size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                  <p>No guests yet. Guests appear here automatically after their first booking.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Bookings</th><th>Total Spent</th><th>Last Stay</th></tr></thead>
                    <tbody>
                      {guests.map(g => (
                        <tr key={g.id}>
                          <td style={{ fontWeight: 600 }}>{g.name}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{g.email}</td>
                          <td><span className="badge badge-info">{g.bookingCount} booking{g.bookingCount !== 1 ? 's' : ''}</span></td>
                          <td style={{ fontWeight: 700, color: 'var(--accent-dark)' }}>${g.totalSpent.toLocaleString()}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{g.lastStay}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════ PAYMENTS ════ */}
        {activeTab === 'payments' && (
          <div className="animate-fade-in">
            <div style={{ background: '#fff', border: '1px solid var(--glass-border)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Payment Ledger</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead><tr><th>Date</th><th>Guest</th><th>Room</th><th>Amount</th><th>Status</th></tr></thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id}>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{new Date(b.created_at).toLocaleDateString()}</td>
                        <td style={{ fontWeight: 600 }}>{b.guest_name || '—'}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{b.room_id ? `Room #${b.room_id}` : '—'}</td>
                        <td style={{ fontWeight: 700, color: 'var(--accent-dark)' }}>${b.total_price}</td>
                        <td>{statusBadge(b.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {bookings.length === 0 && <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No payment records yet.</p>}
              </div>
            </div>
          </div>
        )}

        {/* ════ STAFF ════ */}
        {activeTab === 'staff' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
              <button className="btn btn-primary" onClick={() => setShowAddStaff(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={16} /> Add Staff Member
              </button>
            </div>
            <div style={{ background: '#fff', border: '1px solid var(--glass-border)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              {staff.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                  <UserCog size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                  <p>No staff added yet. Add your first team member.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Phone</th><th></th></tr></thead>
                    <tbody>
                      {staff.map(s => (
                        <tr key={s.id}>
                          <td style={{ fontWeight: 600 }}>{s.name}</td>
                          <td><span className="badge badge-info">{s.role}</span></td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{s.email}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{s.phone}</td>
                          <td>
                            <button onClick={() => deleteStaff(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '0.3rem' }}><Trash2 size={16} /></button>
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
      </main>

      {/* ══ ADD ROOM MODAL ══ */}
      {showAddRoom && (
        <Modal title="Add New Room" onClose={() => setShowAddRoom(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div><label style={lbl}>Room Name *</label><input style={fi} value={roomForm.name} onChange={e => setRoomForm({...roomForm, name: e.target.value})} placeholder="e.g. Deluxe King Suite" /></div>
            <div><label style={lbl}>Description</label><textarea style={{...fi, resize: 'vertical', minHeight: '80px'}} value={roomForm.description} onChange={e => setRoomForm({...roomForm, description: e.target.value})} placeholder="Room features and amenities…" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><label style={lbl}>Price per Night ($) *</label><input style={fi} type="number" min="0" value={roomForm.price} onChange={e => setRoomForm({...roomForm, price: e.target.value})} placeholder="299" /></div>
              <div><label style={lbl}>Capacity (Guests)</label><input style={fi} type="number" min="1" max="10" value={roomForm.capacity} onChange={e => setRoomForm({...roomForm, capacity: e.target.value})} /></div>
            </div>
            <div><label style={lbl}>Status</label>
              <select style={fi} value={roomForm.status} onChange={e => setRoomForm({...roomForm, status: e.target.value})}>
                <option value="vacant">Vacant</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button className="btn btn-ghost" onClick={() => setShowAddRoom(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveRoom} disabled={roomSaving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Save size={15} />{roomSaving ? 'Saving…' : 'Save Room'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ══ ADD STAFF MODAL ══ */}
      {showAddStaff && (
        <Modal title="Add Staff Member" onClose={() => setShowAddStaff(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div><label style={lbl}>Full Name *</label><input style={fi} value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} placeholder="e.g. Priya Sharma" /></div>
            <div><label style={lbl}>Role / Position *</label><input style={fi} value={staffForm.role} onChange={e => setStaffForm({...staffForm, role: e.target.value})} placeholder="e.g. Front Desk Manager" /></div>
            <div><label style={lbl}>Email</label><input style={fi} type="email" value={staffForm.email} onChange={e => setStaffForm({...staffForm, email: e.target.value})} placeholder="staff@topavenue.com" /></div>
            <div><label style={lbl}>Phone</label><input style={fi} value={staffForm.phone} onChange={e => setStaffForm({...staffForm, phone: e.target.value})} placeholder="+91 98XXXXXXXX" /></div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button className="btn btn-ghost" onClick={() => setShowAddStaff(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveStaff} disabled={staffSaving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Save size={15} />{staffSaving ? 'Saving…' : 'Add Staff'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminDashboard;
