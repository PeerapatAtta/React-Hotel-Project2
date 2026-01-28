# 🏨 Prima Hotel & Rooms - Hotel Booking Management System

ระบบจัดการการจองโรงแรมแบบ Full-Stack ที่พัฒนาด้วย React และ Supabase สำหรับการจัดการห้องพัก การจอง และผู้ใช้งาน

## 📋 สารบัญ

- [คุณสมบัติหลัก](#คุณสมบัติหลัก)
- [เทคโนโลยีที่ใช้](#เทคโนโลยีที่ใช้)
- [การติดตั้ง](#การติดตั้ง)
- [การตั้งค่า](#การตั้งค่า)
- [การใช้งาน](#การใช้งาน)
- [โครงสร้างโปรเจกต์](#โครงสร้างโปรเจกต์)
- [Deployment](#deployment)
- [License](#license)

## ✨ คุณสมบัติหลัก

### สำหรับผู้ใช้งานทั่วไป (Public)

- 🏠 หน้าแรกแสดงข้อมูลโรงแรม
- 🛏️ ดูรายการห้องพักพร้อมภาพและรายละเอียด
- 🔍 ดูรายละเอียดห้องพักแต่ละห้อง
- 📝 ระบบสมัครสมาชิกและเข้าสู่ระบบ

### สำหรับสมาชิก (Member)

- 📊 Dashboard แสดงข้อมูลการจอง
- 📅 ดูประวัติการจองทั้งหมด
- ⚙️ จัดการข้อมูลส่วนตัวและตั้งค่า

### สำหรับผู้ดูแลระบบ (Admin)

- 📊 Dashboard แสดงสถิติและสรุปข้อมูล
- 🛏️ จัดการห้องพัก (เพิ่ม, แก้ไข, ลบ)
- 📅 จัดการการจองทั้งหมด
- 👥 จัดการผู้ใช้งาน
- 💰 ดูรายงานรายได้และกราฟ
- ⚙️ ตั้งค่าระบบโรงแรม

## 🛠️ เทคโนโลยีที่ใช้

### Frontend

- **React 19.2** - UI Framework
- **React Router DOM 7.11** - Routing
- **Vite 6.0** - Build Tool
- **Tailwind CSS 4.1** - Styling
- **Lucide React** - Icons
- **SweetAlert2** - Alert Dialogs

### Backend & Database

- **Supabase** - Backend as a Service
    - PostgreSQL Database
    - Authentication
    - Row Level Security (RLS)
    - Real-time Subscriptions

### Development Tools

- **ESLint** - Code Linting
- **PostCSS** - CSS Processing
- **Autoprefixer** - CSS Compatibility

## 🚀 การติดตั้ง

### ความต้องการของระบบ

- Node.js 18+
- npm หรือ yarn
- Supabase Account

### ขั้นตอนการติดตั้ง

1. **Clone repository**

```bash
git clone https://github.com/PeerapatAtta/React-Hotel-Project2.git
cd React-Hotel-Project2
```

2. **ติดตั้ง dependencies**

```bash
npm install
```

3. **ตั้งค่า Environment Variables**

```bash
# คัดลอกไฟล์ template
cp .env.example .env.local

# แก้ไขไฟล์ .env.local และใส่ค่าจาก Supabase Dashboard
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. **ตั้งค่า Supabase Database**
    - สร้างโปรเจกต์ใหม่ใน [Supabase Dashboard](https://supabase.com)
    - รัน migrations จากโฟลเดอร์ `supabase/migrations/` ตามลำดับ
    - หรือใช้ Supabase CLI:

    ```bash
    supabase db push
    ```

5. **รันโปรเจกต์**

```bash
npm run dev
```

เว็บไซต์จะเปิดที่ `http://localhost:5173`

## ⚙️ การตั้งค่า

### Supabase Setup

1. สร้างโปรเจกต์ใหม่ใน Supabase Dashboard
2. ไปที่ **Project Settings** → **API**
3. คัดลอก:
    - **Project URL** → `VITE_SUPABASE_URL`
    - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### Database Migrations

Migrations ทั้งหมดอยู่ใน `supabase/migrations/`:

- `20250101000000_create_hotel_schema.sql` - สร้าง schema หลัก
- `20250101000001_seed_rooms_data.sql` - ข้อมูลห้องพักเริ่มต้น
- `20250102000000_fix_rls_infinite_recursion.sql` - แก้ไข RLS policies
- และอื่นๆ...

รัน migrations ตามลำดับวันที่

### Authentication Setup

1. ไปที่ **Authentication** → **Settings**
2. ปิด **Email Confirmation** (สำหรับ development)
3. ตั้งค่า **Password Policy** ตามต้องการ

## 📖 การใช้งาน

### Scripts ที่มีให้

```bash
# รัน development server
npm run dev

# Build สำหรับ production
npm run build

# Preview production build
npm run preview

# ตรวจสอบ code quality
npm run lint
```

### การสร้าง Admin User

1. สมัครสมาชิกผ่านหน้า Register
2. ไปที่ Supabase Dashboard → **Table Editor** → `profiles`
3. แก้ไข `role` เป็น `admin` สำหรับ user ที่ต้องการ

## 📁 โครงสร้างโปรเจกต์

```
React-Hotel-Project2/
├── public/                 # Static files
├── src/
│   ├── components/        # Reusable components
│   │   ├── admin/         # Admin-specific components
│   │   ├── member/        # Member-specific components
│   │   └── layout/        # Layout components
│   ├── config/            # Configuration files
│   ├── context/           # React Context (Auth)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Library configurations
│   ├── pages/             # Page components
│   │   ├── admin/         # Admin pages
│   │   └── member/        # Member pages
│   ├── services/          # API service functions
│   └── utils/             # Utility functions
├── supabase/
│   ├── migrations/        # Database migrations
│   └── config.toml        # Supabase config
├── .env.example           # Environment variables template
└── package.json           # Dependencies
```

## 🌐 Deployment

### Deploy บน Vercel

1. Push โค้ดไปยัง GitHub repository
2. ไปที่ [Vercel Dashboard](https://vercel.com)
3. คลิก **Add New Project**
4. เลือก GitHub repository
5. ตั้งค่า Environment Variables:
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY`
6. คลิก **Deploy**

### Environment Variables สำหรับ Production

ตั้งค่าใน Vercel Dashboard → **Settings** → **Environment Variables**:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🔒 Security

- ✅ Environment variables ไม่ถูก commit ขึ้น GitHub
- ✅ ใช้ Row Level Security (RLS) ใน Supabase
- ✅ Authentication ผ่าน Supabase Auth
- ✅ Role-based access control (Admin/Member)

## 📝 License

This project is private and for educational purposes.

## 👤 Author

Developed as part of IT Study Project

---

**หมายเหตุ**: โปรเจกต์นี้เป็นส่วนหนึ่งของการศึกษาและพัฒนาทักษะ Full-Stack Development
