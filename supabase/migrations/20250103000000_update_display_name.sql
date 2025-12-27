-- ============================================
-- Migration: Update Display Name Support
-- Created: 2025-01-03
-- Description: อัปเดต trigger function เพื่อรองรับ full_name และอัปเดต user metadata สำหรับผู้ใช้ที่มีอยู่แล้ว
-- ============================================

-- อัปเดต trigger function เพื่อรองรับ full_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.email,
      'User'
    ),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- หมายเหตุ: การอัปเดต auth.users.raw_user_meta_data ต้องทำผ่าน Supabase Admin API
-- หรือทำผ่าน Supabase Dashboard > Authentication > Users > Edit User
-- 
-- สำหรับผู้ใช้ที่มีอยู่แล้ว กรุณาอัปเดต display name ผ่าน Supabase Dashboard:
-- 1. ไปที่ Authentication > Users
-- 2. คลิกที่ user ที่ต้องการแก้ไข
-- 3. แก้ไข Raw User Meta Data เพิ่ม "full_name" และ "name" ตามต้องการ
-- 
-- หรือใช้ Supabase Admin API:
-- supabase.auth.admin.updateUserById(userId, {
--   user_metadata: { full_name: 'ชื่อที่ต้องการ', name: 'ชื่อที่ต้องการ' }
-- })

