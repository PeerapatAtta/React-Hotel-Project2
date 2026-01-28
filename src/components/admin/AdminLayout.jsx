import React, { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Footer from '../layout/Footer'
import { useAuth } from '../../hooks/useAuth'

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleHomeClick = (e) => {
    e.preventDefault()
    if (window.location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate('/')
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <div className="hidden lg:block">
                  <p className="text-lg md:text-xl font-semibold text-slate-700">
                    หน้าผู้จัดการโรงแรม
                  </p>
                </div>
              </div>
              <nav className="hidden items-center gap-2 text-sm font-semibold md:flex">
                <a
                  href="/"
                  onClick={handleHomeClick}
                  className="relative text-slate-700 hover:text-teal-600 px-3 py-1.5 rounded-lg transition-all duration-300 hover:bg-teal-50 hover:scale-105 hover:font-semibold after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-teal-600 after:transition-all after:duration-300 hover:after:w-3/4 cursor-pointer"
                  style={{ color: '#334155' }}
                >
                  หน้าแรก
                </a>
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
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-700">{user?.name || 'ผู้ดูแลระบบ'}</p>
                  <p className="text-xs text-slate-500">{user?.email || ''}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                  <span className="text-teal-700 font-semibold text-sm">
                    {user?.name?.charAt(0) || 'A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 pb-8">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}

