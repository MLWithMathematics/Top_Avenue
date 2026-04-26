import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Star, ArrowRight, Wifi, Coffee, Car, Shield, Phone, MapPin } from 'lucide-react';
import './Home.css';

const Home = () => {
  const rooms = [
    { id: 1, name: 'Deluxe King Suite', desc: 'Spacious 55 sqm suite with panoramic city views, a king bed, and a private lounge area.', price: 299, tag: 'Most Popular' },
    { id: 2, name: 'Ocean View Suite', desc: 'Wake up to stunning sea vistas from your private balcony with premium bedding and spa bath.', price: 499, tag: 'Best Value' },
    { id: 3, name: 'Presidential Suite', desc: 'The pinnacle of luxury — a 120 sqm penthouse suite with butler service and a rooftop terrace.', price: 899, tag: 'Exclusive' },
  ];

  const perks = [
    { icon: Wifi, title: 'Complimentary Wi-Fi', desc: 'Ultra-fast gigabit Wi-Fi throughout the property, always free.' },
    { icon: Coffee, title: 'Daily Breakfast', desc: 'A curated continental breakfast served to your room each morning.' },
    { icon: Car, title: 'Valet Parking', desc: 'Complimentary valet service for all direct bookings.' },
    { icon: Shield, title: 'Best Rate Guarantee', desc: 'Book direct and we guarantee the lowest available rate.' },
  ];

  const reviews = [
    { name: 'Sarah M.', location: 'London, UK', text: 'Absolutely breathtaking! The service was impeccable and the rooms were stunning. TopAvenue is our home away from home.', rating: 5 },
    { name: 'James L.', location: 'New York, USA', text: 'Booking direct gave us amazing perks — free breakfast and early check-in. The staff went above and beyond every single day.', rating: 5 },
    { name: 'Elena R.', location: 'Paris, France', text: 'The spa facilities are world-class. Calm, luxurious, and utterly professional. We are already planning our return visit.', rating: 5 },
  ];

  return (
    <div className="home-page" style={{ background: 'var(--bg-main)' }}>

      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content animate-fade-in">
          <span className="hero-eyebrow">Est. 2020 &nbsp;·&nbsp; TopAvenue Hotels</span>
          <h1>Experience Unmatched<br/><span style={{ color: 'var(--accent-color)' }}>Elegance</span></h1>
          <p>Discover a world of curated luxury, unparalleled comfort, and personalised hospitality at TopAvenue.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/book" className="btn btn-primary" style={{ padding: '0.9rem 2.5rem', fontSize: '0.9rem' }}>Book Your Stay</Link>
            <Link to="/why-book-direct" className="btn" style={{ padding: '0.9rem 2.5rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)' }}>Why Book Direct</Link>
          </div>
        </div>
      </section>

      {/* Quick Booking Bar — sits below the hero, pulled up to overlap */}
      <div className="booking-bar-wrapper container animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="booking-bar">
          <div className="booking-inputs">
            <div className="input-group">
              <label>Check In</label>
              <div className="input-field">
                <Calendar size={16} />
                <input type="date" />
              </div>
            </div>
            <div className="input-group">
              <label>Check Out</label>
              <div className="input-field">
                <Calendar size={16} />
                <input type="date" />
              </div>
            </div>
            <div className="input-group">
              <label>Guests</label>
              <div className="input-field">
                <Users size={16} />
                <select>
                  <option>1 Guest</option>
                  <option>2 Guests</option>
                  <option>3 Guests</option>
                  <option>4+ Guests</option>
                </select>
              </div>
            </div>
            <Link to="/book" className="btn btn-primary booking-btn">Check Availability</Link>
          </div>
          <div className="booking-auth">
            <span>Members get exclusive rates &amp; perks</span>
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up Free</Link>
            </div>
          </div>
        </div>
      </div>

      {/* ===== FEATURED ROOMS ===== */}
      <section className="featured-rooms section-padding" style={{ paddingTop: '5rem' }}>
        <div className="container">
          <p style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '3px', color: 'var(--accent-color)', marginBottom: '0.75rem' }}>Accommodations</p>
          <h2 className="section-title">Signature <span>Suites</span></h2>
          <div className="gold-divider"></div>
          <div className="room-grid" style={{ marginTop: '3rem' }}>
            {rooms.map((room) => (
              <div key={room.id} className="room-card glass-panel">
                <div className="room-img-placeholder">
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--text-muted)', zIndex: 1 }}>{room.name}</span>
                  {room.tag && (
                    <span style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'var(--accent-color)', color: '#1a1a2e', fontSize: '0.7rem', fontWeight: 700, padding: '0.3rem 0.75rem', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px', zIndex: 2 }}>{room.tag}</span>
                  )}
                </div>
                <div className="room-info">
                  <h3>{room.name}</h3>
                  <p>{room.desc}</p>
                  <div className="room-footer">
                    <span className="price">From ${room.price}<span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>/night</span></span>
                    <Link to="/book" className="btn btn-ghost" style={{ padding: '0.5rem 0', gap: '0.4rem', fontSize: '0.82rem' }}>Book Now <ArrowRight size={14}/></Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY BOOK DIRECT ===== */}
      <section className="why-section section-padding">
        <div className="container">
          <p style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '3px', color: 'var(--accent-color)', marginBottom: '0.75rem' }}>Exclusive Benefits</p>
          <h2 className="section-title">Why <span>Book Direct</span></h2>
          <div className="gold-divider"></div>
          <div className="perks-grid" style={{ marginTop: '3rem' }}>
            {perks.map((perk, idx) => (
              <div key={idx} className="perk-card glass-panel">
                <div className="perk-icon"><perk.icon size={28} /></div>
                <h3>{perk.title}</h3>
                <p>{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== GUEST REVIEWS ===== */}
      <section className="reviews section-padding">
        <div className="container">
          <p style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '3px', color: 'var(--accent-color)', marginBottom: '0.75rem' }}>Testimonials</p>
          <h2 className="section-title">Guest <span>Experiences</span></h2>
          <div className="gold-divider"></div>
          <div className="review-grid" style={{ marginTop: '3rem' }}>
            {reviews.map((review, idx) => (
              <div key={idx} className="review-card glass-panel">
                <div className="stars">
                  {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} fill="var(--accent-color)" color="var(--accent-color)" />)}
                </div>
                <p className="review-text">{review.text}</p>
                <div className="reviewer-info">
                  <div className="reviewer-avatar">{review.name[0]}</div>
                  <div>
                    <p className="reviewer">{review.name}</p>
                    <p className="reviewer-location"><MapPin size={10} style={{ display: 'inline', marginRight: 3 }} />{review.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="cta-section">
        <div className="container">
          <h2 className="section-title" style={{ color: '#fff', marginBottom: '1rem' }}>Ready for an <span>Unforgettable</span> Stay?</h2>
          <p>Book direct for the best rates, complimentary upgrades, and personalized service.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/book" className="btn btn-primary" style={{ padding: '1rem 3rem' }}>Reserve Your Suite</Link>
            <Link to="/contact" className="btn" style={{ padding: '1rem 3rem', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 'var(--radius-sm)' }}><Phone size={16} style={{ marginRight: '0.5rem' }} />Contact Us</Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ background: '#111122', color: 'rgba(255,255,255,0.5)', padding: '3rem 2rem', textAlign: 'center' }}>
        <div className="container">
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: '#fff', marginBottom: '0.5rem' }}>TOP<span style={{ color: 'var(--accent-color)' }}>AVENUE</span></p>
          <p style={{ fontSize: '0.85rem', marginBottom: '2rem' }}>The pinnacle of luxury hospitality.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem', fontSize: '0.82rem' }}>
            <Link to="/rooms" style={{ color: 'rgba(255,255,255,0.5)' }}>Rooms &amp; Suites</Link>
            <Link to="/dining" style={{ color: 'rgba(255,255,255,0.5)' }}>Dining</Link>
            <Link to="/why-book-direct" style={{ color: 'rgba(255,255,255,0.5)' }}>Why Book Direct</Link>
            <Link to="/contact" style={{ color: 'rgba(255,255,255,0.5)' }}>Contact</Link>
            <Link to="/login" style={{ color: 'rgba(255,255,255,0.5)' }}>Login</Link>
          </div>
          <p style={{ fontSize: '0.78rem' }}>&copy; {new Date().getFullYear()} TopAvenue Hotels. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
