import React, { useState, useEffect } from 'react'
import { X, Calendar, Users, Mail, Phone, Home, CreditCard, Hash, Clock } from 'lucide-react'
import Button from '../Button'
import Badge from '../Badge'
import { bookingService } from '../../services/bookingService'
import Swal from 'sweetalert2'
import { formatPrice, formatDate } from '../../utils/formatters'
import LoadingSpinner from '../LoadingSpinner'

export default function ViewBookingModal({ isOpen, onClose, bookingId }) {
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchBookingDetails()
    }
  }, [isOpen, bookingId])

  const fetchBookingDetails = async () => {
    setLoading(true)
    try {
      const { data, error } = await bookingService.getBookingById(bookingId)
      if (error) {
        console.error('Error fetching booking:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.message || 'ไม่สามารถโหลดข้อมูลการจองได้',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#0d9488',
        })
        onClose()
      } else {
        setBooking(data)
      }
    } catch (err) {
      console.error('Error:', err)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถโหลดข้อมูลการจองได้',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#0d9488',
      })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setBooking(null)
    onClose()
  }

  const getStatusBadge = (status) => {
    const variants = {
      confirmed: 'bg-emerald-200 text-emerald-900 border-2 border-emerald-400 font-semibold',
      pending: 'bg-amber-200 text-amber-900 border-2 border-amber-400 font-semibold',
      cancelled: 'bg-rose-200 text-rose-900 border-2 border-rose-400 font-semibold',
    }
    return variants[status] || 'bg-slate-200 text-slate-800 border-2 border-slate-400 font-semibold'
  }

  const getStatusText = (status) => {
    const texts = {
      confirmed: 'ยืนยันแล้ว',
      pending: 'รอยืนยัน',
      cancelled: 'ยกเลิก',
    }
    return texts[status] || status
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full md:w-[60%] max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-800">รายละเอียดการจอง</h2>
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
        <div className="max-h-[70vh] overflow-y-auto p-6">
          {loading ? (
            <div className="py-12">
              <LoadingSpinner text="กำลังโหลดข้อมูล..." />
            </div>
          ) : booking ? (
            <div className="space-y-6">
              {/* Booking ID & Status */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Hash size={20} className="text-slate-400" />
                  <span className="text-lg font-semibold text-primary">{booking.id}</span>
                </div>
                <Badge className={getStatusBadge(booking.status)}>
                  {getStatusText(booking.status)}
                </Badge>
              </div>

              {/* Guest Information */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="mb-4 text-lg font-semibold text-slate-800">ข้อมูลผู้เข้าพัก</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <Users size={20} className="mt-0.5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">ชื่อผู้เข้าพัก</p>
                      <p className="font-medium text-slate-800">
                        {booking.guest_name || booking.guestName || '-'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail size={20} className="mt-0.5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">อีเมล</p>
                      <p className="font-medium text-slate-800">{booking.email || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone size={20} className="mt-0.5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">เบอร์โทรศัพท์</p>
                      <p className="font-medium text-slate-800">{booking.phone || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Room Information */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="mb-4 text-lg font-semibold text-slate-800">ข้อมูลห้องพัก</h3>
                <div className="flex items-start gap-3">
                  <Home size={20} className="mt-0.5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">ชื่อห้อง</p>
                    <p className="font-medium text-slate-800">
                      {booking.room_name || booking.roomName || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Dates */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="mb-4 text-lg font-semibold text-slate-800">วันที่เข้าพัก</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <Calendar size={20} className="mt-0.5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">วันที่เช็กอิน</p>
                      <p className="font-medium text-slate-800">
                        {formatDate(booking.check_in || booking.checkIn)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar size={20} className="mt-0.5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">วันที่เช็กเอาท์</p>
                      <p className="font-medium text-slate-800">
                        {formatDate(booking.check_out || booking.checkOut)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="mb-4 text-lg font-semibold text-slate-800">รายละเอียดการจอง</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <Clock size={20} className="mt-0.5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">จำนวนคืน</p>
                      <p className="font-medium text-slate-800">{booking.nights || 0} คืน</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users size={20} className="mt-0.5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">จำนวนผู้เข้าพัก</p>
                      <p className="font-medium text-slate-800">{booking.guests || 0} คน</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Information */}
              <div className="rounded-xl border-2 border-teal-200 bg-teal-50 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard size={24} className="text-teal-600" />
                    <div>
                      <p className="text-xs text-teal-600">ราคารวม</p>
                      <p className="text-2xl font-bold text-teal-700">
                        {formatPrice(booking.total_price || booking.totalPrice || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Created Date */}
              {booking.created_at && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock size={16} />
                    <span>
                      สร้างเมื่อ {formatDate(booking.created_at || booking.createdAt)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-slate-500">ไม่พบข้อมูลการจอง</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6">
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

