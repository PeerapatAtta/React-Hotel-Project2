-- ============================================
-- Migration: Add Function to Check Room Availability
-- Created: 2025-01-28
-- Description: สร้าง function เพื่อตรวจสอบห้องว่างโดย bypass RLS เพื่อให้ทุกคน (รวมถึง anonymous users) สามารถตรวจสอบได้
-- ============================================

-- Function สำหรับตรวจสอบห้องว่าง (bypass RLS)
CREATE OR REPLACE FUNCTION public.check_room_availability(
  p_room_id TEXT,
  p_check_in DATE,
  p_check_out DATE
)
RETURNS BOOLEAN AS $$
BEGIN
  -- ตรวจสอบว่ามีการจองที่ทับซ้อนหรือไม่
  -- ห้องไม่ว่างถ้า: check_in < checkOut และ check_out > checkIn
  RETURN NOT EXISTS (
    SELECT 1 FROM public.bookings
    WHERE room_id = p_room_id
      AND status IN ('confirmed', 'pending')
      AND check_in < p_check_out
      AND check_out > p_check_in
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
