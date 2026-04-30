-- ══════════════════════════════════════════════════════════════
-- TopAvenue — Supabase migration
-- Run this in your Supabase SQL editor before deploying the
-- updated frontend code.
-- ══════════════════════════════════════════════════════════════

-- ── 1. Staff table (replaces localStorage) ───────────────────
CREATE TABLE IF NOT EXISTS public.staff (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  role        TEXT        NOT NULL,
  email       TEXT,
  phone       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Admin-only access (no RLS needed if accessed only via service role,
-- but for anon/auth key in the frontend restrict to admin sessions)
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage staff"
  ON public.staff FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ── 2. Profiles table (replaces localStorage) ────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id                       UUID  PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name                TEXT,
  phone                    TEXT,
  nationality              TEXT,
  address                  TEXT,
  city                     TEXT,
  state                    TEXT,
  country                  TEXT,
  date_of_birth            TEXT,
  gender                   TEXT,
  id_type                  TEXT,
  id_number                TEXT,
  emergency_contact_name   TEXT,
  emergency_contact_phone  TEXT,
  dietary_preferences      TEXT,
  special_requests         TEXT,
  role                     TEXT        DEFAULT 'customer',
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can upsert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin can read all profiles
CREATE POLICY "Admin can read all profiles"
  ON public.profiles FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ── 3. Add room_name column to bookings (if not present) ─────
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS room_name TEXT;

-- ── 4. Admin reply on complaints ──────────────────────────────
ALTER TABLE public.complaints
  ADD COLUMN IF NOT EXISTS admin_reply       TEXT,
  ADD COLUMN IF NOT EXISTS admin_replied_at  TIMESTAMPTZ;

-- Allow customers to read their own complaint (including admin reply)
CREATE POLICY "Users can read own complaints"
  ON public.complaints FOR SELECT
  USING (auth.uid() = user_id);

-- Admin can read all complaints
CREATE POLICY "Admin can read all complaints"
  ON public.complaints FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Admin can update any complaint (status + reply)
CREATE POLICY "Admin can update complaints"
  ON public.complaints FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ── 5. Room images ─────────────────────────────────────────────
ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ── 6. Stripe payment_intent_id on bookings ────────────────────
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_status           TEXT DEFAULT 'pending';
