// supabase/functions/create-payment-intent/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// Deploy:  supabase functions deploy create-payment-intent
//
// Required env vars (Supabase dashboard → Project Settings → Edge Functions):
//   STRIPE_SECRET_KEY  — sk_live_... or sk_test_...
//
// Flow:
//   1. Frontend (BookingFlow Step 4) calls this with { amount, currency, metadata }
//   2. We create a PaymentIntent on Stripe and return clientSecret
//   3. Frontend mounts Stripe <PaymentElement> with the clientSecret
//   4. On payment success, booking insert records stripe_payment_intent_id + payment_status='paid'
// ─────────────────────────────────────────────────────────────────────────────

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import Stripe   from 'https://esm.sh/stripe@13.10.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion:  '2023-10-16',
  httpClient:  Stripe.createFetchHttpClient(),
});

const cors = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const { amount, currency = 'usd', metadata = {} } = await req.json();

    if (!amount || amount < 1) {
      return new Response(JSON.stringify({ error: 'Invalid amount.' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Stripe expects the smallest currency unit (cents for USD)
    const intent = await stripe.paymentIntents.create({
      amount:   Math.round(amount * 100),
      currency,
      metadata: { source: 'topavenue', ...metadata },
      automatic_payment_methods: { enabled: true },
    });

    return new Response(
      JSON.stringify({ clientSecret: intent.client_secret }),
      { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Stripe error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
