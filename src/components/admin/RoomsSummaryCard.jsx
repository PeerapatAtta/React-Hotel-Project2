import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Home, Bed, Users, ArrowRight, TrendingUp } from 'lucide-react'

export default function RoomsSummaryCard({ 
  rooms = [],
  availableRooms = 0,
  occupancyRate = 0,
  activeBookings = 0
}) {
  // คำนวณตัวเลขต่างๆ
  const stats = useMemo(() => {
    const totalRooms = rooms.length || 0
    const bookedRooms = totalRooms - availableRooms
    const totalCapacity = rooms.reduce((sum, room) => sum + (room.capacity || 0), 0)
    const averageCapacity = totalRooms > 0 ? totalCapacity / totalRooms : 0

    // นับห้องตามประเภท
    const roomTypes = {}
    rooms.forEach(room => {
      const type = room.type || 'อื่นๆ'
      roomTypes[type] = (roomTypes[type] || 0) + 1
    })

    return {
      totalRooms,
      bookedRooms,
      availableRooms,
      occupancyRate,
      totalCapacity,
      averageCapacity,
      roomTypes,
      activeBookings,
    }
  }, [rooms, availableRooms, occupancyRate, activeBookings])

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3">
              <Home size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-primary">สรุปห้องพัก</h2>
              <p className="text-sm text-slate-500 mt-0.5">ภาพรวมห้องพักทั้งหมด</p>
            </div>
          </div>
          <Link
            to="/admin/rooms"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <span>ดูทั้งหมด</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* สถานะห้องพัก */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Home size={18} className="text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              สถานะห้องพัก
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* ห้องทั้งหมด */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-slate-600">ห้องทั้งหมด</p>
                <Home size={16} className="text-slate-500" />
              </div>
              <p className="text-2xl font-bold text-slate-700">{stats.totalRooms}</p>
            </div>

            {/* ห้องว่าง */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-emerald-700">ห้องว่าง</p>
                <Bed size={16} className="text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-600">{stats.availableRooms}</p>
              {stats.totalRooms > 0 && (
                <p className="text-xs text-emerald-600 mt-1">
                  {((stats.availableRooms / stats.totalRooms) * 100).toFixed(0)}%
                </p>
              )}
            </div>

            {/* ห้องที่ถูกจอง */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-blue-700">ห้องที่ถูกจอง</p>
                <Users size={16} className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{stats.bookedRooms}</p>
              {stats.totalRooms > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  {((stats.bookedRooms / stats.totalRooms) * 100).toFixed(0)}%
                </p>
              )}
            </div>

            {/* อัตราการเข้าพัก */}
            <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-teal-700">อัตราการเข้าพัก</p>
                <TrendingUp size={16} className="text-teal-600" />
              </div>
              <p className="text-2xl font-bold text-teal-600">{stats.occupancyRate}%</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 my-6"></div>

        {/* สถิติเพิ่มเติม */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              สถิติเพิ่มเติม
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ความจุรวม */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-slate-600">ความจุรวม</p>
                <Users size={16} className="text-slate-500" />
              </div>
              <p className="text-2xl font-bold text-slate-700">{stats.totalCapacity}</p>
              <p className="text-xs text-slate-500 mt-1">คน</p>
            </div>

            {/* ความจุเฉลี่ยต่อห้อง */}
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-indigo-700">ความจุเฉลี่ยต่อห้อง</p>
                <Bed size={16} className="text-indigo-600" />
              </div>
              <p className="text-2xl font-bold text-indigo-600">
                {stats.averageCapacity.toFixed(1)}
              </p>
              <p className="text-xs text-indigo-600 mt-1">คน</p>
            </div>
          </div>
        </div>

        {/* ประเภทห้องพัก */}
        {Object.keys(stats.roomTypes).length > 0 && (
          <>
            <div className="border-t border-slate-200 my-6"></div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Home size={18} className="text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  ประเภทห้องพัก
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(stats.roomTypes).map(([type, count]) => (
                  <div key={type} className="rounded-lg border border-slate-200 bg-white p-3">
                    <p className="text-xs font-medium text-slate-600 mb-1">{type}</p>
                    <p className="text-sm font-bold text-primary">{count} ห้อง</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
