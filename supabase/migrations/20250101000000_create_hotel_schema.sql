-- ============================================
-- Migration: Create Hotel Booking Schema
-- Created: 2025-01-01
-- Description: สร้างตาราง profiles, rooms, bookings และ RLS policies
-- ============================================

-- 1. สร้างตาราง profiles (เก็บข้อมูลเพิ่มเติมจาก auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users (id) PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    status TEXT DEFAULT 'active' CHECK (
        status IN ('active', 'inactive')
    ),
    total_bookings INTEGER DEFAULT 0,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- 2. สร้างตาราง rooms
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  images TEXT[], -- Array of image URLs
  amenities TEXT[], -- Array of amenities
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. สร้าง sequence สำหรับ booking ID
CREATE SEQUENCE IF NOT EXISTS bookings_seq START 1;

-- 4. สร้างตาราง bookings
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY DEFAULT 'BK' || LPAD(nextval('bookings_seq')::TEXT, 3, '0'),
  room_id TEXT REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  room_name TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  nights INTEGER NOT NULL,
  guests INTEGER NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. สร้าง Indexes เพื่อเพิ่มประสิทธิภาพ
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings (user_id);

CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings (room_id);

CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);

CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings (check_in, check_out);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- เปิด RLS สำหรับทุกตาราง
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON profiles FOR
SELECT USING (auth.uid () = id);

CREATE POLICY "Users can update own profile" ON profiles FOR
UPDATE USING (auth.uid () = id);

CREATE POLICY "Admins can view all profiles" ON profiles FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                id = auth.uid ()
                AND role = 'admin'
        )
    );

-- Rooms Policies
CREATE POLICY "Anyone can view rooms" ON rooms FOR
SELECT USING (true);

CREATE POLICY "Only admins can insert rooms" ON rooms FOR
INSERT
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                id = auth.uid ()
                AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can update rooms" ON rooms FOR
UPDATE USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

CREATE POLICY "Only admins can delete rooms" ON rooms FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- Bookings Policies
CREATE POLICY "Users can view own bookings" ON bookings FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can create own bookings" ON bookings FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update own bookings" ON bookings FOR
UPDATE USING (auth.uid () = user_id);

CREATE POLICY "Admins can view all bookings" ON bookings FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                id = auth.uid ()
                AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all bookings" ON bookings FOR
UPDATE USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

CREATE POLICY "Admins can delete all bookings" ON bookings FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- ============================================
-- Functions and Triggers
-- ============================================

-- Function สำหรับสร้าง profile อัตโนมัติเมื่อ user ลงทะเบียน
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger เมื่อ user ใหม่ลงทะเบียน
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function สำหรับอัปเดต updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers สำหรับอัปเดต updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();