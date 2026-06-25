-- ============================================================
-- QOSAMA Phase 2 Migration
-- Run this ENTIRE script in the Supabase SQL Editor
-- ============================================================

-- 1. Convert no_antrean from integer to text
ALTER TABLE public.laundry_queue
  ALTER COLUMN no_antrean TYPE text USING no_antrean::text;

-- 2. Add new columns (all safe to run multiple times)
ALTER TABLE public.laundry_queue
  ADD COLUMN IF NOT EXISTS waktu_proses  timestamptz,
  ADD COLUMN IF NOT EXISTS waktu_selesai timestamptz,
  ADD COLUMN IF NOT EXISTS nomor_kamar   text,
  ADD COLUMN IF NOT EXISTS nomor_wa      text,
  ADD COLUMN IF NOT EXISTS sudah_bayar   boolean NOT NULL DEFAULT false;

-- 3. Auto-generate queue ID function (format: YYYYMM + 3-digit seq)
--    Resets counter each calendar month.
CREATE OR REPLACE FUNCTION public.generate_no_antrean()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  year_month text;
  seq        integer;
BEGIN
  year_month := to_char(NOW() AT TIME ZONE 'Asia/Jakarta', 'YYYYMM');
  SELECT COUNT(*) + 1 INTO seq
    FROM public.laundry_queue
    WHERE no_antrean LIKE year_month || '%';
  RETURN year_month || LPAD(seq::text, 3, '0');
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.generate_no_antrean() TO authenticated;
