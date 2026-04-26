-- ══════════════════════════════════════════════════════════════
-- TopAvenue — Supabase Migration
-- Run this ENTIRE script in Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════════════

-- ── 1. REVIEWS TABLE ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id  UUID,
  room_id     UUID,
  rating      INT         NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  guest_name  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers insert own reviews"   ON public.reviews;
DROP POLICY IF EXISTS "Customers read own reviews"     ON public.reviews;
DROP POLICY IF EXISTS "Admin reads all reviews"        ON public.reviews;

CREATE POLICY "Customers insert own reviews" ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Customers read own reviews" ON public.reviews
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── 2. COMPLAINTS TABLE ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.complaints (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id     UUID,
  subject     TEXT        NOT NULL,
  description TEXT        NOT NULL,
  status      TEXT        DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  guest_name  TEXT,
  guest_email TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers insert complaints"  ON public.complaints;
DROP POLICY IF EXISTS "Customers read own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Admin reads all complaints"   ON public.complaints;
DROP POLICY IF EXISTS "Admin updates complaints"     ON public.complaints;

CREATE POLICY "Customers insert complaints" ON public.complaints
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Customers read own complaints" ON public.complaints
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin updates complaints" ON public.complaints
  FOR UPDATE TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── 3. FIX ROOMS RLS (admin can INSERT / UPDATE / DELETE) ─────
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone reads rooms"    ON public.rooms;
DROP POLICY IF EXISTS "Admin inserts rooms"   ON public.rooms;
DROP POLICY IF EXISTS "Admin updates rooms"   ON public.rooms;
DROP POLICY IF EXISTS "Admin deletes rooms"   ON public.rooms;

CREATE POLICY "Anyone reads rooms" ON public.rooms
  FOR SELECT USING (true);

CREATE POLICY "Admin inserts rooms" ON public.rooms
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin updates rooms" ON public.rooms
  FOR UPDATE TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin deletes rooms" ON public.rooms
  FOR DELETE TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── 4. FIX BOOKINGS RLS (admin reads ALL, customers own) ──────
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers insert bookings"    ON public.bookings;
DROP POLICY IF EXISTS "Customers read own bookings"  ON public.bookings;
DROP POLICY IF EXISTS "Admin reads all bookings"     ON public.bookings;

CREATE POLICY "Customers insert bookings" ON public.bookings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Customers read own bookings" ON public.bookings
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin updates bookings" ON public.bookings
  FOR UPDATE TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
