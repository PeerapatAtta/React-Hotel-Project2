-- ============================================
-- Migration: Fix Admin Profiles Access
-- Created: 2025-01-03
-- Description: แก้ไข RLS policy เพื่อให้ admin สามารถดู profiles ทั้งหมดได้
-- ============================================

-- ตรวจสอบว่า is_admin function มีอยู่แล้ว
-- ถ้ายังไม่มีให้สร้าง
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ลบ policy เก่าทั้งหมดที่เกี่ยวกับ admin viewing profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- สร้าง policy ใหม่: users สามารถดู profile ของตัวเองได้
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- สร้าง policy สำหรับ admin: admin สามารถดู profiles ทั้งหมดได้
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

-- สร้าง policy สำหรับ admin: admin สามารถ update profiles ทั้งหมดได้
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (public.is_admin(auth.uid()));

