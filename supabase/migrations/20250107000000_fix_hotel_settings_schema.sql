-- ============================================
-- Migration: Fix Hotel Settings Schema
-- Created: 2025-01-07
-- Description: แก้ไข schema ของ hotel_settings จาก integer id เป็น UUID id
-- ============================================

-- 1. Backup ข้อมูลเดิม (ถ้ามี)
CREATE TABLE IF NOT EXISTS hotel_settings_backup AS 
SELECT * FROM hotel_settings;

-- 2. ลบ constraints และ indexes ที่เกี่ยวข้องก่อน
DROP INDEX IF EXISTS hotel_settings_single_row CASCADE;
DROP TRIGGER IF EXISTS hotel_settings_updated_at ON hotel_settings CASCADE;
DROP FUNCTION IF EXISTS update_hotel_settings_updated_at() CASCADE;

-- 3. ลบ RLS policies เก่า
DROP POLICY IF EXISTS "Anyone can read hotel settings" ON hotel_settings;
DROP POLICY IF EXISTS "Admins can update hotel settings" ON hotel_settings;
DROP POLICY IF EXISTS "Admins can insert hotel settings" ON hotel_settings;

-- 4. ลบตารางเก่า
DROP TABLE IF EXISTS hotel_settings CASCADE;

-- 5. สร้างตารางใหม่ด้วย schema ที่ถูกต้อง (UUID id)
CREATE TABLE hotel_settings (
  id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  hotel_name TEXT NOT NULL DEFAULT 'Prima Hotel & Rooms',
  hotel_address TEXT NOT NULL DEFAULT '123/4 ถนนสยาม กรุงเทพฯ',
  hotel_phone TEXT NOT NULL DEFAULT '02-123-4567',
  hotel_email TEXT NOT NULL DEFAULT 'hello@prima.stay',
  hotel_website TEXT NOT NULL DEFAULT 'https://prima.stay',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. สร้าง unique constraint เพื่อให้มีแค่ 1 record
CREATE UNIQUE INDEX hotel_settings_single_row ON hotel_settings ((true));

-- 7. สร้าง trigger เพื่ออัปเดต updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION update_hotel_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hotel_settings_updated_at
  BEFORE UPDATE ON hotel_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_hotel_settings_updated_at();

-- 8. Restore ข้อมูลจาก backup (ถ้ามี)
-- ตรวจสอบว่ามีข้อมูลใน backup หรือไม่
DO $$
DECLARE
  backup_exists BOOLEAN;
  backup_count INTEGER;
BEGIN
  -- ตรวจสอบว่า backup table มีอยู่และมีข้อมูลหรือไม่
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'hotel_settings_backup'
  ) INTO backup_exists;
  
  IF backup_exists THEN
    SELECT COUNT(*) INTO backup_count FROM hotel_settings_backup;
    
    IF backup_count > 0 THEN
      -- Restore ข้อมูล (ไม่รวม id เพราะเป็น UUID ใหม่)
      INSERT INTO hotel_settings (
        hotel_name, 
        hotel_address, 
        hotel_phone, 
        hotel_email, 
        hotel_website,
        created_at,
        updated_at
      )
      SELECT 
        hotel_name, 
        hotel_address, 
        hotel_phone, 
        hotel_email, 
        hotel_website,
        created_at,
        updated_at
      FROM hotel_settings_backup
      LIMIT 1  -- เอาแค่ record แรก (เพราะควรมีแค่ 1 record)
      ON CONFLICT DO NOTHING;
      
      RAISE NOTICE 'Restored % row(s) from backup', backup_count;
    ELSE
      -- ถ้าไม่มีข้อมูลใน backup ให้ insert default values
      INSERT INTO hotel_settings DEFAULT VALUES
      ON CONFLICT DO NOTHING;
      
      RAISE NOTICE 'No data in backup, inserted default values';
    END IF;
  ELSE
    -- ถ้าไม่มี backup table ให้ insert default values
    INSERT INTO hotel_settings DEFAULT VALUES
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'No backup table found, inserted default values';
  END IF;
END $$;

-- 9. RLS Policies
ALTER TABLE hotel_settings ENABLE ROW LEVEL SECURITY;

-- ทุกคนสามารถอ่านได้
CREATE POLICY "Anyone can read hotel settings" ON hotel_settings
  FOR SELECT USING (true);

-- เฉพาะ admin เท่านั้นที่สามารถอัปเดตได้
CREATE POLICY "Admins can update hotel settings" ON hotel_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- เฉพาะ admin เท่านั้นที่สามารถ insert ได้ (สำหรับกรณีที่ยังไม่มีข้อมูล)
CREATE POLICY "Admins can insert hotel settings" ON hotel_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 10. ลบ backup table (optional - comment out ถ้าต้องการเก็บไว้)
-- DROP TABLE IF EXISTS hotel_settings_backup;

