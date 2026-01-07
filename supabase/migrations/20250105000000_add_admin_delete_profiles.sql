-- ============================================
-- Migration: Add Admin Delete Profiles Policy
-- Created: 2025-01-05
-- Description: เพิ่ม RLS policy เพื่อให้ admin สามารถลบ profiles ได้
-- ============================================

-- สร้าง policy สำหรับ admin: admin สามารถ delete profiles ได้
CREATE POLICY "Admins can delete all profiles" ON profiles
  FOR DELETE USING (public.is_admin(auth.uid()));

