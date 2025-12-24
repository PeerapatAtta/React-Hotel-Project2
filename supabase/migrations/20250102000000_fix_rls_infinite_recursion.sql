-- ============================================
-- Migration: Fix Infinite Recursion in RLS Policies
-- Created: 2025-01-02
-- Description: แก้ไขปัญหา infinite recursion ใน profiles RLS policy
-- ============================================

-- สร้าง function สำหรับตรวจสอบ admin role (bypass RLS ด้วย SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- แก้ไข Profiles Policies
-- ============================================

-- ลบ policy เก่าที่มีปัญหา
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- สร้าง policy ใหม่ที่ใช้ function (ไม่มี infinite recursion)
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

-- ============================================
-- แก้ไข Rooms Policies
-- ============================================

DROP POLICY IF EXISTS "Only admins can insert rooms" ON rooms;
CREATE POLICY "Only admins can insert rooms" ON rooms
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can update rooms" ON rooms;
CREATE POLICY "Only admins can update rooms" ON rooms
  FOR UPDATE USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can delete rooms" ON rooms;
CREATE POLICY "Only admins can delete rooms" ON rooms
  FOR DELETE USING (public.is_admin(auth.uid()));

-- ============================================
-- แก้ไข Bookings Policies
-- ============================================

DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
CREATE POLICY "Admins can view all bookings" ON bookings
  FOR SELECT USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update all bookings" ON bookings;
CREATE POLICY "Admins can update all bookings" ON bookings
  FOR UPDATE USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete all bookings" ON bookings;
CREATE POLICY "Admins can delete all bookings" ON bookings
  FOR DELETE USING (public.is_admin(auth.uid()));

