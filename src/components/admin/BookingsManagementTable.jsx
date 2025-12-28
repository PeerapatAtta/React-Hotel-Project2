import React, { useState } from 'react'
import { formatDate } from '../../utils/formatters'
import Badge from '../Badge'
import { formatPrice } from '../../utils/formatters'
import Button from '../Button'
import { Check, X, Eye, Phone, Mail } from 'lucide-react'
import Swal from 'sweetalert2'
import { bookingService } from '../../services/bookingService'

export default function BookingsManagementTable({ bookings, onRefresh }) {
  const [cancellingId, setCancellingId] = useState(null)
  const getStatusBadge = (status) => {
    const variants = {
      confirmed: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
      pending: 'bg-amber-100 text-amber-800 border border-amber-300',
      cancelled: 'bg-rose-100 text-rose-800 border border-rose-300',
    }
    return variants[status] || 'bg-slate-100 text-slate-700 border border-slate-300'
  }

  const getStatusText = (status) => {
    const texts = {
      confirmed: 'ยืนยันแล้ว',
      pending: 'รอยืนยัน',
      cancelled: 'ยกเลิก',
    }
    return texts[status] || status
  }

  const handleConfirm = (bookingId) => {
    Swal.fire({
      title: 'ยืนยันการจอง?',
      text: `คุณต้องการยืนยันการจอง "${bookingId}" ใช่หรือไม่?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ใช่, ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'info',
          title: 'แจ้งเตือน',
          text: `ฟีเจอร์ยืนยันการจอง "${bookingId}" จะเปิดใช้งานเร็วๆ นี้`,
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#0d9488',
        })
      }
    })
  }

  const handleCancel = async (bookingId) => {
    const result = await Swal.fire({
      title: 'ยกเลิกการจอง?',
      text: `คุณต้องการยกเลิกการจอง "${bookingId}" ใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่, ยกเลิก',
      cancelButtonText: 'ไม่',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
    })

    if (result.isConfirmed) {
      setCancellingId(bookingId)
      try {
        const { data, error } = await bookingService.updateBookingStatus(bookingId, 'cancelled')

        if (error) {
          console.error('Error cancelling booking:', error)
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: error.message || 'ไม่สามารถยกเลิกการจองได้ กรุณาลองใหม่อีกครั้ง',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#0d9488',
          })
        } else {
          Swal.fire({
            icon: 'success',
            title: 'สำเร็จ',
            text: `ยกเลิกการจอง "${bookingId}" เรียบร้อยแล้ว`,
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#0d9488',
          })
          
          // รีเฟรชข้อมูลการจอง
          if (onRefresh) {
            onRefresh()
          }
        }
      } catch (err) {
        console.error('Error:', err)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถยกเลิกการจองได้ กรุณาลองใหม่อีกครั้ง',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#0d9488',
        })
      } finally {
        setCancellingId(null)
      }
    }
  }

  const handleView = (bookingId) => {
    Swal.fire({
      icon: 'info',
      title: 'แจ้งเตือน',
      text: `ฟีเจอร์ดูรายละเอียดการจอง "${bookingId}" จะเปิดใช้งานเร็วๆ นี้`,
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#0d9488',
    })
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-12 shadow-sm text-center">
        <p className="text-slate-500">ไม่พบการจองที่ค้นหา</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                รหัสการจอง
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                ห้องพัก
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                ผู้เข้าพัก
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                วันที่เข้าพัก
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                จำนวนคืน/คน
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                ราคารวม
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                สถานะ
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                การจัดการ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.map((booking) => {
              // รองรับทั้ง snake_case และ camelCase
              const roomName = booking.roomName || booking.room_name
              const guestName = booking.guestName || booking.guest_name
              const checkIn = booking.checkIn || booking.check_in
              const checkOut = booking.checkOut || booking.check_out
              const totalPrice = booking.totalPrice || booking.total_price
              const createdAt = booking.createdAt || booking.created_at

              return (
                <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-primary">{booking.id}</span>
                    <p className="text-xs text-slate-500 mt-1">
                      {createdAt ? new Date(createdAt).toLocaleDateString('th-TH') : '-'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-700">{roomName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{guestName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail size={12} className="text-slate-400" />
                        <p className="text-xs text-slate-500">{booking.email}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone size={12} className="text-slate-400" />
                        <p className="text-xs text-slate-500">{booking.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm text-slate-700">{formatDate(checkIn)}</p>
                      <p className="text-xs text-slate-500">ถึง {formatDate(checkOut)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <span className="text-sm text-slate-700">{booking.nights} คืน</span>
                      <p className="text-xs text-slate-500">{booking.guests} คน</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-primary">
                      {formatPrice(totalPrice)}
                    </span>
                  </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={getStatusBadge(booking.status)}>
                    {getStatusText(booking.status)}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => handleView(booking.id)}
                      className="p-2"
                      title="ดูรายละเอียด"
                    >
                      <Eye size={16} />
                    </Button>
                    {booking.status === 'pending' && (
                      <>
                        <Button
                          variant="ghost"
                          onClick={() => handleConfirm(booking.id)}
                          className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                          title="ยืนยันการจอง"
                        >
                          <Check size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                          title="ยกเลิกการจอง"
                        >
                          <X size={16} />
                        </Button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <Button
                        variant="ghost"
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancellingId === booking.id}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                        title="ยกเลิกการจอง"
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

