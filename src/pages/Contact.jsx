import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, MessageSquare, Headphones, Building2 } from 'lucide-react';

// ────────────────────────────────────────────────────────────────
// DUMMY CONTACT DATA — edit these objects to update details
// ────────────────────────────────────────────────────────────────
const CONTACT_DETAILS = [
  {
    icon: MapPin,
    title: 'Our Address',
    lines: ['TopAvenue Hotels', 'Mall Road, Shimla Hills', 'Himachal Pradesh – 171001, India'],
    accent: '#c9a84c',
  },
  {
    icon: Phone,
    title: 'Call Us',
    lines: ['Front Desk: +91 98765 43210', 'Reservations: +91 98765 43211', 'Concierge: +91 98765 43212'],
    accent: '#2d2d5e',
  },
  {
    icon: Mail,
    title: 'Email Us',
    lines: ['reservations@topavenue.com', 'events@topavenue.com', 'feedback@topavenue.com'],
    accent: '#a07828',
  },
  {
    icon: Clock,
    title: 'Hours',
    lines: ['Front Desk: 24 / 7', 'Reservations: 8:00 AM – 10:00 PM', 'Concierge: 7:00 AM – 11:00 PM'],
    accent: '#1a2744',
  },
];

const DEPARTMENTS = [
  { icon: Building2,   label: 'Reservations',       desc: 'Room bookings, modifications & cancellations' },
  { icon: MessageSquare, label: 'Guest Relations',  desc: 'Feedback, complaints & special requests' },
  { icon: Headphones,  label: 'Concierge',           desc: 'Local experiences, transport & arrangements' },
  { icon: Mail,        label: 'Events & Banquets',   desc: 'Weddings, corporate events & private dining' },
];

