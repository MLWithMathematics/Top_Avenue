import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Shield, Gift, CreditCard } from 'lucide-react';

const WhyBookDirect = () => {
  return (
    <div className="pt-24 min-h-screen">
      {/* Page Header */}
      <section className="section-padding container text-center">
        <h1 className="section-title" style={{ marginTop: '4rem' }}>Why Book <span>Direct?</span></h1>
        <p style={{ maxWidth: '700px', margin: '0 auto', color: 'var(--text-muted)', fontSize: '1.2rem' }}>
          When you book your stay directly through the TopAvenue website, you unlock exclusive benefits, guaranteed best rates, and a seamless reservation experience.
        </p>
      </section>

      {/* Benefits Grid */}
      <section className="container section-padding" style={{ paddingTop: '0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '50%', marginBottom: '1.5rem', color: 'var(--accent-color)' }}>
              <Shield size={32} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Best Rate Guarantee</h3>
            <p style={{ color: 'var(--text-muted)' }}>Find a lower rate elsewhere? We will match it and give you an additional 10% discount on your stay.</p>
          </div>

          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '50%', marginBottom: '1.5rem', color: 'var(--accent-color)' }}>
              <Gift size={32} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Exclusive Welcome Perks</h3>
            <p style={{ color: 'var(--text-muted)' }}>Enjoy complimentary welcome drinks, early check-in (subject to availability), and a signature spa voucher.</p>
          </div>

          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '50%', marginBottom: '1.5rem', color: 'var(--accent-color)' }}>
              <CheckCircle size={32} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Flexible Cancellations</h3>
            <p style={{ color: 'var(--text-muted)' }}>Plans change. Booking direct gives you the most flexible cancellation policies without hidden third-party fees.</p>
          </div>

          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '50%', marginBottom: '1.5rem', color: 'var(--accent-color)' }}>
              <CreditCard size={32} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>No Hidden Fees</h3>
            <p style={{ color: 'var(--text-muted)' }}>What you see is what you pay. We never charge surprise booking fees or hidden surcharges.</p>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding container text-center" style={{ marginBottom: '4rem' }}>
        <div className="glass-panel cta-section" style={{ padding: '4rem 2rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)', color: '#fff' }}>Ready to experience luxury?</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>Book direct for the best rates and exclusive perks.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <Link to="/book" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>Book Now</Link>
            <Link to="/signup" className="btn" style={{ padding: '1rem 3rem', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', fontSize: '1.1rem', borderRadius: 'var(--radius-sm)' }}>Create Account</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhyBookDirect;
