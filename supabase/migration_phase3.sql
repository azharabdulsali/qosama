-- ============================================================
-- QOSAMA Phase 3 Migration — Laundry Customer Master
-- Run this AFTER Phase 2 migration has been applied.
-- Run this ENTIRE script in the Supabase SQL Editor.
-- ============================================================

-- 1. Create the laundry_customers master table
CREATE TABLE IF NOT EXISTS public.laundry_customers (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nama        text        NOT NULL CHECK (char_length(btrim(nama)) > 0),
  nomor_wa    text,
  nomor_kamar text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 2. Enable RLS on laundry_customers
ALTER TABLE public.laundry_customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Laundry customers visible publicly" ON public.laundry_customers;
CREATE POLICY "Laundry customers visible publicly"
  ON public.laundry_customers FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated admins can insert laundry customers" ON public.laundry_customers;
CREATE POLICY "Authenticated admins can insert laundry customers"
  ON public.laundry_customers FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated admins can update laundry customers" ON public.laundry_customers;
CREATE POLICY "Authenticated admins can update laundry customers"
  ON public.laundry_customers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated admins can delete laundry customers" ON public.laundry_customers;
CREATE POLICY "Authenticated admins can delete laundry customers"
  ON public.laundry_customers FOR DELETE
  TO authenticated
  USING (true);

-- 3. Add customer_id FK to laundry_queue
ALTER TABLE public.laundry_queue
  ADD COLUMN IF NOT EXISTS customer_id uuid
    REFERENCES public.laundry_customers(id)
    ON DELETE SET NULL;

-- 4. Drop old nomor_kamar and nomor_wa columns from laundry_queue
--    (these are now stored in laundry_customers)
ALTER TABLE public.laundry_queue
  DROP COLUMN IF EXISTS nomor_kamar,
  DROP COLUMN IF EXISTS nomor_wa;
