-- ============================================
-- SQL Query: ตรวจสอบ Tables ใน Remote Database
-- รันใน Supabase Dashboard → SQL Editor
-- ============================================

-- 1. ดูรายชื่อตารางทั้งหมดใน schema public
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. ดูรายละเอียด columns ของแต่ละตาราง
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 3. ดูจำนวน rows ในแต่ละตาราง (ถ้ามีตารางอยู่)
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    -- ตรวจสอบ profiles
    SELECT COUNT(*) INTO table_count FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles';
    IF table_count > 0 THEN
        RAISE NOTICE 'profiles: % rows', (SELECT COUNT(*) FROM profiles);
    END IF;
    
    -- ตรวจสอบ rooms
    SELECT COUNT(*) INTO table_count FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'rooms';
    IF table_count > 0 THEN
        RAISE NOTICE 'rooms: % rows', (SELECT COUNT(*) FROM rooms);
    END IF;
    
    -- ตรวจสอบ bookings
    SELECT COUNT(*) INTO table_count FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'bookings';
    IF table_count > 0 THEN
        RAISE NOTICE 'bookings: % rows', (SELECT COUNT(*) FROM bookings);
    END IF;
    
    -- ตรวจสอบ hotel_settings
    SELECT COUNT(*) INTO table_count FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'hotel_settings';
    IF table_count > 0 THEN
        RAISE NOTICE 'hotel_settings: % rows', (SELECT COUNT(*) FROM hotel_settings);
    END IF;
END $$;

-- 4. ดู RLS Policies ที่เปิดอยู่
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. ดู Sequences
SELECT 
    sequence_name,
    data_type,
    start_value,
    increment
FROM information_schema.sequences
WHERE sequence_schema = 'public';

