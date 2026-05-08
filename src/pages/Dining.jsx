import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Phone, Star, Coffee, Wine, Utensils, Moon } from 'lucide-react';

// ────────────────────────────────────────────────────────────────
// DUMMY DATA — edit this array to update dining entries
// Fields: name, tag, tagline, description, hours, location,
//         phone, cuisine, priceRange, highlights[]
// ────────────────────────────────────────────────────────────────
const RESTAURANTS = [
  {
    id: 1,
    icon: Utensils,
    name: 'The Grand Terrace',
    tag: 'Signature Restaurant',
    tagline: 'Fine dining with panoramic views',
    description:
      'Our flagship restaurant offers an elevated culinary journey through contemporary Indian and Continental cuisine. Masterfully curated tasting menus celebrate seasonal produce sourced from local farms, paired with an award-winning wine cellar.',
    hours: '7:00 AM – 11:00 PM',
    location: 'Level 8, Main Tower',
    phone: '+91 98765 43210',
    cuisine: 'Indian · Continental · Tasting Menu',
    priceRange: '₹₹₹₹',
    accent: '#c9a84c',
    highlights:  ['Private dining pods', 'Live kitchen theatre', "Chef's tasting menu", 'Sommelier on call'],
  },
  {
    id: 2,
    icon: Wine,
    name: 'Azure Bar & Lounge',
    tag: 'Cocktail Lounge',
    tagline: 'Artisanal cocktails & small plates',
    // FIXED: Changed to double quotes to safely include the apostrophe in "world's"
    description:
      "A sophisticated hideaway for crafted cocktails, rare single malts, and inventive small plates. Azure draws inspiration from the world's great bars, with a menu that rotates seasonally and a curated playlist to set the perfect mood.",
    hours: '5:00 PM – 1:00 AM',
    location: 'Level 2, South Wing',
    phone: '+91 98765 43211',
    cuisine: 'Bar Bites · Tapas · Charcuterie',
    priceRange: '₹₹₹',
    accent: '#2d2d5e',
    highlights: ['Signature house cocktails', 'Live jazz on weekends', '80+ whisky selection', 'Rooftop access'],
  },
  {
    id: 3,
    icon: Coffee,
    name: 'The Morning Room',
    tag: 'Breakfast & Café',
    tagline: 'A bright start to every day',
    description:
      'Begin your morning in an airy, sun-drenched café designed to set the tone for a perfect day. The Morning Room serves an elaborate buffet breakfast alongside à la carte options, fresh pastries from our in-house bakery, and specialty single-origin coffees.',
    hours: '6:30 AM – 12:00 PM',
    location: 'Level 1, Garden Atrium',
    phone: '+91 98765 43212',
    cuisine: 'Continental · Indian · Bakery',
    priceRange: '₹₹',
    accent: '#a07828',
    highlights: ['Live egg station', 'Fresh-baked croissants', 'Cold-press juice bar', 'Gluten-free options'],
  },
  {
    id: 4,
    icon: Moon,
    name: 'In-Room Dining',
    tag: '24 / 7 Room Service',
    tagline: 'The comfort of fine dining, in your suite',
    description:
      'Indulge from the privacy of your room at any hour. Our round-the-clock in-room dining menu spans breakfast favourites, hearty mains, decadent desserts, and an extensive beverages list — all delivered in under 30 minutes with white-glove presentation.',
    hours: '24 Hours · 7 Days',
    location: 'All Guest Rooms & Suites',
    phone: 'Dial Ext. 0 (from your room)',
    cuisine: 'Full Menu · All-Day',
    priceRange: '₹₹–₹₹₹₹',
    accent: '#1a2744',
    highlights: ['30-min delivery guarantee', 'Full breakfast to midnight snack', 'Dietary accommodations', 'Silver-service presentation'],
  },
];

// ────────────────────────────────────────────────────────────────
const DiningCard = ({ venue }) => {
  const Icon = venue.icon;
  return (
    <div
      className="glass-panel"
      style={{
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Coloured header strip */}
      <div style={{
        background: `linear-gradient(135deg, ${venue.accent} 0%, #1a1a2e 100%)`,
        padding: '2.5rem 2rem',
        display: 'flex', alignItems: 'center', gap: '1.25rem',
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={26} color="#fff" />
        </div>
        <div>
          <span style={{
            fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '3px', color: 'rgba(255,255,255,0.65)',
          }}>
            {venue.tag}
          </span>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.7rem', color: '#fff', marginTop: '0.2rem' }}>
            {venue.name}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.2rem', fontStyle: 'italic' }}>
            {venue.tagline}
          </p>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '2rem' }}>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '0.92rem', marginBottom: '1.5rem' }}>
          {venue.description}
        </p>

        {/* Highlights */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.75rem' }}>
          {venue.highlights.map(h => (
            <span key={h} style={{
              background: 'rgba(201,168,76,0.1)', color: 'var(--accent-dark)',
              fontSize: '0.72rem', fontWeight: 600, padding: '0.3rem 0.75rem',
              borderRadius: 20, border: '1px solid rgba(201,168,76,0.25)',
            }}>
              ✦ {h}
            </span>
          ))}
        </div>

        {/* Meta info */}
        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <Clock size={15} color="var(--accent-color)" />
            <span><strong>Hours:</strong> {venue.hours}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <MapPin size={15} color="var(--accent-color)" />
            <span>{venue.location}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <Phone size={15} color="var(--accent-color)" />
            <span>{venue.phone}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{venue.cuisine}</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--accent-dark)', fontWeight: 700 }}>{venue.priceRange}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
const Dining = () => {
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
          }}>Culinary Experiences</span>
          <h1 className="responsive-hero-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '3.5rem', color: '#fff', marginBottom: '1rem' }}>
            Dining at <span style={{ color: 'var(--accent-color)' }}>TopAvenue</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 560, margin: '0 auto', fontSize: '1rem', lineHeight: 1.7 }}>
            From sunrise breakfasts to late-night cocktails, our culinary venues are crafted to delight every palate.
          </p>
        </div>
      </div>

      {/* ===== DINING VENUES GRID ===== */}
      <section className="section-padding">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '3px', color: 'var(--accent-color)', marginBottom: '0.75rem' }}>
              Our Venues
            </p>
            <h2 className="section-title">Four <span>Distinct</span> Experiences</h2>
            <div className="gold-divider" />
          </div>

          {/* FIXED: Added min(100%, 400px) so cards don't break/overflow on smaller mobile screens */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 400px), 1fr))', gap: '2.5rem' }}>
            {RESTAURANTS.map(venue => (
              <DiningCard key={venue.id} venue={venue} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== DIETARY NOTE ===== */}
      <section style={{ background: 'var(--bg-section)', padding: '4rem 2rem' }}>
        <div className="container" style={{ maxWidth: 760, textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="var(--accent-color)" color="var(--accent-color)" />)}
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--text-main)', marginBottom: '1rem' }}>
            Every Preference, Perfectly <span style={{ color: 'var(--accent-color)' }}>Catered</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '0.95rem', marginBottom: '2rem' }}>
            Our culinary team is dedicated to accommodating all dietary requirements — vegetarian, vegan, gluten-free, Jain, and more. Please inform us of any allergies or preferences at the time of booking and we will ensure a seamless, personalised experience.
          </p>
          <Link to="/contact" className="btn btn-primary" style={{ padding: '0.85rem 2.5rem' }}>
            Make a Dining Reservation
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Dining;