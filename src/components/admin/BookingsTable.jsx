import React from 'react'
import { formatDate } from '../../utils/formatters'
import Badge from '../Badge'
import { formatPrice } from '../../utils/formatters'

export default function BookingsTable({ bookings, showAll = false }) {
  const displayBookings = showAll ? bookings : bookings.slice(0, 5)

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
      confirmed: 'จ่ายเงินแล้ว',
      pending: 'รอจ่ายเงิน',
      cancelled: 'ยกเลิก',
    }
    return texts[status] || status
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-primary">
          {showAll ? 'การจองทั้งหมด' : 'การจองล่าสุด'}
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                รหัสการจอง
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                ห้องพัก
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                ผู้เข้าพัก
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                วันที่เข้าพัก
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                จำนวนคืน
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                ราคารวม
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                สถานะ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayBookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-primary">{booking.id}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">{booking.roomName}</span>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{booking.guestName}</p>
                    <p className="text-xs text-slate-500">{booking.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p className="text-sm text-slate-700">{formatDate(booking.checkIn)}</p>
                    <p className="text-xs text-slate-500">ถึง {formatDate(booking.checkOut)}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-slate-700">{booking.nights} คืน</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-primary">
                    {formatPrice(booking.totalPrice)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={getStatusBadge(booking.status)}>
                    {getStatusText(booking.status)}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!showAll && bookings.length > 5 && (
        <div className="p-4 border-t border-slate-100 text-center">
          <button className="text-sm font-semibold text-teal-600 hover:text-teal-700">
            ดูทั้งหมด ({bookings.length} รายการ)
          </button>
        </div>
      )}
    </div>
  )
}

