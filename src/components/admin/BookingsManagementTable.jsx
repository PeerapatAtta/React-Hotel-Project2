import React, { useState } from 'react'
import { formatDate } from '../../utils/formatters'
import Badge from '../Badge'
import { formatPrice } from '../../utils/formatters'
import Button from '../Button'
import { Check, X, Eye, Phone, Mail, ArrowUpDown, ArrowUp, ArrowDown, Trash2 } from 'lucide-react'
import Swal from 'sweetalert2'
import { bookingService } from '../../services/bookingService'
import ViewBookingModal from './ViewBookingModal'

export default function BookingsManagementTable({ bookings, onRefresh, sortField, sortDirection, onSort }) {
  const [cancellingId, setCancellingId] = useState(null)
  const [confirmingId, setConfirmingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [viewBookingId, setViewBookingId] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
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

  const handleConfirm = async (bookingId) => {
    const result = await Swal.fire({
      title: 'ยืนยันการจอง?',
      text: `คุณต้องการยืนยันการจอง "${bookingId}" ใช่หรือไม่?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ใช่, ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
    })

    if (result.isConfirmed) {
      setConfirmingId(bookingId)
      try {
        const { error } = await bookingService.updateBookingStatus(bookingId, 'confirmed')

        if (error) {
          console.error('Error confirming booking:', error)
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: error.message || 'ไม่สามารถยืนยันการจองได้ กรุณาลองใหม่อีกครั้ง',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#0d9488',
          })
        } else {
          Swal.fire({
            icon: 'success',
            title: 'ยืนยันสำเร็จ',
            text: `ยืนยันการจอง "${bookingId}" เรียบร้อยแล้ว`,
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
          text: 'ไม่สามารถยืนยันการจองได้ กรุณาลองใหม่อีกครั้ง',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#0d9488',
        })
      } finally {
        setConfirmingId(null)
      }
    }
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
        const { error } = await bookingService.updateBookingStatus(bookingId, 'cancelled')

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
    setViewBookingId(bookingId)
    setIsViewModalOpen(true)
  }

  const handleDelete = async (bookingId) => {
    const result = await Swal.fire({
      title: 'ลบการจอง?',
      text: `คุณต้องการลบการจอง "${bookingId}" ออกจากระบบใช่หรือไม่? การกระทำนี้ไม่สามารถยกเลิกได้`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่, ลบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      dangerMode: true,
    })

    if (result.isConfirmed) {
      setDeletingId(bookingId)
      try {
        const { error } = await bookingService.deleteBooking(bookingId)

        if (error) {
          console.error('Error deleting booking:', error)
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: error.message || 'ไม่สามารถลบการจองได้ กรุณาลองใหม่อีกครั้ง',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#0d9488',
          })
        } else {
          Swal.fire({
            icon: 'success',
            title: 'สำเร็จ',
            text: `ลบการจอง "${bookingId}" เรียบร้อยแล้ว`,
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
          text: 'ไม่สามารถลบการจองได้ กรุณาลองใหม่อีกครั้ง',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#0d9488',
        })
      } finally {
        setDeletingId(null)
      }
    }
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
              <th 
                className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors ${sortField === 'id' ? 'bg-slate-100' : ''}`}
                onClick={() => onSort && onSort('id')}
              >
                <div className="flex items-center gap-1">
                  รหัสการจอง
                  {sortField === 'id' ? (
                    sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                  ) : (
                    <ArrowUpDown size={14} className="opacity-40" />
                  )}
                </div>
              </th>
              <th 
                className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors ${sortField === 'room_name' ? 'bg-slate-100' : ''}`}
                onClick={() => onSort && onSort('room_name')}
              >
                <div className="flex items-center gap-1">
                  ห้องพัก
                  {sortField === 'room_name' ? (
                    sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                  ) : (
                    <ArrowUpDown size={14} className="opacity-40" />
                  )}
                </div>
              </th>
              <th 
                className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors ${sortField === 'guest_name' ? 'bg-slate-100' : ''}`}
                onClick={() => onSort && onSort('guest_name')}
              >
                <div className="flex items-center gap-1">
                  ผู้เข้าพัก
                  {sortField === 'guest_name' ? (
                    sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                  ) : (
                    <ArrowUpDown size={14} className="opacity-40" />
                  )}
                </div>
              </th>
              <th 
                className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors ${sortField === 'check_in' ? 'bg-slate-100' : ''}`}
                onClick={() => onSort && onSort('check_in')}
              >
                <div className="flex items-center gap-1">
                  วันที่เข้าพัก
                  {sortField === 'check_in' ? (
                    sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                  ) : (
                    <ArrowUpDown size={14} className="opacity-40" />
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                จำนวนคืน/คน
              </th>
              <th 
                className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors ${sortField === 'total_price' ? 'bg-slate-100' : ''}`}
                onClick={() => onSort && onSort('total_price')}
              >
                <div className="flex items-center gap-1">
                  ราคารวม
                  {sortField === 'total_price' ? (
                    sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                  ) : (
                    <ArrowUpDown size={14} className="opacity-40" />
                  )}
                </div>
              </th>
              <th 
                className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors ${sortField === 'status' ? 'bg-slate-100' : ''}`}
                onClick={() => onSort && onSort('status')}
              >
                <div className="flex items-center gap-1">
                  สถานะ
                  {sortField === 'status' ? (
                    sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                  ) : (
                    <ArrowUpDown size={14} className="opacity-40" />
                  )}
                </div>
              </th>
              <th 
                className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors ${sortField === 'creator_name' ? 'bg-slate-100' : ''}`}
                onClick={() => onSort && onSort('creator_name')}
              >
                <div className="flex items-center gap-1">
                  ผู้สร้าง
                  {sortField === 'creator_name' ? (
                    sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                  ) : (
                    <ArrowUpDown size={14} className="opacity-40" />
                  )}
                </div>
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
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {booking.profiles?.name || booking.profiles?.email || '-'}
                    </p>
                    {booking.profiles?.email && booking.profiles?.name && (
                      <p className="text-xs text-slate-500 mt-1">{booking.profiles.email}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => handleView(booking.id)}
                      className="p-2! min-w-[36px]"
                      title="ดูรายละเอียด"
                    >
                      <Eye size={22} />
                    </Button>
                    {booking.status === 'pending' && (
                      <>
                        <Button
                          variant="ghost"
                          onClick={() => handleConfirm(booking.id)}
                          disabled={confirmingId === booking.id}
                          className="p-2! min-w-[36px] text-green-600 hover:text-green-700 hover:bg-green-50 disabled:opacity-50"
                          title="ยืนยันการจอง"
                        >
                          <Check size={22} />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="p-2! min-w-[36px] text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                          title="ยกเลิกการจอง"
                        >
                          <X size={22} />
                        </Button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <Button
                        variant="ghost"
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancellingId === booking.id}
                        className="p-2! min-w-[36px] text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                        title="ยกเลิกการจอง"
                      >
                        <X size={22} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      onClick={() => handleDelete(booking.id)}
                      disabled={deletingId === booking.id}
                      className="p-2! min-w-[36px] text-red-700 hover:text-red-800 hover:bg-red-50 disabled:opacity-50"
                      title="ลบการจอง"
                    >
                      <Trash2 size={22} />
                    </Button>
                  </div>
                </td>
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* View Booking Modal */}
      <ViewBookingModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setViewBookingId(null)
        }}
        bookingId={viewBookingId}
      />
    </div>
  )
}

