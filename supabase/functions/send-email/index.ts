// supabase/functions/send-email/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// Deploy:  supabase functions deploy send-email
//
// Required env vars (Supabase dashboard → Project Settings → Edge Functions):
//   RESEND_API_KEY     — from resend.com (free tier: 3k emails/month)
//   FROM_EMAIL         — verified sender, e.g. bookings@topavenue.com
//
// Trigger this function from your frontend after:
//   • Booking confirmed  → type: 'booking_confirmation'
//   • Complaint filed    → type: 'complaint_acknowledgement'
//   • Admin replied      → type: 'complaint_reply'
//
// Example call from BookingFlow.jsx (inside handleComplete, after insert):
//   await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${session.access_token}`,
//     },
//     body: JSON.stringify({
//       type:       'booking_confirmation',
//       to:          guestEmail,
//       guestName:   guestName,
//       roomName:    bookingDetails.roomName,
//       checkIn:     bookingDetails.checkIn,
//       checkOut:    bookingDetails.checkOut,
//       totalCost:   totalCost,
//       bookingRef:  bookingId.slice(0,8).toUpperCase(),
//     }),
//   });
// ─────────────────────────────────────────────────────────────────────────────

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const FROM_EMAIL     = Deno.env.get('FROM_EMAIL') ?? 'bookings@topavenue.com';

const cors = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ── Email templates ─────────────────────────────────────────────────────────

function bookingConfirmation(p: {
  guestName: string; roomName: string;
  checkIn: string; checkOut: string;
  totalCost: number; bookingRef: string;
}) {
  return {
    subject: `Booking Confirmed — ${p.roomName} · Ref #${p.bookingRef}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:580px;margin:0 auto;color:#1a1a2e">
        <div style="background:#1a1a2e;padding:2rem;text-align:center">
          <h1 style="color:#c9a84c;font-size:1.8rem;margin:0">TOPAVENUE</h1>
          <p style="color:rgba(255,255,255,0.6);font-size:0.85rem;margin-top:0.4rem">
            Luxury Hospitality
          </p>
        </div>
        <div style="padding:2rem;border:1px solid #e5e7eb;border-top:none">
          <h2 style="color:#1a1a2e">Booking Confirmed ✓</h2>
          <p style="color:#6b7280">Dear ${p.guestName},</p>
          <p style="color:#374151;line-height:1.7">
            Your reservation has been confirmed. We look forward to welcoming you.
          </p>
          <table style="width:100%;border-collapse:collapse;margin:1.5rem 0">
            <tr style="background:#f9fafb">
              <td style="padding:0.75rem 1rem;border:1px solid #e5e7eb;font-weight:700">Booking Ref</td>
              <td style="padding:0.75rem 1rem;border:1px solid #e5e7eb">#${p.bookingRef}</td>
            </tr>
            <tr>
              <td style="padding:0.75rem 1rem;border:1px solid #e5e7eb;font-weight:700">Room</td>
              <td style="padding:0.75rem 1rem;border:1px solid #e5e7eb">${p.roomName}</td>
            </tr>
            <tr style="background:#f9fafb">
              <td style="padding:0.75rem 1rem;border:1px solid #e5e7eb;font-weight:700">Check In</td>
              <td style="padding:0.75rem 1rem;border:1px solid #e5e7eb">${p.checkIn}</td>
            </tr>
            <tr>
              <td style="padding:0.75rem 1rem;border:1px solid #e5e7eb;font-weight:700">Check Out</td>
              <td style="padding:0.75rem 1rem;border:1px solid #e5e7eb">${p.checkOut}</td>
            </tr>
            <tr style="background:#f9fafb">
              <td style="padding:0.75rem 1rem;border:1px solid #e5e7eb;font-weight:700">Total</td>
              <td style="padding:0.75rem 1rem;border:1px solid #e5e7eb;font-weight:700;color:#c9a84c">
                $${p.totalCost}
              </td>
            </tr>
          </table>
          <p style="color:#6b7280;font-size:0.88rem;line-height:1.7">
            You can manage your booking and submit reviews from your
            <a href="${Deno.env.get('APP_URL') ?? 'https://yourapp.com'}/dashboard"
               style="color:#c9a84c">customer dashboard</a>.
          </p>
        </div>
        <div style="padding:1.5rem;text-align:center;background:#f9fafb;color:#9ca3af;font-size:0.78rem">
          TopAvenue Hotels · The pinnacle of luxury hospitality
        </div>
      </div>`,
  };
}

