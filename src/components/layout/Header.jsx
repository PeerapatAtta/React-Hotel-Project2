import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles, User, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../Button'

export default function Header() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      // Navigate to home first to avoid RequireAuth redirect to login
      navigate('/', { replace: true })
      // Wait a bit for navigation to complete
      await new Promise(resolve => setTimeout(resolve, 100))
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
      // Still navigate to home even if logout fails
      navigate('/', { replace: true })
    }
  }

  // ใช้ useMemo เพื่อ cache dashboard path และลดการคำนวณซ้ำ
  const dashboardPath = useMemo(() => {
    if (!user) return '/login'
    if (user.role === 'admin') return '/admin'
    if (user.role === 'member') return '/member'
    return '/' // default fallback
  }, [user?.role])

  // ✅ สำคัญ: กัน refresh แล้ว UI แสดงเหมือนหลุด login
  // ระหว่าง loading ห้ามตัดสินว่า user = null คือหลุด
  if (loading) {
    return (
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 md:px-8 lg:px-10">
          <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold text-primary hover:text-teal-600 transition-colors">
            <Sparkles size={24} className="text-accent" />
            บ้านพัก Prima
          </Link>
          <nav className="hidden items-center gap-2 text-sm font-semibold md:flex">
            {/* Skeleton nav items */}
            <div className="h-8 w-16 rounded-lg bg-slate-100 animate-pulse" />
            <div className="h-8 w-20 rounded-lg bg-slate-100 animate-pulse" />
            <div className="h-8 w-16 rounded-lg bg-slate-100 animate-pulse" />
          </nav>
          <div className="flex items-center gap-3">
            {/* Skeleton buttons */}
            <div className="h-10 w-28 rounded-full bg-slate-100 animate-pulse hidden sm:block" />
            <div className="h-10 w-24 rounded-full bg-slate-100 animate-pulse hidden md:block" />
            <div className="h-10 w-32 rounded-full bg-slate-100 animate-pulse" />
            <div className="h-10 w-36 rounded-full bg-slate-200 animate-pulse" />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 md:px-8 lg:px-10">
        <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold text-primary hover:text-teal-600 transition-colors">
          <Sparkles size={24} className="text-accent" />
          บ้านพัก Prima
        </Link>
        <nav className="hidden items-center gap-2 text-sm font-semibold md:flex">
          <Link
            to="/"
            className="relative text-slate-700 hover:text-teal-600 px-3 py-1.5 rounded-lg transition-all duration-300 hover:bg-teal-50 hover:scale-105 hover:font-semibold after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-teal-600 after:transition-all after:duration-300 hover:after:w-3/4"
            style={{ color: '#334155' }}
          >
            หน้าแรก
          </Link>
          <Link
            to="/rooms"
            className="relative text-slate-700 hover:text-teal-600 px-3 py-1.5 rounded-lg transition-all duration-300 hover:bg-teal-50 hover:scale-105 hover:font-semibold after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-teal-600 after:transition-all after:duration-300 hover:after:w-3/4"
            style={{ color: '#334155' }}
          >
            ห้องพัก
          </Link>
          <a
            href="/#amenities"
            onClick={(e) => {
              e.preventDefault()
              if (window.location.pathname === '/') {
                const element = document.getElementById('amenities')
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              } else {
                navigate('/#amenities')
                setTimeout(() => {
                  const element = document.getElementById('amenities')
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }, 100)
              }
            }}
            className="relative text-slate-700 hover:text-teal-600 px-3 py-1.5 rounded-lg transition-all duration-300 hover:bg-teal-50 hover:scale-105 hover:font-semibold after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-teal-600 after:transition-all after:duration-300 hover:after:w-3/4"
            style={{ color: '#334155' }}
          >
            สิ่งอำนวยความสะดวก
          </a>
          <a
            href="#contact"
            className="relative text-slate-700 hover:text-teal-600 px-3 py-1.5 rounded-lg transition-all duration-300 hover:bg-teal-50 hover:scale-105 hover:font-semibold after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-teal-600 after:transition-all after:duration-300 hover:after:w-3/4"
            style={{ color: '#334155' }}
          >
            ติดต่อ
          </a>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to={dashboardPath}>
                <Button
                  variant="ghost"
                  className="text-sm hidden sm:flex"
                >
                  <LayoutDashboard size={16} />
                  <span className="hidden sm:inline">
                    {user.role === 'admin' ? 'หน้าผู้จัดการโรงแรม' : 'หน้าสมาชิก'}
                  </span>
                </Button>
              </Link>
              <span className="hidden md:inline-block text-sm font-medium text-slate-700">
                {user.name}
              </span>
              <Button
                variant="ghost"
                onClick={(e) => {
                  handleLogout()
                }}
                className="text-sm"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">ออกจากระบบ</span>
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="ghost" className="text-sm">
                <User size={16} />
                <span className="hidden sm:inline">เข้าสู่ระบบ</span>
              </Button>
            </Link>
          )}
          <Link
            to="/rooms"
            className="rounded-full border-2 border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all duration-300 hover:border-teal-500 hover:bg-teal-100 hover:text-teal-800 hover:shadow-lg hover:shadow-teal-200/50 hover:scale-105 hover:-translate-y-0.5"
            style={{ color: '#475569', borderColor: '#e2e8f0', backgroundColor: '#ffffff' }}
          >
            ตรวจสอบห้องว่าง
          </Link>
        </div>
      </div>
    </header>
  )
}

