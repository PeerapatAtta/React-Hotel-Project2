-- ============================================
-- Script สำหรับตรวจสอบ Remote Database Schema
-- รันใน Supabase Dashboard → SQL Editor
-- ============================================

-- 1. ตรวจสอบ Migration History
SELECT '=== Migration History ===' as section;
SELECT 
    version,
    name,
    inserted_at
FROM supabase_migrations.schema_migrations
ORDER BY version DESC;

-- 2. ตรวจสอบ Columns ในตาราง profiles (ดูว่ามี last_login หรือไม่)
SELECT '=== Profiles Table Columns ===' as section;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. ตรวจสอบ Function handle_new_user() (ดูว่าใช้ full_name หรือไม่)
SELECT '=== Function: handle_new_user() Definition ===' as section;
SELECT 
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'handle_new_user';

-- 4. ตรวจสอบ Function is_admin()
SELECT '=== Function: is_admin() Definition ===' as section;
SELECT 
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'is_admin';

-- 5. ตรวจสอบ Policies บนตาราง profiles
SELECT '=== Profiles Table Policies ===' as section;
SELECT 
    policyname,
    cmd as command,
    permissive
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 6. ตรวจสอบ Indexes บนตาราง profiles
SELECT '=== Profiles Table Indexes ===' as section;
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
AND tablename = 'profiles'
ORDER BY indexname;

-- 7. สรุป: ตรวจสอบ Migration Status
SELECT '=== Migration Status Summary ===' as section;
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles' 
            AND column_name = 'last_login'
        ) THEN '✓ last_login column EXISTS'
        ELSE '✗ last_login column NOT EXISTS - Need: 20250104000000_add_last_login.sql'
    END as last_login_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' 
            AND p.proname = 'handle_new_user'
            AND pg_get_functiondef(p.oid) LIKE '%full_name%'
        ) THEN '✓ handle_new_user supports full_name'
        ELSE '✗ handle_new_user does NOT support full_name - Need: 20250103000000_update_display_name.sql'
    END as handle_new_user_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies
            WHERE tablename = 'profiles'
            AND policyname = 'Admins can update all profiles'
        ) THEN '✓ Admin update policy EXISTS'
        ELSE '✗ Admin update policy NOT EXISTS - Need: 20250103000001_fix_admin_profiles_access.sql'
    END as admin_update_policy_status;
