import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BedDouble, Users, ArrowRight, Star, Wifi, Coffee, Shield, Wind } from 'lucide-react';
import { supabase } from '../supabaseClient';

// ── Per-room amenity tags (visual only) ──────────────────────────
const AMENITY_ICONS = [
  { icon: Wifi,   label: 'Free Wi-Fi' },
  { icon: Coffee, label: 'Breakfast' },
  { icon: Wind,   label: 'Climate Control' },
  { icon: Shield, label: 'Safe & Secure' },
];

// ── Fallback gradient placeholder when no image_url ──────────────
const PLACEHOLDERS = [
  'linear-gradient(135deg, #1a1a2e 0%, #2d2d5e 100%)',
  'linear-gradient(135deg, #2d2d5e 0%, #1a2744 100%)',
  'linear-gradient(135deg, #1a2744 0%, #1a1a2e 100%)',
];

const RoomCard = ({ room, index }) => {
  const bg = room.image_url
    ? `url('${room.image_url}') center/cover no-repeat`
    : PLACEHOLDERS[index % PLACEHOLDERS.length];

  return (
    <div
      className="glass-panel"
      style={{
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Image */}
      <div
        style={{
          height: 260,
          background: bg,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Dark overlay for text readability when there's an image */}
        {room.image_url && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)' }} />
        )}
        {/* Room name watermark shown on placeholder */}
        {!room.image_url && (
          <span style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.3rem',
            color: 'rgba(201,168,76,0.6)', zIndex: 1, textAlign: 'center', padding: '0 1rem',
          }}>
            {room.name}
          </span>
        )}
        {/* Status badge */}
        <span style={{
          position: 'absolute', top: '1rem', left: '1rem',
          background: room.status === 'vacant' ? 'var(--accent-color)' : '#6b7280',
          color: room.status === 'vacant' ? '#1a1a2e' : '#fff',
          fontSize: '0.68rem', fontWeight: 700,
          padding: '0.3rem 0.8rem', borderRadius: 20,
          textTransform: 'uppercase', letterSpacing: '1px', zIndex: 2,
        }}>
          {room.status === 'vacant' ? '✓ Available' : 'Occupied'}
        </span>
        {/* Star decoration */}
        <Star
          size={90}
          style={{
            position: 'absolute', bottom: '-1rem', right: '-1rem',
            color: 'rgba(201,168,76,0.06)', zIndex: 1,
          }}
          fill="rgba(201,168,76,0.06)"
        />
      </div>

      {/* Body */}
      <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.55rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
          {room.name}
        </h3>

        {/* Capacity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
          <Users size={14} />
          <span>Up to {room.capacity || 2} Guest{(room.capacity || 2) > 1 ? 's' : ''}</span>
          <span style={{ margin: '0 0.4rem' }}>·</span>
          <BedDouble size={14} />
          <span>Private Room</span>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.25rem', flex: 1 }}>
          {room.description || 'A beautifully appointed room designed for comfort and elegance, with premium furnishings and stunning views.'}
        </p>

        {/* Mini amenities */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {AMENITY_ICONS.map(({ icon: Icon, label }) => (
            <span key={label} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              background: 'rgba(201,168,76,0.1)', color: 'var(--accent-dark)',
              fontSize: '0.72rem', fontWeight: 600,
              padding: '0.25rem 0.65rem', borderRadius: 20,
            }}>
              <Icon size={11} /> {label}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderTop: '1px solid var(--glass-border)', paddingTop: '1rem',
        }}>
          <div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--accent-dark)', fontWeight: 700 }}>
              ${room.price}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>/night</span>
          </div>
          {room.status === 'vacant' ? (
            <Link
              to="/book"
              className="btn btn-primary"
              style={{ padding: '0.55rem 1.4rem', fontSize: '0.8rem', gap: '0.35rem' }}
            >
              Book Now <ArrowRight size={14} />
            </Link>
          ) : (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Not available</span>
          )}
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | available

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('price', { ascending: true });

      if (!error && data) setRooms(data);
      setLoading(false);
    };
    fetchRooms();
  }, []);

  const displayed = filter === 'available'
    ? rooms.filter(r => r.status === 'vacant')
    : rooms;

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', paddingTop: 'var(--nav-height)' }}>

      {/* ===== HERO BANNER ===== */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d5e 50%, #1a2744 100%)',
        padding: '5rem 2rem 4rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{
            display: 'inline-block', fontSize: '0.72rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '4px', color: 'var(--accent-color)',
            border: '1px solid rgba(201,168,76,0.4)', padding: '0.4rem 1.2rem', borderRadius: 20,
            marginBottom: '1.5rem',
          }}>Accommodations</span>
          <h1 className="responsive-hero-title" style={{
            fontFamily: 'var(--font-heading)', fontSize: '3.5rem',
            color: '#fff', marginBottom: '1rem',
          }}>
            Rooms &amp; <span style={{ color: 'var(--accent-color)' }}>Suites</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 540, margin: '0 auto', fontSize: '1rem', lineHeight: 1.7 }}>
            Every room at TopAvenue is crafted for indulgence — premium bedding, bespoke furnishings, and exceptional views await you.
          </p>
        </div>
      </div>

      {/* ===== FILTER BAR ===== */}
      <div style={{
        background: '#fff', borderBottom: '1px solid var(--glass-border)',
        padding: '1rem 2rem',
        display: 'flex', justifyContent: 'center', gap: '1rem',
      }}>
        {['all', 'available'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.45rem 1.4rem', borderRadius: 20,
              border: filter === f ? '1.5px solid var(--accent-color)' : '1.5px solid var(--glass-border)',
              background: filter === f ? 'rgba(201,168,76,0.1)' : 'transparent',
              color: filter === f ? 'var(--accent-dark)' : 'var(--text-muted)',
              fontSize: '0.82rem', fontWeight: 600,
              textTransform: 'capitalize', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {f === 'all' ? 'All Rooms' : '✓ Available Now'}
          </button>
        ))}
      </div>

      {/* ===== ROOM GRID ===== */}
      <div className="section-padding container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <div style={{
              width: 40, height: 40, border: '3px solid var(--glass-border)',
              borderTopColor: 'var(--accent-color)', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem',
            }} />
            <p>Loading rooms…</p>
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <BedDouble size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p style={{ fontSize: '1.1rem' }}>No rooms found. Please check back soon.</p>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '3px', color: 'var(--accent-color)', marginBottom: '0.75rem' }}>
                {displayed.length} Room{displayed.length !== 1 ? 's' : ''} {filter === 'available' ? 'Available' : 'Total'}
              </p>
              <h2 className="section-title">Our <span>Signature</span> Rooms</h2>
              <div className="gold-divider" />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '2rem',
            }}>
              {displayed.map((room, i) => (
                <RoomCard key={room.id} room={room} index={i} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ===== BOOKING CTA ===== */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d5e 100%)',
        padding: '4rem 2rem', textAlign: 'center',
      }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', color: '#fff', marginBottom: '1rem' }}>
          Ready to <span style={{ color: 'var(--accent-color)' }}>Experience</span> TopAvenue?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '2rem' }}>
          Book direct for the best rates, complimentary breakfast, and guaranteed upgrades.
        </p>
        <Link to="/book" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '0.9rem' }}>
          Reserve Your Suite
        </Link>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Rooms;
