import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, CheckCircle, XCircle, ArrowRight, TrendingUp, LogIn, LogOut, Plus } from 'lucide-react'

export default function BookingsSummaryCard({ bookings = [], todayStats = {} }) {
  // คำนวณตัวเลขต่างๆ
  const stats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    let total = bookings.length
    let pending = 0
    let confirmed = 0
    let cancelled = 0
    let ongoing = 0
    let upcoming = 0
    let past = 0
    let checkInsToday = 0
    let checkOutsToday = 0
    let newBookingsToday = 0

    bookings.forEach((booking) => {
      const status = booking.status

      // นับตามสถานะ
      if (status === 'pending') pending++
      if (status === 'confirmed') confirmed++
      if (status === 'cancelled') cancelled++

      // คำนวณสถานะเวลา
      const checkIn = booking.check_in || booking.checkIn
      const checkOut = booking.check_out || booking.checkOut

      if (checkIn && checkOut) {
        const checkInDate = new Date(checkIn)
        checkInDate.setHours(0, 0, 0, 0)

        const checkOutDate = new Date(checkOut)
        checkOutDate.setHours(0, 0, 0, 0)

        // เช็กอินวันนี้ (ใช้ todayStats ถ้ามี หรือคำนวณเอง)
        if (checkIn === todayStr && status !== 'cancelled') {
          checkInsToday++
        }

        // เช็กเอาต์วันนี้ (ใช้ todayStats ถ้ามี หรือคำนวณเอง)
        if (checkOut === todayStr && status !== 'cancelled') {
          checkOutsToday++
        }

        if (checkOutDate < today) {
          // ผ่านมาแล้ว (เฉพาะที่ไม่ใช่ cancelled)
          if (status !== 'cancelled') {
            past++
          }
        } else if (checkInDate <= today && checkOutDate >= today) {
          // กำลังเข้าพัก
          ongoing++
        } else if (checkInDate > today) {
          // กำลังจะมาถึง
          upcoming++
        }
      }

      // การจองใหม่วันนี้ (ไม่นับ cancelled)
      const createdAt = booking.created_at || booking.createdAt
      if (createdAt && status !== 'cancelled') {
        if (createdAt.startsWith(todayStr)) {
          newBookingsToday++
        }
      }
    })

    // คำนวณ total สำหรับช่วงเวลา (เฉพาะที่ไม่ใช่ cancelled)
    const totalTimePeriod = ongoing + upcoming + past

    // ใช้ todayStats ถ้ามี (จาก getBookingStatistics) เพื่อความถูกต้อง
    return {
      total,
      pending,
      confirmed,
      cancelled,
      ongoing,
      upcoming,
      past,
      totalTimePeriod,
      checkInsToday: todayStats.checkIns !== undefined ? todayStats.checkIns : checkInsToday,
      checkOutsToday: todayStats.checkOuts !== undefined ? todayStats.checkOuts : checkOutsToday,
      newBookingsToday: todayStats.newBookings !== undefined ? todayStats.newBookings : newBookingsToday,
    }
  }, [bookings, todayStats])

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-teal-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-teal-100 p-3">
              <Calendar size={24} className="text-teal-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-primary">สรุปการจอง</h2>
              <p className="text-sm text-slate-500 mt-0.5">ภาพรวมการจองทั้งหมด</p>
            </div>
          </div>
          <Link
            to="/admin/bookings"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm"
          >
            <span>ดูทั้งหมด</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* สถานะการจอง */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              สถานะการจ่ายเงิน
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* การจองทั้งหมด */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-slate-600">ทั้งหมด</p>
                <Calendar size={16} className="text-slate-500" />
              </div>
              <p className="text-2xl font-bold text-slate-700">{stats.total}</p>
            </div>

            {/* จ่ายเงินแล้ว */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-emerald-700">จ่ายเงินแล้ว</p>
                <CheckCircle size={16} className="text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-600">{stats.confirmed}</p>
              {stats.total > 0 && (
                <p className="text-xs text-emerald-600 mt-1">
                  {((stats.confirmed / stats.total) * 100).toFixed(0)}%
                </p>
              )}
            </div>

            {/* รอจ่ายเงิน */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-amber-700">รอจ่ายเงิน</p>
                <Clock size={16} className="text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              {stats.total > 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  {((stats.pending / stats.total) * 100).toFixed(0)}%
                </p>
              )}
            </div>

            {/* ยกเลิก */}
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-rose-700">ยกเลิก</p>
                <XCircle size={16} className="text-rose-600" />
              </div>
              <p className="text-2xl font-bold text-rose-600">{stats.cancelled}</p>
              {stats.total > 0 && (
                <p className="text-xs text-rose-600 mt-1">
                  {((stats.cancelled / stats.total) * 100).toFixed(0)}%
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 my-6"></div>

        {/* ช่วงเวลา */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              สถานะการเข้าพัก
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* การจองทั้งหมด */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-slate-600">ทั้งหมด</p>
                <Calendar size={16} className="text-slate-500" />
              </div>
              <p className="text-2xl font-bold text-slate-700">{stats.totalTimePeriod}</p>
            </div>

            {/* กำลังเข้าพัก */}
            <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-teal-700">กำลังเข้าพัก</p>
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
              </div>
              <p className="text-2xl font-bold text-teal-600">{stats.ongoing}</p>
            </div>

            {/* กำลังจะมาถึง */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-amber-700">กำลังจะมาถึง</p>
                <Clock size={16} className="text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-600">{stats.upcoming}</p>
            </div>

            {/* ผ่านมาแล้ว */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-slate-600">ผ่านมาแล้ว</p>
                <CheckCircle size={16} className="text-slate-500" />
              </div>
              <p className="text-2xl font-bold text-slate-600">{stats.past}</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 my-6"></div>

        {/* วันนี้ */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              วันนี้
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* เช็กอินวันนี้ */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-blue-700">เช็กอินวันนี้</p>
                <LogIn size={16} className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{stats.checkInsToday}</p>
            </div>

            {/* เช็กเอาต์วันนี้ */}
            <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-purple-700">เช็กเอาต์วันนี้</p>
                <LogOut size={16} className="text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">{stats.checkOutsToday}</p>
            </div>

            {/* การจองใหม่ */}
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-indigo-700">การจองใหม่</p>
                <Plus size={16} className="text-indigo-600" />
              </div>
              <p className="text-2xl font-bold text-indigo-600">{stats.newBookingsToday}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
