@echo off
REM ============================================
REM Script สำหรับรัน Migrations ด้วย Supabase CLI
REM ============================================

echo.
echo ============================================
echo   Supabase Migration Runner
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

REM ตรวจสอบว่า login แล้วหรือยัง
echo กำลังตรวจสอบการ login...
"%SUPABASE_PATH%" projects list >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] ยังไม่ได้ login
    echo.
    echo กรุณา login ก่อน:
    echo   %SUPABASE_PATH% login
    echo.
    pause
    exit /b 1
)

echo [OK] Login แล้ว
echo.

REM ตรวจสอบว่า link project แล้วหรือยัง
echo กำลังตรวจสอบ project link...
if not exist "supabase\.temp\project-ref" (
    echo [WARNING] ยังไม่ได้ link project
    echo.
    echo กรุณา link project ก่อน:
    echo   %SUPABASE_PATH% link --project-ref YOUR_PROJECT_REF
    echo.
    echo หา project-ref จาก: Dashboard -^> Settings -^> General -^> Reference ID
    echo.
    pause
    exit /b 1
)

echo [OK] Project linked แล้ว
echo.

REM Push migrations
echo กำลัง push migrations...
echo.
"%SUPABASE_PATH%" db push

echo.
echo ============================================
echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Migrations รันสำเร็จ!
) else (
    echo [ERROR] มีปัญหาในการรัน migrations
    echo.
    echo ตรวจสอบ error messages ด้านบน
)
echo.
pause