// ════════════════════════════════════════════════════════════════
const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'Reservations', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    // Simulate sending — replace with real API call if needed
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
    }, 1200);
  };

  const inputStyle = {
    width: '100%', padding: '0.85rem 1rem',
    border: '1.5px solid var(--input-border)', borderRadius: 'var(--radius-sm)',
    background: 'var(--input-bg)', color: 'var(--input-text)',
    fontFamily: 'var(--font-body)', fontSize: '0.95rem', outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', paddingTop: 'var(--nav-height)' }}>

      {/* ===== HERO BANNER ===== */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d5e 50%, #1a2744 100%)',
        padding: '5rem 2rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
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
          }}>We're Here to Help</span>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '3.5rem', color: '#fff', marginBottom: '1rem' }}>
            Get in <span style={{ color: 'var(--accent-color)' }}>Touch</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 520, margin: '0 auto', fontSize: '1rem', lineHeight: 1.7 }}>
            Whether you're planning a stay, organising an event, or simply have a question — our team is ready to assist you.
          </p>
        </div>
      </div>

      {/* ===== CONTACT DETAILS CARDS ===== */}
      <section style={{ background: 'var(--bg-section)', padding: '4rem 2rem' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '1.5rem',
          }}>
            {CONTACT_DETAILS.map(({ icon: Icon, title, lines, accent }) => (
              <div key={title} className="glass-panel" style={{
                padding: '1.75rem',
                borderTop: `4px solid ${accent}`,
                borderRadius: 'var(--radius-md)',
                transition: 'box-shadow 0.3s',
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: `${accent}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1rem',
                }}>
                  <Icon size={22} color={accent} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                  {title}
                </h3>
                {lines.map(line => (
                  <p key={line} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{line}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DEPARTMENTS + CONTACT FORM ===== */}
      <section className="section-padding">
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '4rem', alignItems: 'start' }}>

          {/* Left — Departments */}
          <div>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '3px', color: 'var(--accent-color)', marginBottom: '0.75rem' }}>
              Departments
            </p>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
              How Can We <span style={{ color: 'var(--accent-color)' }}>Help?</span>
            </h2>
            <div className="gold-divider left" style={{ marginBottom: '2rem' }} />
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '0.92rem', marginBottom: '2rem' }}>
              Our specialised teams are available to assist with every aspect of your visit. Select the right department for the fastest response.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {DEPARTMENTS.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="glass-panel" style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  borderRadius: 'var(--radius-md)',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'rgba(201,168,76,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon size={20} color="var(--accent-color)" />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: '0.15rem' }}>{label}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Contact form */}
          <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-md)' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <CheckCircle size={56} color="var(--success)" style={{ margin: '0 auto 1.25rem' }} />
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                  Message Sent!
                </h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                  Thank you for reaching out, <strong>{form.name}</strong>. Our team will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: 'Reservations', message: '' }); }}
                  className="btn btn-outline"
                  style={{ fontSize: '0.82rem' }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.7rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  Send a Message
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                  Fill in the form and we'll respond within 24 hours.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Name + Phone row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input
                        name="name" value={form.name} onChange={handleChange}
                        placeholder="Your full name" required
                        style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'var(--input-focus)'}
                        onBlur={e => e.target.style.borderColor = 'var(--input-border)'}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input
                        name="phone" value={form.phone} onChange={handleChange}
                        placeholder="+91 00000 00000"
                        style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'var(--input-focus)'}
                        onBlur={e => e.target.style.borderColor = 'var(--input-border)'}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      name="email" type="email" value={form.email} onChange={handleChange}
                      placeholder="you@example.com" required
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'var(--input-focus)'}
                      onBlur={e => e.target.style.borderColor = 'var(--input-border)'}
                    />
                  </div>

                  {/* Subject */}
                  <div className="form-group">
                    <label className="form-label">Subject / Department</label>
                    <select
                      name="subject" value={form.subject} onChange={handleChange}
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'var(--input-focus)'}
                      onBlur={e => e.target.style.borderColor = 'var(--input-border)'}
                    >
                      <option>Reservations</option>
                      <option>Guest Relations</option>
                      <option>Concierge</option>
                      <option>Events & Banquets</option>
                      <option>Dining</option>
                      <option>Other</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div className="form-group">
                    <label className="form-label">Message *</label>
                    <textarea
                      name="message" value={form.message} onChange={handleChange}
                      placeholder="Tell us how we can help…" required rows={5}
                      style={{ ...inputStyle, resize: 'vertical', minHeight: 130 }}
                      onFocus={e => e.target.style.borderColor = 'var(--input-focus)'}
                      onBlur={e => e.target.style.borderColor = 'var(--input-border)'}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={sending}
                    style={{ padding: '0.9rem', fontSize: '0.88rem', gap: '0.5rem', opacity: sending ? 0.7 : 1 }}
                  >
                    {sending ? 'Sending…' : <><Send size={16} /> Send Message</>}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ===== MAP PLACEHOLDER ===== */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d5e 100%)',
        padding: '4rem 2rem', textAlign: 'center',
      }}>
        <div style={{
          maxWidth: 700, margin: '0 auto',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 'var(--radius-md)', padding: '3rem 2rem',
        }}>
          <MapPin size={40} color="var(--accent-color)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: '#fff', marginBottom: '0.75rem' }}>
            Find Us on the Map
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem', fontSize: '0.92rem' }}>
            Mall Road, Shimla Hills, Himachal Pradesh – 171001, India
          </p>
          {/* 
            ── HOW TO ADD A REAL MAP ──────────────────────────────
            Replace this <div> with a Google Maps embed:
            1. Go to maps.google.com → search your hotel address
            2. Click Share → Embed a map → Copy the <iframe> code
            3. Paste the <iframe> here in place of this block
            ────────────────────────────────────────────────────── 
          */}
          <div style={{
            height: 220, borderRadius: 'var(--radius-sm)',
            background: 'rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', fontStyle: 'italic',
            border: '1px dashed rgba(255,255,255,0.15)',
          }}>
            [ Embed Google Maps iframe here ]
          </div>
        </div>
      </div>

      {/* ===== RESPONSIVE STYLE ===== */}
      <style>{`
        @media (max-width: 860px) {
          .contact-two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Contact;
