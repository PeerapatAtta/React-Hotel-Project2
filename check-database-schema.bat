@echo off
REM ============================================
REM Script สำหรับตรวจสอบ Remote Database Schema
REM ============================================

echo.
echo ============================================
echo   Remote Database Schema Checker
echo ============================================
echo.

REM ใช้ full path ของ supabase
set SUPABASE_PATH=%USERPROFILE%\scoop\shims\supabase.exe

REM ตรวจสอบว่า supabase มีอยู่หรือไม่
if not exist "%SUPABASE_PATH%" (
    echo [ERROR] Supabase CLI ไม่พบ
    echo.
    pause
    exit /b 1
)

echo [INFO] กำลังตรวจสอบ remote database schema...
echo.

REM ตรวจสอบ migration history
echo === Migration History ===
"%SUPABASE_PATH%" migration list
echo.

echo ============================================
echo.
echo สำหรับตรวจสอบ schema แบบละเอียด:
echo.
echo 1. ไปที่ Supabase Dashboard -^> SQL Editor
echo 2. เปิดไฟล์: check-remote-database.sql
echo 3. คัดลอกและรัน SQL queries
echo.
echo หรือใช้คำสั่ง:
echo   supabase db pull --schema public
echo.
pause