function complaintAcknowledgement(p: { guestName: string; subject: string }) {
  return {
    subject: `We've Received Your Complaint — "${p.subject}"`,
    html: `
      <div style="font-family:Georgia,serif;max-width:580px;margin:0 auto;color:#1a1a2e">
        <div style="background:#1a1a2e;padding:2rem;text-align:center">
          <h1 style="color:#c9a84c;font-size:1.8rem;margin:0">TOPAVENUE</h1>
        </div>
        <div style="padding:2rem;border:1px solid #e5e7eb;border-top:none">
          <p>Dear ${p.guestName},</p>
          <p style="line-height:1.7">
            Thank you for reaching out. We have received your complaint regarding
            <strong>"${p.subject}"</strong> and our team will review it promptly.
          </p>
          <p style="line-height:1.7">
            You will receive a response from our team within 24 hours. In the
            meantime, you can track the status in your
            <a href="${Deno.env.get('APP_URL') ?? 'https://yourapp.com'}/dashboard"
               style="color:#c9a84c">customer dashboard</a>.
          </p>
          <p>We sincerely apologise for any inconvenience caused.</p>
        </div>
        <div style="padding:1.5rem;text-align:center;background:#f9fafb;color:#9ca3af;font-size:0.78rem">
          TopAvenue Hotels · Guest Relations
        </div>
      </div>`,
  };
}

function complaintReply(p: { guestName: string; subject: string; replyText: string }) {
  return {
    subject: `Response to Your Complaint — "${p.subject}"`,
    html: `
      <div style="font-family:Georgia,serif;max-width:580px;margin:0 auto;color:#1a1a2e">
        <div style="background:#1a1a2e;padding:2rem;text-align:center">
          <h1 style="color:#c9a84c;font-size:1.8rem;margin:0">TOPAVENUE</h1>
        </div>
        <div style="padding:2rem;border:1px solid #e5e7eb;border-top:none">
          <p>Dear ${p.guestName},</p>
          <p style="line-height:1.7">
            Our team has responded to your complaint: <strong>"${p.subject}"</strong>
          </p>
          <div style="background:#eff6ff;border-left:4px solid #2563eb;padding:1rem 1.25rem;margin:1.5rem 0;border-radius:0 6px 6px 0">
            <p style="color:#1e40af;font-style:italic;line-height:1.7;margin:0">${p.replyText}</p>
          </div>
          <p style="color:#6b7280;font-size:0.88rem">
            You can view and track this complaint in your
            <a href="${Deno.env.get('APP_URL') ?? 'https://yourapp.com'}/dashboard"
               style="color:#c9a84c">customer dashboard</a>.
          </p>
        </div>
        <div style="padding:1.5rem;text-align:center;background:#f9fafb;color:#9ca3af;font-size:0.78rem">
          TopAvenue Hotels · Guest Relations
        </div>
      </div>`,
  };
}

// ── Main handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const body = await req.json();
    const { type, to, ...params } = body;

    if (!to) {
      return new Response(JSON.stringify({ error: 'Missing recipient email (to).' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    let template: { subject: string; html: string };

    switch (type) {
      case 'booking_confirmation':
        template = bookingConfirmation(params as any);
        break;
      case 'complaint_acknowledgement':
        template = complaintAcknowledgement(params as any);
        break;
      case 'complaint_reply':
        template = complaintReply(params as any);
        break;
      default:
        return new Response(JSON.stringify({ error: `Unknown email type: ${type}` }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        Authorization:   `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from:    `TopAvenue <${FROM_EMAIL}>`,
        to:      [to],
        subject: template.subject,
        html:    template.html,
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Resend API error: ${errorBody}`);
    }

    const data = await res.json();
    return new Response(JSON.stringify({ id: data.id, success: true }), {
      status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Email error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
