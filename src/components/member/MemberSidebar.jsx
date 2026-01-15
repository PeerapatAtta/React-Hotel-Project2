import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Calendar, LogOut, Sparkles, Settings } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function MemberSidebar({ isOpen, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = async () => {
    // Navigate to home first to avoid RequireAuth redirect to login
    navigate('/', { replace: true })
    // Wait a bit for navigation to complete
    await new Promise(resolve => setTimeout(resolve, 100))
    await logout()
  }

  const menuItems = [
    { path: '/member', label: 'หน้าสรุปข้อมูล', icon: LayoutDashboard },
    { path: '/member/bookings', label: 'การจองของฉัน', icon: Calendar },
    { path: '/member/settings', label: 'ตั้งค่า', icon: Settings },
  ]

  const isActive = (path) => {
    if (path === '/member') {
      return location.pathname === '/member'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 flex flex-col`}
      >
        {/* Logo */}
        <Link 
          to="/" 
          className="p-6 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
          onClick={onClose}
        >
          <div className="flex items-center gap-2">
            <Sparkles size={24} className="text-teal-600" />
            <h1 className="text-xl font-bold text-primary hover:text-teal-600 transition-colors">
              บ้านพัก Prima
            </h1>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-teal-50 text-teal-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">ออกจากระบบ</span>
          </button>
        </div>
      </aside>
    </>
  )
}

