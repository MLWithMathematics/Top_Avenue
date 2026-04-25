import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, BedDouble, CheckCircle, CreditCard, ChevronRight } from 'lucide-react';
import { supabase } from '../supabaseClient';

const inputStyle = {
  width: '100%', padding: '0.85rem 1rem',
  background: '#fff', border: '1.5px solid rgba(0,0,0,0.12)',
  color: '#1a1a2e', borderRadius: '6px',
  fontFamily: 'var(--font-body)', fontSize: '0.95rem', outline: 'none',
};
const labelStyle = {
  display: 'block', marginBottom: '0.4rem',
  fontSize: '0.75rem', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.06em',
  color: 'var(--text-muted)',
};

const BookingFlow = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const [bookingDetails, setBookingDetails] = useState({
    checkIn: '', checkOut: '', guests: 1,
    roomId: null, roomName: '', roomPrice: 0,
    addons: [], guestName: '', guestEmail: '',
  });
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  React.useEffect(() => {
    supabase.from('rooms').select('*').eq('status', 'vacant').then(({ data, error }) => {
      if (!error && data) setRooms(data);
      setLoadingRooms(false);
    });
  }, []);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const selectRoom = (room) => {
    setBookingDetails({ ...bookingDetails, roomId: room.id, roomName: room.name, roomPrice: room.price });
    nextStep();
  };

  const toggleAddon = (addon) => {
    const exists = bookingDetails.addons.find(a => a.id === addon.id);
    setBookingDetails({
      ...bookingDetails,
      addons: exists
        ? bookingDetails.addons.filter(a => a.id !== addon.id)
        : [...bookingDetails.addons, addon],
    });
  };

  const availableAddons = [
    { id: 'a1', name: 'Airport Transfer', price: 50 },
    { id: 'a2', name: 'Breakfast Buffet', price: 30 },
    { id: 'a3', name: 'Spa Access', price: 100 },
  ];

  const totalCost = bookingDetails.roomPrice + bookingDetails.addons.reduce((s, a) => s + a.price, 0);

  const handleComplete = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      alert('Please log in to complete your booking.');
      navigate('/login');
      return;
    }

    // Auto-populate guest name/email from Supabase session if not filled
    const guestName = bookingDetails.guestName || session.user.user_metadata?.full_name || '';
    const guestEmail = bookingDetails.guestEmail || session.user.email || '';

    const { error } = await supabase.from('bookings').insert([{
      user_id: session.user.id,
      room_id: bookingDetails.roomId,
      room_name: bookingDetails.roomName,
      check_in: bookingDetails.checkIn,
      check_out: bookingDetails.checkOut,
      guests: bookingDetails.guests,
      total_price: totalCost,
      guest_name: guestName,
      guest_email: guestEmail,
      status: 'confirmed',
    }]);

    if (error) {
      alert('Error confirming booking: ' + error.message);
    } else {
      alert('Booking confirmed! You can view and review it in your dashboard.');
      navigate('/dashboard');
    }
  };

  const stepMeta = [
    { num: 1, label: 'Dates', icon: Calendar },
    { num: 2, label: 'Room', icon: BedDouble },
    { num: 3, label: 'Add-ons', icon: CheckCircle },
    { num: 4, label: 'Payment', icon: CreditCard },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-subtle)', paddingTop: 'var(--nav-height)' }}>
      <div className="container" style={{ padding: '3rem 1rem', maxWidth: '860px' }}>

        {/* Progress bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '20px', left: 0, right: 0, height: '2px', background: 'var(--glass-border)', zIndex: 0 }} />
          {stepMeta.map(s => (
            <div key={s.num} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: step >= s.num ? 'var(--accent-color)' : '#fff',
                color: step >= s.num ? '#1a1a2e' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `2px solid ${step >= s.num ? 'var(--accent-color)' : 'var(--glass-border)'}`,
                boxShadow: step >= s.num ? '0 2px 12px rgba(201,168,76,0.3)' : 'none',
              }}>
                <s.icon size={18} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: step >= s.num ? 'var(--accent-dark)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', borderRadius: '16px', padding: '2.5rem', boxShadow: '0 4px 30px rgba(0,0,0,0.08)', border: '1px solid var(--glass-border)' }}>

          {/* ── STEP 1: DATES ── */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Choose Your Dates</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>Select check-in and check-out dates to see available rooms.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={labelStyle}>Check In</label>
                  <input type="date" style={inputStyle} value={bookingDetails.checkIn} onChange={e => setBookingDetails({...bookingDetails, checkIn: e.target.value})} />
                </div>
                <div>
                  <label style={labelStyle}>Check Out</label>
                  <input type="date" style={inputStyle} value={bookingDetails.checkOut} onChange={e => setBookingDetails({...bookingDetails, checkOut: e.target.value})} />
                </div>
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <label style={labelStyle}>Number of Guests</label>
                <select style={inputStyle} value={bookingDetails.guests} onChange={e => setBookingDetails({...bookingDetails, guests: parseInt(e.target.value)})}>
                  {[1,2,3,4].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>
              <div style={{ textAlign: 'right' }}>
                <button className="btn btn-primary" onClick={nextStep} disabled={!bookingDetails.checkIn || !bookingDetails.checkOut} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  Find Available Rooms <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: ROOM ── */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Select Your Room</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>All rooms include complimentary Wi-Fi and daily housekeeping.</p>
              {loadingRooms ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading available rooms…</p>
              ) : rooms.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No rooms available for the selected dates.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                  {rooms.map(room => (
                    <div key={room.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', border: '1.5px solid var(--glass-border)', borderRadius: '10px', transition: 'border-color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-color)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                    >
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>{room.name}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{room.description}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.3rem' }}>Up to {room.capacity} guests</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '1rem' }}>
                        <p style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-dark)', marginBottom: '0.5rem' }}>${room.price}<span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>/night</span></p>
                        <button className="btn btn-primary" onClick={() => selectRoom(room)} style={{ fontSize: '0.82rem', padding: '0.6rem 1.2rem' }}>Select</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button className="btn btn-ghost" onClick={prevStep}>← Back</button>
            </div>
          )}

          {/* ── STEP 3: ADD-ONS ── */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Enhance Your Stay</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>Optional add-ons to make your visit even more special.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
                {availableAddons.map(addon => {
                  const selected = bookingDetails.addons.find(a => a.id === addon.id);
                  return (
                    <div key={addon.id} onClick={() => toggleAddon(addon)} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '1.25rem 1.5rem', border: `1.5px solid ${selected ? 'var(--accent-color)' : 'var(--glass-border)'}`,
                      borderRadius: '10px', cursor: 'pointer',
                      background: selected ? 'rgba(201,168,76,0.06)' : 'transparent',
                      transition: 'all 0.2s',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: '4px',
                          border: `2px solid ${selected ? 'var(--accent-color)' : '#d1d5db'}`,
                          background: selected ? 'var(--accent-color)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {selected && <CheckCircle size={13} color="#1a1a2e" />}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{addon.name}</span>
                      </div>
                      <span style={{ color: 'var(--accent-dark)', fontWeight: 700 }}>+${addon.price}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button className="btn btn-ghost" onClick={prevStep}>← Back</button>
                <button className="btn btn-primary" onClick={nextStep}>Continue to Payment →</button>
              </div>
            </div>
          )}

          {/* ── STEP 4: PAYMENT ── */}
          {step === 4 && (
            <div className="animate-fade-in">
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Confirm & Pay</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>Review your booking summary and confirm your stay.</p>

              {/* Summary box */}
              <div style={{ background: 'var(--bg-subtle)', borderRadius: '10px', padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--glass-border)' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--accent-dark)', marginBottom: '1rem' }}>Booking Summary</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-main)' }}>{bookingDetails.roomName}</span>
                  <span style={{ fontWeight: 700 }}>${bookingDetails.roomPrice}</span>
                </div>
                {bookingDetails.addons.map(a => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    <span>{a.name}</span><span>+${a.price}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--glass-border)', marginTop: '0.75rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
                  <span>Total</span><span style={{ color: 'var(--accent-dark)' }}>${totalCost}</span>
                </div>
              </div>

              {/* Guest fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input type="text" style={inputStyle} value={bookingDetails.guestName} onChange={e => setBookingDetails({...bookingDetails, guestName: e.target.value})} placeholder="As on your ID" />
                </div>
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input type="email" style={inputStyle} value={bookingDetails.guestEmail} onChange={e => setBookingDetails({...bookingDetails, guestEmail: e.target.value})} placeholder="Confirmation sent here" />
                </div>
              </div>

              {/* Payment placeholder */}
              <div style={{ marginBottom: '2.5rem' }}>
                <label style={labelStyle}>Payment</label>
                <div style={{ padding: '1.25rem', border: '1.5px dashed var(--glass-border)', borderRadius: '8px', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem', fontStyle: 'italic' }}>
                  Stripe / Payment gateway integration pending
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button className="btn btn-ghost" onClick={prevStep}>← Back</button>
                <button className="btn btn-primary" onClick={handleComplete} disabled={!bookingDetails.guestName || !bookingDetails.guestEmail} style={{ fontSize: '0.9rem' }}>
                  Confirm Booking — ${totalCost}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default BookingFlow;
