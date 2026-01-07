-- ============================================
-- SQL Query: ตรวจสอบ Tables ใน Remote Database
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

-- 3. ดูจำนวน rows ในแต่ละตาราง
SELECT 
    'profiles' as table_name,
    COUNT(*) as row_count
FROM profiles
UNION ALL
SELECT 
    'rooms' as table_name,
    COUNT(*) as row_count
FROM rooms
UNION ALL
SELECT 
    'bookings' as table_name,
    COUNT(*) as row_count
FROM bookings
UNION ALL
SELECT 
    'hotel_settings' as table_name,
    COUNT(*) as row_count
FROM hotel_settings;

-- 4. ดู RLS Policies ที่เปิดอยู่
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. ดู Sequences
SELECT 
    sequence_name,
    data_type,
    start_value,
    minimum_value,
    maximum_value,
    increment
FROM information_schema.sequences
WHERE sequence_schema = 'public';

