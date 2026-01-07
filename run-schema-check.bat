@echo off
REM ============================================
REM Script สำหรับรัน SQL Queries เพื่อตรวจสอบ Schema
REM ============================================

echo.
echo ============================================
echo   Database Schema Check - SQL Queries
echo ============================================
echo.
echo [INFO] SQL queries ถูกเตรียมไว้ในไฟล์: check-remote-database.sql
echo.
echo ขั้นตอนการใช้งาน:
echo.
echo 1. ไปที่ Supabase Dashboard: https://app.supabase.com
echo 2. เลือก Project ของคุณ
echo 3. ไปที่ SQL Editor (เมนูด้านซ้าย)
echo 4. เปิดไฟล์ check-remote-database.sql จากโปรเจกต์นี้
echo 5. คัดลอกเนื้อหาทั้งหมดและวางใน SQL Editor
echo 6. คลิก Run หรือกด Ctrl+Enter
echo.
echo ============================================
echo.
echo หรือใช้ Supabase CLI เพื่อดู schema:
echo   supabase db pull --schema public
echo.
echo ============================================
echo.
echo ต้องการเปิดไฟล์ check-remote-database.sql ไหม? (Y/N)
set /p choice="Enter choice: "
if /i "%choice%"=="Y" (
    start notepad check-remote-database.sql
)
echo.
pause

