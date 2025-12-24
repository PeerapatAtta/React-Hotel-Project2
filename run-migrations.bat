@echo off
REM ============================================
REM Script สำหรับรัน Migrations ผ่าน Supabase Dashboard
REM ============================================

echo.
echo ============================================
echo   Supabase Migration Runner
echo ============================================
echo.

echo วิธีที่ 1: ใช้ Supabase Dashboard (แนะนำ)
echo.
echo 1. ไปที่: https://app.supabase.com
echo 2. เลือก Project ของคุณ
echo 3. ไปที่ SQL Editor
echo 4. เปิดไฟล์ migration จาก supabase\migrations\
echo 5. คัดลอกและรัน SQL ตามลำดับ:
echo    - 20250101000000_create_hotel_schema.sql (รันก่อน)
echo    - 20250101000001_seed_rooms_data.sql (รันหลัง)
echo.
echo ============================================
echo.

echo วิธีที่ 2: ใช้ Supabase CLI (ถ้าติดตั้งแล้ว)
echo.
echo ตรวจสอบว่า Supabase CLI ติดตั้งแล้วหรือยัง...
where supabase >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Supabase CLI พร้อมใช้งาน
    echo.
    echo คำสั่งที่ใช้:
    echo   supabase login
    echo   supabase link --project-ref YOUR_PROJECT_REF
    echo   supabase db push
    echo.
) else (
    echo [ERROR] Supabase CLI ยังไม่ได้ติดตั้ง
    echo.
    echo ดูวิธีติดตั้งใน: INSTALL_SUPABASE_CLI.md
    echo หรือใช้วิธีที่ 1 (Dashboard) แทน
    echo.
)

echo วิธีที่ 3: ใช้ npx (ไม่ต้องติดตั้ง)
echo.
echo   npx supabase@latest login
echo   npx supabase@latest link --project-ref YOUR_PROJECT_REF
echo   npx supabase@latest db push
echo.

pause

