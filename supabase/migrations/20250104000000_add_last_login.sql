-- ============================================
-- Migration: Add last_login field to profiles
-- Created: 2025-01-04
-- Description: เพิ่มฟิลด์ last_login ในตาราง profiles เพื่อเก็บข้อมูลการเข้าสู่ระบบล่าสุด
-- ============================================

-- เพิ่มฟิลด์ last_login ในตาราง profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP
WITH
    TIME ZONE;

-- สร้าง index เพื่อเพิ่มประสิทธิภาพในการค้นหา
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON profiles (last_login);

-- อัปเดต last_login ให้เป็น updated_at สำหรับข้อมูลที่มีอยู่แล้ว (เป็นค่าเริ่มต้น)
UPDATE profiles
SET
    last_login = updated_at
WHERE
    last_login IS NULL;