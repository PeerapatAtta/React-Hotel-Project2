# Supabase Migrations

โฟลเดอร์นี้เก็บ database migrations สำหรับโปรเจกต์ Hotel Booking

## 📁 โครงสร้าง

```
supabase/
├── migrations/          # Migration files (เรียงตาม timestamp)
│   ├── 20250101000000_create_hotel_schema.sql
│   └── 20250101000001_seed_rooms_data.sql
├── config.toml          # Supabase CLI configuration
└── README.md            # ไฟล์นี้
```

## 🚀 การใช้งาน

ดูคู่มือการใช้งานใน `MIGRATION_GUIDE.md` ที่ root ของโปรเจกต์

## 📝 Migration Files

### 1. `20250101000000_create_hotel_schema.sql`
- สร้างตาราง: `profiles`, `rooms`, `bookings`
- สร้าง indexes และ sequences
- ตั้งค่า Row Level Security (RLS) policies
- สร้าง functions และ triggers

### 2. `20250101000001_seed_rooms_data.sql`
- Import ข้อมูลห้องพักเริ่มต้น (9 ห้อง)
- ใช้ `ON CONFLICT DO NOTHING` เพื่อป้องกัน duplicate

## ⚠️ หมายเหตุ

- Migration files จะรันตามลำดับ timestamp
- อย่าแก้ไข migration ที่รันไปแล้ว (สร้าง migration ใหม่แทน)
- ทดสอบ migration ใน development ก่อน production

