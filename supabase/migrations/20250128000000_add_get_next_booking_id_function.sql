-- ============================================
-- Migration: Add Function to Get Next Booking ID
-- Created: 2025-01-28
-- Description: สร้าง function เพื่อดึง max booking ID และตรวจสอบ ID ที่มีอยู่ โดย bypass RLS
-- ============================================

-- Function สำหรับดึง max booking ID (bypass RLS)
CREATE OR REPLACE FUNCTION public.get_max_booking_id()
RETURNS TEXT AS $$
DECLARE
  max_id_num INTEGER := 0;
  booking_record RECORD;
BEGIN
  -- ดึง bookings ทั้งหมด (bypass RLS ด้วย SECURITY DEFINER)
  FOR booking_record IN 
    SELECT id FROM public.bookings
  LOOP
    -- Parse ID format BK001, BK002, etc.
    IF booking_record.id ~ '^BK[0-9]+$' THEN
      DECLARE
        id_num INTEGER;
      BEGIN
        id_num := CAST(SUBSTRING(booking_record.id FROM 3) AS INTEGER);
        IF id_num > max_id_num THEN
          max_id_num := id_num;
        END IF;
      EXCEPTION
        WHEN OTHERS THEN
          -- Skip invalid IDs
          CONTINUE;
      END;
    END IF;
  END LOOP;
  
  -- Return next ID
  RETURN 'BK' || LPAD((max_id_num + 1)::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function สำหรับตรวจสอบว่า booking ID มีอยู่แล้วหรือไม่ (bypass RLS)
CREATE OR REPLACE FUNCTION public.check_booking_id_exists(booking_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.bookings WHERE id = booking_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
