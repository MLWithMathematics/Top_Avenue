import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BedDouble, CreditCard, UserCog,
  LogOut, ShieldAlert, RefreshCw, Plus, X, Save,
  CheckCircle, Trash2, Star, MessageSquareWarning, AlertCircle, Eye, Pencil, Hash
} from 'lucide-react';
import { supabase } from '../supabaseClient';

// ── Shared input style ───────────────────────────────────────────
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
  const [reviews, setReviews] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ── Modal states ──────────────────────────────────────────────
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showEditRoom, setShowEditRoom] = useState(false);
  const [editRoomForm, setEditRoomForm] = useState({ id: null, name: '', description: '', price: '', capacity: 2, quantity: 1, status: 'vacant' });
  const [editRoomSaving, setEditRoomSaving] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);

  // ── Pagination ────────────────────────────────────────────────
  const PER_PAGE = 10;
  const [pages, setPages] = useState({ bookings: 1, guests: 1, payments: 1, reviews: 1, complaints: 1 });
  const paginate = (list, tab) => list.slice((pages[tab] - 1) * PER_PAGE, pages[tab] * PER_PAGE);
  const PageControls = ({ tab, total }) => {
    const totalPages = Math.ceil(total / PER_PAGE);
    if (totalPages <= 1) return null;
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderTop: '1px solid var(--glass-border)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        <span>Page {pages[tab]} of {totalPages}</span>
        <button onClick={() => setPages(p => ({...p, [tab]: Math.max(1, p[tab]-1)}))} disabled={pages[tab] === 1} style={{ background: 'none', border: '1px solid var(--glass-border)', borderRadius: '4px', padding: '0.25rem 0.6rem', cursor: 'pointer', color: 'var(--text-muted)' }}>‹</button>
        <button onClick={() => setPages(p => ({...p, [tab]: Math.min(totalPages, p[tab]+1)}))} disabled={pages[tab] === totalPages} style={{ background: 'none', border: '1px solid var(--glass-border)', borderRadius: '4px', padding: '0.25rem 0.6rem', cursor: 'pointer', color: 'var(--text-muted)' }}>›</button>
      </div>
    );
  };

  // Add Room form — includes quantity
  const [roomForm, setRoomForm] = useState({ name: '', description: '', price: '', capacity: 2, quantity: 1, status: 'vacant' });
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

  // ── Data fetch ────────────────────────────────────────────────
  const fetchDashboardData = useCallback(async () => {
    if (authState !== 'authorized') return;
    setDataLoading(true);
    try {
      // ── Bookings ──
      const { data: allBookings } = await supabase
        .from('bookings').select('*').order('created_at', { ascending: false });
      const bookingsList = allBookings || [];
      setBookings(bookingsList);

      // ── Rooms ──
      const { data: allRooms } = await supabase.from('rooms').select('*').order('name');
      const roomsList = allRooms || [];

      const today = new Date().toISOString().split('T')[0];
      const updatedRooms = await Promise.all(
        roomsList.map(async (room) => {
          const activeBooking = bookingsList.find(
            b => b.room_id === room.id &&
                 b.status === 'confirmed' &&
                 b.check_in <= today &&
                 b.check_out >= today
          );
          const shouldBeOccupied = !!activeBooking;
          if (shouldBeOccupied && room.status === 'vacant') {
            await supabase.from('rooms').update({ status: 'occupied' }).eq('id', room.id);
            return { ...room, status: 'occupied' };
          }
          if (!shouldBeOccupied && room.status === 'occupied') {
            await supabase.from('rooms').update({ status: 'vacant' }).eq('id', room.id);
            return { ...room, status: 'vacant' };
          }
          return room;
        })
      );
      setRooms(updatedRooms);

      // ── Staff (Supabase) ──
      const { data: staffData } = await supabase.from('staff').select('*').order('name');
      setStaff(staffData || []);

      // ── Guests ──
      const uniqueGuests = [];
      const seenKeys = new Set();
      bookingsList.forEach(b => {
        const key = b.guest_email || b.user_id;
        if (key && !seenKeys.has(key)) {
          seenKeys.add(key);
          const guestBookings = bookingsList.filter(x => (x.guest_email || x.user_id) === key);
          uniqueGuests.push({
            id: b.user_id || b.guest_email,
            name: b.guest_name || 'Guest',
            email: b.guest_email || '—',
            bookingCount: guestBookings.length,
            totalPeople: guestBookings.reduce((s, x) => s + (x.guests || 1), 0),
            roomNo: guestBookings.map(x => x.room_id ? `#${x.room_id}` : '—').filter((v, i, a) => a.indexOf(v) === i).join(', '),
            lastStay: b.check_in,
            totalSpent: guestBookings.reduce((s, x) => s + (x.total_price || 0), 0),
          });
        }
      });
      setGuests(uniqueGuests);

      // ── Reviews ──
      const { data: allReviews } = await supabase
        .from('reviews').select('*').order('created_at', { ascending: false });
      setReviews(allReviews || []);

      // ── Complaints ──
      const { data: allComplaints } = await supabase
        .from('complaints').select('*').order('created_at', { ascending: false });
      setComplaints(allComplaints || []);

      // ── Stats ──
      const revenue = bookingsList.reduce((s, b) => s + (b.total_price || 0), 0);
      const confirmed = bookingsList.filter(b => b.status === 'confirmed').length;
      const totalRooms = updatedRooms.length;
      const occupied = updatedRooms.filter(r => r.status === 'occupied').length;
      const openComplaints = (allComplaints || []).filter(c => c.status === 'open').length;
      setStats({
        revenue,
        occupancy: totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0,
        activeBookings: confirmed,
        totalGuests: uniqueGuests.length,
        openComplaints,
      });
    } catch (err) { console.error(err); }
    setDataLoading(false);
    setRefreshing(false);
  }, [authState]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  // ── Real-time subscriptions ───────────────────────────────────
  useEffect(() => {
    if (authState !== 'authorized') return;
    const ch = supabase.channel('admin-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' },   fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' },    fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' },      fetchDashboardData)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [authState, fetchDashboardData]);

  const handleRefresh = () => { setRefreshing(true); fetchDashboardData(); };

  // ── Room CRUD ─────────────────────────────────────────────────
  const saveRoom = async () => {
    if (!roomForm.name || !roomForm.price) return;
    setRoomSaving(true);
    const { error } = await supabase.from('rooms').insert([{
      name: roomForm.name,
      description: roomForm.description,
      price: parseFloat(roomForm.price),
      capacity: parseInt(roomForm.capacity),
      quantity: parseInt(roomForm.quantity) || 1,
      status: roomForm.status,
    }]);
    setRoomSaving(false);
    if (error) { alert('Error: ' + error.message); return; }
    setShowAddRoom(false);
    setRoomForm({ name: '', description: '', price: '', capacity: 2, quantity: 1, status: 'vacant' });
    fetchDashboardData();
  };

  const deleteRoom = async (id) => {
    if (!window.confirm('Delete this room?')) return;
    await supabase.from('rooms').delete().eq('id', id);
    fetchDashboardData();
  };

  const openEditRoom = (room) => {
    setEditRoomForm({
      id: room.id,
      name: room.name,
      description: room.description || '',
      price: room.price,
      capacity: room.capacity,
      quantity: room.quantity ?? 1,
      status: room.status,
    });
    setShowEditRoom(true);
  };

  const updateRoom = async () => {
    if (!editRoomForm.name || !editRoomForm.price) return;
    setEditRoomSaving(true);
    const { error } = await supabase.from('rooms').update({
      name: editRoomForm.name,
      description: editRoomForm.description,
      price: parseFloat(editRoomForm.price),
      capacity: parseInt(editRoomForm.capacity),
      quantity: parseInt(editRoomForm.quantity) || 1,
      status: editRoomForm.status,
    }).eq('id', editRoomForm.id);
    setEditRoomSaving(false);
    if (error) { alert('Error: ' + error.message); return; }
    setShowEditRoom(false);
    fetchDashboardData();
  };

  // ── Complaint status update + admin reply ──────────────────
  const updateComplaintStatus = async (id, status) => {
    await supabase.from('complaints').update({ status }).eq('id', id);
    fetchDashboardData();
  };

  const [replyText,   setReplyText]   = useState('');
  const [replySaving, setReplySaving] = useState(false);

  const submitAdminReply = async (complaintId) => {
    if (!replyText.trim()) return;
    setReplySaving(true);
    const { error } = await supabase.from('complaints').update({
      admin_reply:      replyText.trim(),
      admin_replied_at: new Date().toISOString(),
      status:           'in_progress',       // auto-advance status
    }).eq('id', complaintId);
    setReplySaving(false);
    if (error) { alert('Could not save reply: ' + error.message); return; }
    setReplyText('');
    // Update the open modal locally so the reply appears immediately
    setSelectedComplaint(prev => prev ? {
      ...prev,
      admin_reply: replyText.trim(),
      admin_replied_at: new Date().toISOString(),
      status: 'in_progress',
    } : null);
    fetchDashboardData();
  };

  // ── Staff CRUD ────────────────────────────────────────────────
  const saveStaff = async () => {
    if (!staffForm.name || !staffForm.role) return;
    setStaffSaving(true);
    const { error } = await supabase.from('staff').insert([{
      name:  staffForm.name,
      role:  staffForm.role,
      email: staffForm.email,
      phone: staffForm.phone,
    }]);
    setStaffSaving(false);
    if (error) { alert('Error saving staff: ' + error.message); return; }
    setShowAddStaff(false);
    setStaffForm({ name: '', role: '', email: '', phone: '' });
    fetchDashboardData();
  };

  const deleteStaff = async (id) => {
    if (!window.confirm('Remove this staff member?')) return;
    const { error } = await supabase.from('staff').delete().eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }
    fetchDashboardData();
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); navigate('/login'); };

  const statusBadge = (status) => {
    const map = {
      confirmed: 'badge badge-success', cancelled: 'badge badge-danger',
      pending: 'badge badge-warning', completed: 'badge badge-neutral',
      vacant: 'badge badge-success', occupied: 'badge badge-warning',
      maintenance: 'badge badge-danger',
      open: 'badge badge-danger', in_progress: 'badge badge-warning',
      resolved: 'badge badge-success',
    };
    return <span className={map[status] || 'badge badge-neutral'}>{status?.replace('_', ' ')}</span>;
  };

  const tabTitle = {
    overview: 'Overview', rooms: 'Room Management',
    guests: 'Guests', payments: 'Payments',
    staff: 'Staff Management', reviews: 'Customer Reviews',
    complaints: 'Complaints',
  };

  // ── Guards ────────────────────────────────────────────────────
  if (authState === 'loading') return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-subtle)' }}>
      <p style={{ color: 'var(--text-muted)' }}>Verifying admin access…</p>
    </div>
  );

  if (authState === 'denied') return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-subtle)', flexDirection: 'column', gap: '1.5rem' }}>
      <ShieldAlert size={64} color="var(--danger)" />
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--text-main)' }}>Access Denied</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '400px', textAlign: 'center' }}>You do not have administrator privileges.</p>
      <button className="btn btn-primary" onClick={() => navigate('/login')}>Go to Login</button>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-subtle)', paddingTop: 'var(--nav-height)' }}>

      {/* ── Mobile Sidebar Toggle ────────────────────────── */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem',
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'var(--primary-color)', color: '#fff',
          display: 'none', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-lg)', zIndex: 3000, border: 'none', cursor: 'pointer'
        }}
        className="mobile-sidebar-toggle"
      >
        {isSidebarOpen ? <X size={24} /> : <LayoutDashboard size={24} />}
      </button>

      {/* ── Sidebar Overlay ────────────────────────── */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2900 }}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside 
        className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}
        style={{ width: '240px', background: '#ffffff', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 'var(--nav-height)', height: 'calc(100vh - var(--nav-height))', zIndex: 2950 }}
      >
        <div style={{ padding: '1.5rem 1rem 1rem', borderBottom: '1px solid var(--glass-border)' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: 'var(--text-main)', margin: 0 }}>TOP<span style={{ color: 'var(--accent-color)' }}>AVENUE</span></p>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.2rem 0 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin Console</p>
        </div>
        <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
          <SidebarItem icon={LayoutDashboard}       label="Overview"    id="overview"    active={activeTab==='overview'}    onClick={(id) => { setActiveTab(id); setIsSidebarOpen(false); }} />
          <SidebarItem icon={BedDouble}             label="Rooms"       id="rooms"       active={activeTab==='rooms'}       onClick={(id) => { setActiveTab(id); setIsSidebarOpen(false); }} />
          <SidebarItem icon={Users}                 label="Guests"      id="guests"      active={activeTab==='guests'}      onClick={(id) => { setActiveTab(id); setIsSidebarOpen(false); }} />
          <SidebarItem icon={CreditCard}            label="Payments"    id="payments"    active={activeTab==='payments'}    onClick={(id) => { setActiveTab(id); setIsSidebarOpen(false); }} />
          <SidebarItem icon={Star}                  label="Reviews"     id="reviews"     active={activeTab==='reviews'}     onClick={(id) => { setActiveTab(id); setIsSidebarOpen(false); }} />
          <SidebarItem icon={MessageSquareWarning}  label="Complaints"  id="complaints"  active={activeTab==='complaints'}  onClick={(id) => { setActiveTab(id); setIsSidebarOpen(false); }} />
          <SidebarItem icon={UserCog}               label="Staff"       id="staff"       active={activeTab==='staff'}       onClick={(id) => { setActiveTab(id); setIsSidebarOpen(false); }} />
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

        {/* Page header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--text-main)', margin: 0 }}>
              {tabTitle[activeTab] || 'Dashboard'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
              TopAvenue Admin · {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing || dataLoading}
            style={{
              background: 'none', border: '1px solid var(--glass-border)',
              borderRadius: '6px', padding: '0.5rem 0.75rem', cursor: refreshing ? 'wait' : 'pointer',
              color: refreshing ? 'var(--accent-color)' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem',
              transition: 'all 0.2s',
            }}
          >
            <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {/* ════ OVERVIEW ════ */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              <StatCard label="Total Revenue"    value={`$${stats.revenue.toLocaleString()}`} sub="All bookings"    accent="#059669" />
              <StatCard label="Occupancy Rate"   value={`${stats.occupancy}%`}                sub="Rooms occupied"  accent="#2563eb" />
              <StatCard label="Active Bookings"  value={stats.activeBookings}                  sub="Confirmed"       accent="#d97706" />
              <StatCard label="Total Guests"     value={stats.totalGuests}                     sub="Unique guests"   accent="var(--accent-color)" />
              <StatCard label="Open Complaints"  value={stats.openComplaints ?? 0}             sub="Needs attention" accent="#dc2626" />
            </div>

            {/* Recent Bookings */}
            <div style={{ background: '#fff', border: '1px solid var(--glass-border)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Recent Bookings</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{bookings.length} total</span>
              </div>
              {dataLoading ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>Loading…</p>
              ) : bookings.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>No bookings yet.</p>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead><tr><th>Guest</th><th>Room</th><th>Check In</th><th>Check Out</th><th>Amount</th><th>Status</th></tr></thead>
                    <tbody>
                      {paginate(bookings, 'bookings').map(b => (
                        <tr key={b.id}>
                          <td data-label="Guest"><div style={{ fontWeight: 600 }}>{b.guest_name || '—'}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.guest_email}</div></td>
                          <td data-label="Room" style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{b.room_name || (b.room_id ? `Room #${b.room_id}` : '—')}</td>
                          <td data-label="Check In" style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{b.check_in}</td>
                          <td data-label="Check Out" style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{b.check_out}</td>
                          <td data-label="Amount" style={{ fontWeight: 700, color: 'var(--accent-dark)' }}>${b.total_price}</td>
                          <td data-label="Status">{statusBadge(b.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <PageControls tab="bookings" total={bookings.length} />
            </div>

            {/* Latest Reviews preview */}
            {reviews.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid var(--glass-border)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Latest Reviews</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead><tr><th>Guest</th><th>Room</th><th>Rating</th><th>Comment</th><th>Date</th></tr></thead>
                    <tbody>
                      {reviews.slice(0, 5).map(r => (
                        <tr key={r.id}>
                          <td style={{ fontWeight: 600 }}>{r.guest_name || '—'}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{r.room_id ? `Room #${r.room_id}` : '—'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '2px' }}>
                              {[1,2,3,4,5].map(n => <Star key={n} size={13} fill={n <= r.rating ? 'var(--accent-color)' : 'none'} color={n <= r.rating ? 'var(--accent-color)' : '#d1d5db'} />)}
                            </div>
                          </td>
                          <td style={{ maxWidth: '220px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px', display: 'block' }}>{r.comment}</span>
                              <button onClick={() => setSelectedReview(r)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-dark)', flexShrink: 0, padding: '0.2rem' }} title="View full review"><Eye size={14} /></button>
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Open Complaints preview */}
            {complaints.filter(c => c.status === 'open').length > 0 && (
              <div style={{ background: '#fff', border: '1px solid var(--glass-border)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={16} color="#dc2626" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#dc2626' }}>Open Complaints</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead><tr><th>Guest</th><th>Subject</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>
                      {complaints.filter(c => c.status === 'open').slice(0, 5).map(c => (
                        <tr key={c.id}>
                          <td style={{ fontWeight: 600 }}>{c.guest_name || '—'}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{c.subject}</td>
                          <td>{statusBadge(c.status)}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
                    <thead>
                      <tr>
                        <th>Name / Category</th>
                        <th>Description</th>
                        <th>Price/Night</th>
                        <th>Capacity</th>
                        <th style={{ textAlign: 'center' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Hash size={12} /> Qty
                          </span>
                        </th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rooms.map(r => (
                        <tr key={r.id}>
                          <td style={{ fontWeight: 600 }}>{r.name}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</td>
                          <td style={{ fontWeight: 700, color: 'var(--accent-dark)' }}>${r.price}</td>
                          <td style={{ color: 'var(--text-muted)' }}>{r.capacity} guests</td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(201,168,76,0.12)', color: 'var(--accent-dark)', fontWeight: 700, fontSize: '0.85rem', borderRadius: '6px', padding: '0.2rem 0.65rem', minWidth: '32px' }}>
                              {r.quantity ?? 1}
                            </span>
                          </td>
                          <td>{statusBadge(r.status)}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button onClick={() => openEditRoom(r)} style={{ background: 'none', border: '1px solid var(--accent-color)', cursor: 'pointer', color: 'var(--accent-dark)', padding: '0.3rem 0.65rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 600 }}>
                                <Pencil size={13} /> Modify
                              </button>
                              <button onClick={() => deleteRoom(r.id)} style={{ background: 'none', border: '1px solid rgba(220,38,38,0.4)', cursor: 'pointer', color: '#f87171', padding: '0.3rem 0.5rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center' }} title="Delete room">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Rooms summary card */}
            {rooms.length > 0 && (
              <div style={{ marginTop: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                {[
                  { label: 'Total Categories', value: rooms.length, accent: '#2563eb' },
                  { label: 'Total Physical Rooms', value: rooms.reduce((s, r) => s + (r.quantity ?? 1), 0), accent: 'var(--accent-color)' },
                  { label: 'Currently Occupied', value: rooms.filter(r => r.status === 'occupied').length, accent: '#d97706' },
                  { label: 'Available', value: rooms.filter(r => r.status === 'vacant').reduce((s, r) => s + (r.quantity ?? 1), 0), accent: '#059669' },
                ].map((s, i) => (
                  <div key={i} style={{ background: '#fff', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '1.1rem', borderLeft: `3px solid ${s.accent}`, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>{s.label}</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{s.value}</p>
                  </div>
                ))}
              </div>
            )}
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
                    <thead><tr><th>Name</th><th>Email</th><th>Room No.</th><th>People</th><th>Total Spent</th><th>Last Stay</th></tr></thead>
                    <tbody>
                      {paginate(guests, 'guests').map(g => (
                        <tr key={g.id}>
                          <td style={{ fontWeight: 600 }}>{g.name}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{g.email}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{g.roomNo || '—'}</td>
                          <td><span className="badge badge-info">{g.totalPeople} guest{g.totalPeople !== 1 ? 's' : ''}</span></td>
                          <td style={{ fontWeight: 700, color: 'var(--accent-dark)' }}>${g.totalSpent.toLocaleString()}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{g.lastStay}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <PageControls tab="guests" total={guests.length} />
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
              {paginate(bookings, 'payments').map(b => (
              <tr key={b.id}>
              <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{new Date(b.created_at).toLocaleDateString()}</td>
              <td style={{ fontWeight: 600 }}>{b.guest_name || '—'}</td>
              <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{b.room_name || (b.room_id ? `Room #${b.room_id}` : '—')}</td>
              <td style={{ fontWeight: 700, color: 'var(--accent-dark)' }}>${b.total_price}</td>
              <td>{statusBadge(b.status)}</td>
              </tr>
              ))}
              </tbody>
              </table>
              {bookings.length === 0 && <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No payment records yet.</p>}
                  <PageControls tab="payments" total={bookings.length} />
              </div>
            </div>
          </div>
        )}

        {/* ════ REVIEWS ════ */}
        {activeTab === 'reviews' && (
          <div className="animate-fade-in">
            <div style={{ background: '#fff', border: '1px solid var(--glass-border)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>All Customer Reviews</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{reviews.length} total</span>
              </div>
              {dataLoading ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>Loading…</p>
              ) : reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                  <Star size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                  <p>No reviews yet.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead><tr><th>Guest</th><th>Room</th><th>Rating</th><th>Comment</th><th>Date</th></tr></thead>
                    <tbody>
                      {paginate(reviews, 'reviews').map(r => (
                        <tr key={r.id}>
                          <td style={{ fontWeight: 600 }}>{r.guest_name || '—'}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{r.room_id ? `Room #${r.room_id}` : '—'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                              {[1,2,3,4,5].map(n => <Star key={n} size={13} fill={n <= r.rating ? 'var(--accent-color)' : 'none'} color={n <= r.rating ? 'var(--accent-color)' : '#d1d5db'} />)}
                              <span style={{ marginLeft: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.rating}/5</span>
                            </div>
                          </td>
                          <td style={{ maxWidth: '260px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '190px', display: 'block' }}>{r.comment}</span>
                              <button onClick={() => setSelectedReview(r)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-dark)', flexShrink: 0, padding: '0.2rem' }} title="View full review"><Eye size={14} /></button>
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <PageControls tab="reviews" total={reviews.length} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════ COMPLAINTS ════ */}
        {activeTab === 'complaints' && (
          <div className="animate-fade-in">
            <div style={{ background: '#fff', border: '1px solid var(--glass-border)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>All Complaints</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{complaints.length} total · {complaints.filter(c => c.status === 'open').length} open</span>
              </div>
              {dataLoading ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>Loading…</p>
              ) : complaints.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                  <MessageSquareWarning size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                  <p>No complaints registered yet.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead><tr><th>Guest</th><th>Email</th><th>Subject</th><th>Description</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
                    <tbody>
                      {paginate(complaints, 'complaints').map(c => (
                        <tr key={c.id}>
                          <td style={{ fontWeight: 600 }}>{c.guest_name || '—'}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{c.guest_email || '—'}</td>
                          <td style={{ fontWeight: 600, fontSize: '0.88rem' }}>{c.subject}</td>
                          <td style={{ maxWidth: '220px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px', display: 'block' }}>{c.description}</span>
                              <button onClick={() => setSelectedComplaint(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-dark)', flexShrink: 0, padding: '0.2rem' }} title="View full complaint"><Eye size={14} /></button>
                            </div>
                          </td>
                          <td>{statusBadge(c.status)}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                          <td>
                            <select
                              value={c.status}
                              onChange={e => updateComplaintStatus(c.id, e.target.value)}
                              style={{ ...fi, padding: '0.35rem 0.6rem', fontSize: '0.78rem', width: 'auto' }}
                            >
                              <option value="open">Open</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <PageControls tab="complaints" total={complaints.length} />
                </div>
              )}
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
        <Modal title="Add New Room Category" onClose={() => setShowAddRoom(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div><label style={lbl}>Room Category Name *</label><input style={fi} value={roomForm.name} onChange={e => setRoomForm({...roomForm, name: e.target.value})} placeholder="e.g. Deluxe King Suite" /></div>
            <div><label style={lbl}>Description</label><textarea style={{...fi, resize: 'vertical', minHeight: '80px'}} value={roomForm.description} onChange={e => setRoomForm({...roomForm, description: e.target.value})} placeholder="Room features and amenities…" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div><label style={lbl}>Price per Night ($) *</label><input style={fi} type="number" min="0" value={roomForm.price} onChange={e => setRoomForm({...roomForm, price: e.target.value})} placeholder="299" /></div>
              <div><label style={lbl}>Capacity (Guests)</label><input style={fi} type="number" min="1" max="20" value={roomForm.capacity} onChange={e => setRoomForm({...roomForm, capacity: e.target.value})} /></div>
              <div>
                <label style={lbl}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Hash size={11} /> Quantity (Rooms)</span>
                </label>
                <input style={fi} type="number" min="1" max="500" value={roomForm.quantity} onChange={e => setRoomForm({...roomForm, quantity: e.target.value})} placeholder="1" />
              </div>
            </div>
            <div><label style={lbl}>Status</label>
              <select style={fi} value={roomForm.status} onChange={e => setRoomForm({...roomForm, status: e.target.value})}>
                <option value="vacant">Vacant</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, background: 'var(--bg-subtle)', borderRadius: '6px', padding: '0.6rem 0.85rem' }}>
              💡 <strong>Quantity</strong> = how many physical rooms of this category exist (e.g. 5 Deluxe King Suites).
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.25rem' }}>
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

      {/* ══ VIEW REVIEW MODAL ══ */}
      {selectedReview && (
        <Modal title="Review Details" onClose={() => setSelectedReview(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><label style={lbl}>Guest</label><p style={{ color: 'var(--text-main)', fontWeight: 600, margin: 0 }}>{selectedReview.guest_name || '—'}</p></div>
              <div><label style={lbl}>Room</label><p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.88rem' }}>{selectedReview.room_id ? `Room #${selectedReview.room_id}` : '—'}</p></div>
              <div>
                <label style={lbl}>Rating</label>
                <div style={{ display: 'flex', gap: '3px', alignItems: 'center', marginTop: '0.2rem' }}>
                  {[1,2,3,4,5].map(n => <Star key={n} size={18} fill={n <= selectedReview.rating ? 'var(--accent-color)' : 'none'} color={n <= selectedReview.rating ? 'var(--accent-color)' : '#d1d5db'} />)}
                  <span style={{ marginLeft: '0.4rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>{selectedReview.rating}/5</span>
                </div>
              </div>
              <div><label style={lbl}>Date</label><p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.88rem' }}>{new Date(selectedReview.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p></div>
            </div>
            <div>
              <label style={lbl}>Full Review</label>
              <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '1rem', color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: 1.7, minHeight: '80px', whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>"{selectedReview.comment || 'No comment provided.'}"</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setSelectedReview(null)}>Close</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ══ COMPLAINT DETAIL MODAL ══ */}
      {selectedComplaint && (
        <Modal title="Complaint Details" onClose={() => { setSelectedComplaint(null); setReplyText(''); }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><label style={lbl}>Guest</label><p style={{ color: 'var(--text-main)', fontWeight: 600, margin: 0 }}>{selectedComplaint.guest_name || '—'}</p></div>
              <div><label style={lbl}>Email</label><p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.88rem' }}>{selectedComplaint.guest_email || '—'}</p></div>
              <div><label style={lbl}>Subject</label><p style={{ color: 'var(--text-main)', fontWeight: 600, margin: 0 }}>{selectedComplaint.subject || '—'}</p></div>
              <div><label style={lbl}>Date</label><p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.88rem' }}>{new Date(selectedComplaint.created_at).toLocaleDateString()}</p></div>
            </div>
            <div>
              <label style={lbl}>Status</label>
              <div style={{ marginBottom: '0.25rem' }}>{statusBadge(selectedComplaint.status)}</div>
            </div>
            <div>
              <label style={lbl}>Full Description</label>
              <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '1rem', color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: 1.6, minHeight: '80px', whiteSpace: 'pre-wrap' }}>{selectedComplaint.description || 'No description provided.'}</div>
            </div>

            {/* Previous admin reply (if any) */}
            {selectedComplaint.admin_reply && (
              <div style={{ background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '8px', padding: '1rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#2563eb', marginBottom: '0.4rem' }}>Your Previous Reply</p>
                <p style={{ color: '#1e40af', fontSize: '0.9rem', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{selectedComplaint.admin_reply}</p>
                {selectedComplaint.admin_replied_at && (
                  <p style={{ fontSize: '0.72rem', color: '#93c5fd', marginTop: '0.4rem', textAlign: 'right' }}>
                    Sent {new Date(selectedComplaint.admin_replied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>
            )}

            {/* Reply box */}
            <div>
              <label style={lbl}>{selectedComplaint.admin_reply ? 'Update Reply' : 'Write a Reply'}</label>
              <textarea
                style={{ ...fi, resize: 'vertical', minHeight: '90px' }}
                placeholder="Type your response to the guest… They will see this in their dashboard."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ ...lbl, marginBottom: 0 }}>Update Status:</label>
                <select
                  value={selectedComplaint.status}
                  onChange={async e => {
                    const s = e.target.value;
                    await updateComplaintStatus(selectedComplaint.id, s);
                    setSelectedComplaint({ ...selectedComplaint, status: s });
                  }}
                  style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem', border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: '6px', fontFamily: 'var(--font-body)', outline: 'none' }}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button className="btn btn-ghost" onClick={() => { setSelectedComplaint(null); setReplyText(''); }}>Close</button>
                <button
                  className="btn btn-primary"
                  onClick={() => submitAdminReply(selectedComplaint.id)}
                  disabled={replySaving || !replyText.trim()}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Save size={14} />{replySaving ? 'Sending…' : 'Send Reply'}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ══ EDIT ROOM MODAL ══ */}
      {showEditRoom && (
        <Modal title="Modify Room Category" onClose={() => setShowEditRoom(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div><label style={lbl}>Room Category Name *</label><input style={fi} value={editRoomForm.name} onChange={e => setEditRoomForm({...editRoomForm, name: e.target.value})} placeholder="e.g. Deluxe King Suite" /></div>
            <div><label style={lbl}>Description</label><textarea style={{...fi, resize: 'vertical', minHeight: '80px'}} value={editRoomForm.description} onChange={e => setEditRoomForm({...editRoomForm, description: e.target.value})} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div><label style={lbl}>Price per Night ($) *</label><input style={fi} type="number" min="0" value={editRoomForm.price} onChange={e => setEditRoomForm({...editRoomForm, price: e.target.value})} /></div>
              <div><label style={lbl}>Capacity (Guests)</label><input style={fi} type="number" min="1" max="20" value={editRoomForm.capacity} onChange={e => setEditRoomForm({...editRoomForm, capacity: e.target.value})} /></div>
              <div>
                <label style={lbl}><span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Hash size={11} /> Quantity</span></label>
                <input style={fi} type="number" min="1" max="500" value={editRoomForm.quantity} onChange={e => setEditRoomForm({...editRoomForm, quantity: e.target.value})} />
              </div>
            </div>
            <div><label style={lbl}>Status</label>
              <select style={fi} value={editRoomForm.status} onChange={e => setEditRoomForm({...editRoomForm, status: e.target.value})}>
                <option value="vacant">Vacant</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button className="btn btn-ghost" onClick={() => setShowEditRoom(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={updateRoom} disabled={editRoomSaving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Save size={15} />{editRoomSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Refresh spin animation */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
