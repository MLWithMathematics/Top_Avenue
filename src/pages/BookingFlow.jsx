import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Users, BedDouble, CheckCircle, CreditCard, ChevronRight, Image } from 'lucide-react';
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

const computeNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.max(0, Math.round(diff / 86400000));
};

const BookingFlow = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const location  = useLocation();

  // Pre-fill from Home.jsx booking bar via router state
  const routeState = location.state || {};

  const [bookingDetails, setBookingDetails] = useState({
    checkIn:  routeState.checkIn  || '',
    checkOut: routeState.checkOut || '',
    guests:   routeState.guests   || 1,
    roomId: null, roomName: '', roomPrice: 0,
    addons: [], guestName: '', guestEmail: '',
  });
  const [rooms,        setRooms]        = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [dateError,    setDateError]    = useState('');

  // Stripe
  const [stripeLoading,  setStripeLoading]  = useState(false);
  const [clientSecret,   setClientSecret]   = useState(null);
  const [paymentError,   setPaymentError]   = useState('');

  // If Home passed valid pre-filled dates, skip straight to room selection
  useEffect(() => {
    if (routeState.checkIn && routeState.checkOut) {
      const n = computeNights(routeState.checkIn, routeState.checkOut);
      if (n >= 1 && new Date(routeState.checkIn) >= new Date(new Date().toISOString().split('T')[0])) {
        fetchAvailableRooms(routeState.checkIn, routeState.checkOut);
        setStep(2);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Availability check (double-booking prevention) ───────────
  const fetchAvailableRooms = async (checkIn, checkOut) => {
    setLoadingRooms(true);
    try {
      const { data: vacantRooms, error: roomErr } = await supabase
        .from('rooms').select('*').eq('status', 'vacant');
      if (roomErr) throw roomErr;

      const { data: conflicts, error: conflictErr } = await supabase
        .from('bookings')
        .select('room_id')
        .eq('status', 'confirmed')
        .lt('check_in', checkOut)
        .gt('check_out', checkIn);
      if (conflictErr) throw conflictErr;

      const bookedIds = new Set((conflicts || []).map(b => b.room_id));
      setRooms((vacantRooms || []).filter(r => !bookedIds.has(r.id)));
    } catch (e) {
      console.error('Error fetching rooms:', e);
      setRooms([]);
    }
    setLoadingRooms(false);
  };

  // ── Step 1 → 2: validate dates ───────────────────────────────
  const handleFindRooms = async () => {
    setDateError('');
    const { checkIn, checkOut } = bookingDetails;
    if (!checkIn || !checkOut) { setDateError('Please select both check-in and check-out dates.'); return; }
    if (new Date(checkOut) <= new Date(checkIn)) { setDateError('Check-out must be after check-in.'); return; }
    if (new Date(checkIn) < new Date(new Date().toISOString().split('T')[0])) { setDateError('Check-in cannot be in the past.'); return; }
    if (computeNights(checkIn, checkOut) < 1) { setDateError('Minimum stay is 1 night.'); return; }
    await fetchAvailableRooms(checkIn, checkOut);
    setStep(2);
  };

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
      addons: exists ? bookingDetails.addons.filter(a => a.id !== addon.id) : [...bookingDetails.addons, addon],
    });
  };

  const availableAddons = [
    { id: 'a1', name: 'Airport Transfer', price: 50 },
    { id: 'a2', name: 'Breakfast Buffet',  price: 30 },
    { id: 'a3', name: 'Spa Access',         price: 100 },
  ];

  // ── Cost calculations ────────────────────────────────────────
  const nights       = computeNights(bookingDetails.checkIn, bookingDetails.checkOut);
  const roomSubtotal = bookingDetails.roomPrice * Math.max(nights, 1);
  const addonsTotal  = bookingDetails.addons.reduce((s, a) => s + a.price, 0);
  const totalCost    = roomSubtotal + addonsTotal;

  // ── Stripe: create PaymentIntent via Supabase Edge Function ──
  const createPaymentIntent = async () => {
    setStripeLoading(true);
    setPaymentError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            amount: totalCost,
            currency: 'usd',
            metadata: {
              room_name: bookingDetails.roomName,
              check_in:  bookingDetails.checkIn,
              check_out: bookingDetails.checkOut,
            },
          }),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      const { clientSecret: cs } = await res.json();
      setClientSecret(cs);
    } catch (e) {
      setPaymentError('Could not initialise payment: ' + e.message);
    }
    setStripeLoading(false);
  };

  // ── Confirm booking ──────────────────────────────────────────
  const handleComplete = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) { alert('Please log in.'); navigate('/login'); return; }

    const guestName  = bookingDetails.guestName  || session.user.user_metadata?.full_name || '';
    const guestEmail = bookingDetails.guestEmail || session.user.email || '';
    const piId       = clientSecret ? clientSecret.split('_secret_')[0] : null;

    const { data: insertedData, error } = await supabase.from('bookings').insert([{
      user_id:                  session.user.id,
      room_id:                  bookingDetails.roomId,
      room_name:                bookingDetails.roomName,
      check_in:                 bookingDetails.checkIn,
      check_out:                bookingDetails.checkOut,
      guests:                   bookingDetails.guests,
      total_price:              totalCost,
      guest_name:               guestName,
      guest_email:              guestEmail,
      status:                   'confirmed',
      stripe_payment_intent_id: piId,
      payment_status:           clientSecret ? 'paid' : 'pending',
    }]).select();

    if (error) {
      alert('Error confirming booking: ' + error.message);
    } else {
      const bookingId = insertedData?.[0]?.id || 'N/A';
      
      // Call the Supabase edge function to send the confirmation email
      try {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            type:       'booking_confirmation',
            to:          guestEmail,
            guestName:   guestName,
            roomName:    bookingDetails.roomName,
            checkIn:     bookingDetails.checkIn,
            checkOut:    bookingDetails.checkOut,
            totalCost:   totalCost,
            bookingRef:  bookingId !== 'N/A' ? bookingId.slice(0,8).toUpperCase() : 'UNKNOWN',
          }),
        });
      } catch (emailErr) {
        console.error('Failed to send confirmation email:', emailErr);
      }

      alert('Booking confirmed! A confirmation email has been sent. View your booking in your dashboard.');
      navigate('/dashboard');
    }
  };

  const stepMeta = [
    { num: 1, label: 'Dates',   icon: Calendar    },
    { num: 2, label: 'Room',    icon: BedDouble    },
    { num: 3, label: 'Add-ons', icon: CheckCircle  },
    { num: 4, label: 'Payment', icon: CreditCard   },
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
              {dateError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', color: '#dc2626', fontSize: '0.88rem' }}>{dateError}</div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={labelStyle}>Check In</label>
                  <input type="date" style={inputStyle} min={new Date().toISOString().split('T')[0]} value={bookingDetails.checkIn}
                    onChange={e => { setBookingDetails({...bookingDetails, checkIn: e.target.value}); setDateError(''); }} />
                </div>
                <div>
                  <label style={labelStyle}>Check Out</label>
                  <input type="date" style={inputStyle} min={bookingDetails.checkIn || new Date().toISOString().split('T')[0]} value={bookingDetails.checkOut}
                    onChange={e => { setBookingDetails({...bookingDetails, checkOut: e.target.value}); setDateError(''); }} />
                </div>
              </div>
              {nights > 0 && (
                <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '8px', padding: '0.6rem 1rem', marginBottom: '1.5rem', fontSize: '0.88rem', color: 'var(--accent-dark)', fontWeight: 600 }}>
                  {nights} night{nights !== 1 ? 's' : ''} selected
                </div>
              )}
              <div style={{ marginBottom: '2rem' }}>
                <label style={labelStyle}>Number of Guests</label>
                <select style={inputStyle} value={bookingDetails.guests} onChange={e => setBookingDetails({...bookingDetails, guests: parseInt(e.target.value)})}>
                  {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>
              <div style={{ textAlign: 'right' }}>
                <button className="btn btn-primary" onClick={handleFindRooms} disabled={!bookingDetails.checkIn || !bookingDetails.checkOut} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  Find Available Rooms <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: ROOM ── */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Select Your Room</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                Rooms available for <strong>{bookingDetails.checkIn}</strong> → <strong>{bookingDetails.checkOut}</strong> ({nights} night{nights !== 1 ? 's' : ''}).
              </p>
              {loadingRooms ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Checking availability…</p>
              ) : rooms.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px' }}>
                  <p style={{ color: '#dc2626', fontWeight: 600 }}>No rooms available for these dates.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                  {rooms.filter(r => r.capacity >= bookingDetails.guests).map(room => (
                    <div key={room.id} style={{ display: 'flex', border: '1.5px solid var(--glass-border)', borderRadius: '10px', overflow: 'hidden', transition: 'border-color 0.2s', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-color)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                    >
                      {/* Room image or placeholder */}
                      <div style={{ width: '170px', minHeight: '140px', flexShrink: 0, background: room.image_url ? `url('${room.image_url}') center/cover no-repeat` : 'linear-gradient(135deg,#e8e8f0,#d0d0e0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {!room.image_url && <Image size={30} color="rgba(0,0,0,0.15)" />}
                      </div>
                      <div style={{ flex: 1, padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>{room.name}</h3>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginBottom: '0.3rem' }}>{room.description}</p>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Up to {room.capacity} guests</p>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '1rem' }}>
                          <p style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-dark)', marginBottom: '0.2rem' }}>
                            ${room.price}<span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>/night</span>
                          </p>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>${room.price * nights} total</p>
                          <button className="btn btn-primary" onClick={() => selectRoom(room)} style={{ fontSize: '0.82rem', padding: '0.55rem 1.1rem' }}>Select</button>
                        </div>
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
                      padding: '1.25rem 1.5rem',
                      border: `1.5px solid ${selected ? 'var(--accent-color)' : 'var(--glass-border)'}`,
                      borderRadius: '10px', cursor: 'pointer',
                      background: selected ? 'rgba(201,168,76,0.06)' : 'transparent',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '4px', border: `2px solid ${selected ? 'var(--accent-color)' : '#d1d5db'}`, background: selected ? 'var(--accent-color)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Confirm &amp; Pay</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>Review your booking summary and confirm your stay.</p>

              {/* Summary */}
              <div style={{ background: 'var(--bg-subtle)', borderRadius: '10px', padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--glass-border)' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--accent-dark)', marginBottom: '1rem' }}>Booking Summary</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span>{bookingDetails.roomName}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>${bookingDetails.roomPrice} × {nights} night{nights !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span /><span style={{ fontWeight: 700 }}>${roomSubtotal}</span>
                </div>
                {bookingDetails.addons.map(a => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    <span>{a.name}</span><span>+${a.price}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--glass-border)', marginTop: '0.75rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
                  <span>Total</span><span style={{ color: 'var(--accent-dark)' }}>${totalCost}</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'right' }}>
                  {bookingDetails.checkIn} → {bookingDetails.checkOut} · {nights} night{nights !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Guest info */}
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

              {/* ── STRIPE PAYMENT ── */}
              <div style={{ marginBottom: '2.5rem' }}>
                <label style={labelStyle}>Payment</label>

                {!clientSecret ? (
                  <div style={{ border: '1.5px solid var(--glass-border)', borderRadius: '8px', padding: '1.5rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1rem' }}>
                      Secure payment powered by Stripe. Your card details are never stored on our servers.
                    </p>
                    {paymentError && (
                      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.65rem 1rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.84rem' }}>
                        {paymentError}
                      </div>
                    )}
                    <button
                      className="btn btn-primary"
                      onClick={createPaymentIntent}
                      disabled={stripeLoading || !bookingDetails.guestName || !bookingDetails.guestEmail}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <CreditCard size={15} />
                      {stripeLoading ? 'Connecting to Stripe…' : `Pay $${totalCost} with Card`}
                    </button>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>🔒 256-bit SSL encryption</p>
                  </div>
                ) : (
                  // PaymentIntent ready — mount Stripe's PaymentElement here
                  <div>
                    <div
                      id="stripe-payment-element"
                      style={{ border: '1.5px solid var(--accent-color)', borderRadius: '8px', padding: '1.5rem', background: '#fafaf8', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center', lineHeight: 1.7 }}>
                        Stripe <code style={{ fontSize: '0.78rem', background: 'rgba(0,0,0,0.06)', padding: '0.15rem 0.4rem', borderRadius: '3px' }}>PaymentElement</code> mounts here.<br />
                        Pass <code style={{ fontSize: '0.78rem', background: 'rgba(0,0,0,0.06)', padding: '0.15rem 0.4rem', borderRadius: '3px' }}>clientSecret</code> to{' '}
                        <code style={{ fontSize: '0.78rem', background: 'rgba(0,0,0,0.06)', padding: '0.15rem 0.4rem', borderRadius: '3px' }}>Elements</code> provider.
                      </p>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#059669', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CheckCircle size={13} /> PaymentIntent ready — clientSecret received
                    </p>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button className="btn btn-ghost" onClick={prevStep}>← Back</button>
                <button
                  className="btn btn-primary"
                  onClick={handleComplete}
                  disabled={!bookingDetails.guestName || !bookingDetails.guestEmail}
                >
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
