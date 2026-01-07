@echo off
REM ============================================
REM Script สำหรับตรวจสอบ Migration Status
REM ============================================

echo.
echo ============================================
echo   Supabase Migration Status Checker
echo ============================================
echo.

REM ใช้ full path ของ supabase
set SUPABASE_PATH=%USERPROFILE%\scoop\shims\supabase.exe

REM ตรวจสอบว่า supabase มีอยู่หรือไม่
if not exist "%SUPABASE_PATH%" (
    echo [ERROR] Supabase CLI ไม่พบ
    echo.
    echo กรุณาติดตั้ง Supabase CLI ก่อน:
    echo   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
    echo   scoop install supabase
    echo.
    pause
    exit /b 1
)

echo [OK] Supabase CLI พร้อมใช้งาน
echo.

REM ตรวจสอบ migration status
echo กำลังตรวจสอบ migration status...
echo.
"%SUPABASE_PATH%" migration list

echo.
echo ============================================
echo.
echo คำสั่งอื่นๆ ที่ใช้ได้:
echo   %SUPABASE_PATH% login
echo   %SUPABASE_PATH% link --project-ref YOUR_PROJECT_REF
echo   %SUPABASE_PATH% db push
echo.
pause


