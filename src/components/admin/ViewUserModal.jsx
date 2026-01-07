import React, { useState, useEffect } from 'react'
import { X, Mail, Phone, User, Shield, Calendar, Clock, Hash, CheckCircle, Ban } from 'lucide-react'
import Button from '../Button'
import Badge from '../Badge'
import { userService } from '../../services/userService'
import { bookingService } from '../../services/bookingService'
import { supabase } from '../../lib/supabaseClient'
import Swal from 'sweetalert2'
import { formatDate, formatPrice } from '../../utils/formatters'
import LoadingSpinner from '../LoadingSpinner'

export default function ViewUserModal({ isOpen, onClose, userId }) {
  const [user, setUser] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails()
    }
  }, [isOpen, userId])

  const fetchUserDetails = async () => {
    setLoading(true)
    try {
      // ดึงข้อมูลผู้ใช้
      const { data: userData, error: userError } = await userService.getUserById(userId)
      
      if (userError) {
        console.error('Error fetching user:', userError)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: userError.message || 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#0d9488',
        })
        onClose()
        return
      }

      if (!userData) {
        Swal.fire({
          icon: 'error',
          title: 'ไม่พบข้อมูล',
          text: 'ไม่พบข้อมูลผู้ใช้',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#0d9488',
        })
        onClose()
        return
      }

      setUser(userData)

      // ดึงข้อมูลการจองของผู้ใช้
      const { data: bookingsData, error: bookingsError } = await bookingService.getBookingsByUserId(userId)
      
      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError)
        // ไม่แสดง error เพราะการจองอาจจะไม่มี
        setBookings([])
      } else {
        setBookings(bookingsData || [])
      }
    } catch (err) {
      console.error('Error:', err)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#0d9488',
      })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setUser(null)
    setBookings([])
    onClose()
  }

  const getStatusBadge = (status) => {
    const variants = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-red-100 text-red-700',
    }
    return variants[status] || 'bg-slate-100 text-slate-700'
  }

  const getStatusText = (status) => {
    const texts = {
      active: 'ใช้งาน',
      inactive: 'ไม่ใช้งาน',
    }
    return texts[status] || status
  }

  const getRoleBadge = (role) => {
    const variants = {
      admin: 'bg-purple-100 text-purple-700',
      member: 'bg-blue-100 text-blue-700',
    }
    return variants[role] || 'bg-slate-100 text-slate-700'
  }

  const getRoleText = (role) => {
    const texts = {
      admin: 'ผู้ดูแลระบบ',
      member: 'สมาชิก',
    }
    return texts[role] || role
  }

  const formatDateThai = (dateString) => {
    if (!dateString) {
      return 'ยังไม่เคยเข้าสู่ระบบ'
    }
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'ยังไม่เคยเข้าสู่ระบบ'
      }
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch (error) {
      return 'ยังไม่เคยเข้าสู่ระบบ'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full md:w-[70%] max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-6">
          <h2 className="text-2xl font-bold text-slate-800">รายละเอียดผู้ใช้</h2>
          <Button
            variant="ghost"
            onClick={handleClose}
            className="p-2! min-w-[36px]"
            title="ปิด"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6">
          {loading ? (
            <div className="py-12">
              <LoadingSpinner text="กำลังโหลดข้อมูล..." />
            </div>
          ) : user ? (
            <div className="space-y-6">
              {/* User ID & Status */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Hash size={20} className="text-slate-400" />
                  <span className="text-sm font-mono text-slate-600 break-all">{user.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getRoleBadge(user.role)}>
                    {getRoleText(user.role)}
                  </Badge>
                  <Badge className={getStatusBadge(user.status)}>
                    {user.status === 'active' ? <CheckCircle size={14} className="inline mr-1" /> : <Ban size={14} className="inline mr-1" />}
                    {getStatusText(user.status)}
                  </Badge>
                </div>
              </div>

              {/* User Information */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="mb-4 text-lg font-semibold text-slate-800">ข้อมูลผู้ใช้</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <User size={20} className="mt-0.5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">ชื่อ</p>
                      <p className="font-medium text-slate-800">{user.name || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail size={20} className="mt-0.5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">อีเมล</p>
                      <p className="font-medium text-slate-800">{user.email || '-'}</p>
                    </div>
                  </div>
                  {user.phone && (
                    <div className="flex items-start gap-3">
                      <Phone size={20} className="mt-0.5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">เบอร์โทรศัพท์</p>
                        <p className="font-medium text-slate-800">{user.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Statistics */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-teal-100 p-2">
                      <Calendar size={20} className="text-teal-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">จำนวนการจอง</p>
                      <p className="text-xl font-bold text-slate-800">{bookings.length || 0} ครั้ง</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2">
                      <Clock size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">เข้าสู่ระบบล่าสุด</p>
                      <p className="text-sm font-medium text-slate-800">
                        {formatDateThai(user.lastLogin || user.last_login)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-purple-100 p-2">
                      <Calendar size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">วันที่สร้างบัญชี</p>
                      <p className="text-sm font-medium text-slate-800">
                        {user.created_at ? formatDateThai(user.created_at) : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bookings List */}
              {bookings.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                  <h3 className="mb-4 text-lg font-semibold text-slate-800">ประวัติการจอง ({bookings.length} รายการ)</h3>
                  <div className="space-y-3">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="rounded-lg border border-slate-200 bg-white p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-slate-800">{booking.id}</span>
                              <Badge className={
                                booking.status === 'confirmed' ? 'bg-emerald-200 text-emerald-900' :
                                booking.status === 'pending' ? 'bg-amber-200 text-amber-900' :
                                booking.status === 'cancelled' ? 'bg-rose-200 text-rose-900' :
                                'bg-slate-200 text-slate-800'
                              }>
                                {booking.status === 'confirmed' ? 'ยืนยันแล้ว' :
                                 booking.status === 'pending' ? 'รอยืนยัน' :
                                 booking.status === 'cancelled' ? 'ยกเลิก' :
                                 booking.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 mb-1">
                              <span className="font-medium">{booking.room_name || booking.roomName || '-'}</span>
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatDate(booking.check_in || booking.checkIn)} - {formatDate(booking.check_out || booking.checkOut)}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {booking.nights || 0} คืน • {booking.guests || 0} คน • {formatPrice(booking.total_price || booking.totalPrice || 0)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {bookings.length > 5 && (
                      <p className="text-sm text-slate-500 text-center pt-2">
                        แสดง 5 รายการล่าสุด จากทั้งหมด {bookings.length} รายการ
                      </p>
                    )}
                  </div>
                </div>
              )}

              {bookings.length === 0 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                  <h3 className="mb-2 text-lg font-semibold text-slate-800">ประวัติการจอง</h3>
                  <p className="text-sm text-slate-500">ยังไม่มีการจอง</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-slate-500">ไม่พบข้อมูลผู้ใช้</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-slate-200 bg-white p-6">
          <div className="flex justify-end">
            <Button variant="secondary" onClick={handleClose}>
              ปิด
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

