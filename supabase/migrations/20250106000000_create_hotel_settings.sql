-- ============================================
-- Migration: Create Hotel Settings Table
-- Created: 2025-01-06
-- Description: สร้างตาราง hotel_settings สำหรับเก็บข้อมูลโรงแรม
-- ============================================

-- สร้างตาราง hotel_settings
CREATE TABLE IF NOT EXISTS hotel_settings (
  id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  hotel_name TEXT NOT NULL DEFAULT 'Prima Hotel & Rooms',
  hotel_address TEXT NOT NULL DEFAULT '123/4 ถนนสยาม กรุงเทพฯ',
  hotel_phone TEXT NOT NULL DEFAULT '02-123-4567',
  hotel_email TEXT NOT NULL DEFAULT 'hello@prima.stay',
  hotel_website TEXT NOT NULL DEFAULT 'https://prima.stay',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้าง unique constraint เพื่อให้มีแค่ 1 record (ใช้ constant value)
CREATE UNIQUE INDEX IF NOT EXISTS hotel_settings_single_row ON hotel_settings ((true));

-- สร้าง trigger เพื่ออัปเดต updated_at อัตโนมัติ
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

-- Insert default values (ถ้ายังไม่มีข้อมูล)
INSERT INTO hotel_settings (id, hotel_name, hotel_address, hotel_phone, hotel_email, hotel_website)
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 
        'Prima Hotel & Rooms',
        '123/4 ถนนสยาม กรุงเทพฯ',
        '02-123-4567',
        'hello@prima.stay',
        'https://prima.stay')
ON CONFLICT (id) DO NOTHING;

-- RLS Policies
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

