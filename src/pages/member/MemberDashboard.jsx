import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, CheckCircle, LogIn, List, X } from 'lucide-react'
import Card from '../../components/Card'
import Container from '../../components/layout/Container'
import SectionTitle from '../../components/SectionTitle'
import Button from '../../components/Button'
import { bookingService } from '../../services/bookingService'
import { formatDate, formatPrice, formatDateTime } from '../../utils/formatters'
import { useAuth } from '../../hooks/useAuth'
import MemberLayout from '../../components/member/MemberLayout'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function MemberDashboard() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const { data, error } = await bookingService.getBookingsByUserId(user.id)
        if (error) {
          console.error('Error fetching bookings:', error)
        } else {
          setBookings(data || [])
        }
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [user])

  // แสดงเฉพาะ 5 รายการล่าสุด
  const displayBookings = bookings.slice(0, 5)

  // คำนวณการจองต่างๆ
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // กรองเฉพาะการจองที่ไม่ใช่ cancelled
  const activeBookings = bookings.filter(b => b.status !== 'cancelled')

  const arrivedBookings = activeBookings.filter(b => {
    const checkIn = new Date(b.check_in)
    checkIn.setHours(0, 0, 0, 0)
    const checkOut = new Date(b.check_out)
    checkOut.setHours(0, 0, 0, 0)
    return checkIn <= today && checkOut >= today
  })

  const upcomingBookings = activeBookings.filter(b => {
    const checkIn = new Date(b.check_in)
    checkIn.setHours(0, 0, 0, 0)
    return checkIn > today
  })

  const pastBookings = activeBookings.filter(b => {
    const checkOut = new Date(b.check_out)
    checkOut.setHours(0, 0, 0, 0)
    return checkOut < today
  })

  // Calculate statistics - แบ่งตามช่วงเวลา
  const timeStats = useMemo(() => {
    return {
      total: activeBookings.length,
      arrived: arrivedBookings.length,
      upcoming: upcomingBookings.length,
      past: pastBookings.length
    }
  }, [activeBookings, arrivedBookings, upcomingBookings, pastBookings])

  // Calculate statistics - แบ่งตามสถานะ
  const statusStats = useMemo(() => {
    const total = bookings.length
    const confirmed = bookings.filter(b => b.status === 'confirmed').length
    const pending = bookings.filter(b => b.status === 'pending').length
    const cancelled = bookings.filter(b => b.status === 'cancelled').length

    return { total, confirmed, pending, cancelled }
  }, [bookings])

  return (
    <MemberLayout>
      <div className="space-y-6">
        <Container>
          <div className="space-y-4">
            {/* Welcome Section */}
            <div>
              <h1 className="text-3xl font-bold text-primary">หน้าสรุปข้อมูลสมาชิก</h1>
              <p className="text-slate-600 mt-1">ยินดีต้อนรับ, {user?.name || 'สมาชิก'}</p>
            </div>

            {/* Stats Summary - แบ่งตามช่วงเวลา */}
            <Card className="p-4">
              <h2 className="text-base font-semibold text-slate-700 mb-2">สรุปการจองตามช่วงเวลา</h2>
              <div className="grid gap-2 md:grid-cols-4">
                <div className="bg-white rounded-lg border border-slate-200 p-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-600">การจองทั้งหมด</p>
                      <p className="text-xl font-bold text-slate-700 mt-0.5">{timeStats.total}</p>
                    </div>
                    <div className="rounded-lg bg-teal-50 p-1.5">
                      <Calendar size={16} className="text-teal-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-600">การจองที่กำลังเข้าพัก</p>
                      <p className="text-xl font-bold text-emerald-600 mt-0.5">{timeStats.arrived}</p>
                    </div>
                    <div className="rounded-lg bg-emerald-50 p-1.5">
                      <LogIn size={16} className="text-emerald-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-600">การจองที่กำลังจะมาถึง</p>
                      <p className="text-xl font-bold text-amber-600 mt-0.5">{timeStats.upcoming}</p>
                    </div>
                    <div className="rounded-lg bg-amber-50 p-1.5">
                      <Clock size={16} className="text-amber-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-600">การจองที่ผ่านมา</p>
                      <p className="text-xl font-bold text-slate-600 mt-0.5">{timeStats.past}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-1.5">
                      <CheckCircle size={16} className="text-slate-600" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Stats Summary - แบ่งตามสถานะ */}
            <Card className="p-4">
              <h2 className="text-base font-semibold text-slate-700 mb-2">สรุปการจองตามสถานะ</h2>
              <div className="grid gap-2 md:grid-cols-4">
                <div className="bg-white rounded-lg border border-slate-200 p-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-600">การจองทั้งหมด</p>
                      <p className="text-xl font-bold text-slate-700 mt-0.5">{statusStats.total}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-1.5">
                      <List size={16} className="text-slate-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-600">ยืนยันแล้ว</p>
                      <p className="text-xl font-bold text-emerald-600 mt-0.5">{statusStats.confirmed}</p>
                    </div>
                    <div className="rounded-lg bg-emerald-50 p-1.5">
                      <CheckCircle size={16} className="text-emerald-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-600">รอยืนยัน</p>
                      <p className="text-xl font-bold text-amber-600 mt-0.5">{statusStats.pending}</p>
                    </div>
                    <div className="rounded-lg bg-amber-50 p-1.5">
                      <Clock size={16} className="text-amber-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-600">ยกเลิก</p>
                      <p className="text-xl font-bold text-rose-600 mt-0.5">{statusStats.cancelled}</p>
                    </div>
                    <div className="rounded-lg bg-rose-50 p-1.5">
                      <X size={16} className="text-rose-600" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Recent Bookings */}
            {loading ? (
              <Card className="p-12">
                <LoadingSpinner text="กำลังโหลดข้อมูล..." />
              </Card>
            ) : displayBookings.length > 0 ? (
              <Card className="p-5 md:p-6">
                <SectionTitle
                  title="การจองล่าสุด"
                  description="รายการการจองของคุณ"
                />
                <div className="mt-4 space-y-3">
                  {displayBookings.map((booking) => {
                    // Parse dates and normalize to start of day
                    const checkInDate = new Date(booking.check_in)
                    const checkOutDate = new Date(booking.check_out)
                    const today = new Date()
                    const checkIn = new Date(checkInDate.getFullYear(), checkInDate.getMonth(), checkInDate.getDate())
                    const checkOut = new Date(checkOutDate.getFullYear(), checkOutDate.getMonth(), checkOutDate.getDate())
                    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate())

                    // Calculate status based on dates
                    const isCurrentlyStaying =
                      booking.status !== 'cancelled' &&
                      checkIn.getTime() <= todayNormalized.getTime() &&
                      checkOut.getTime() > todayNormalized.getTime()

                    const isUpcoming =
                      booking.status !== 'cancelled' &&
                      checkIn.getTime() > todayNormalized.getTime() &&
                      !isCurrentlyStaying

                    const isPast =
                      booking.status !== 'cancelled' &&
                      checkOut.getTime() <= todayNormalized.getTime() &&
                      !isCurrentlyStaying

                    return (
                      <div
                        key={booking.id}
                        className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-start sm:justify-between"
                      >
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-semibold text-primary">{booking.room_name}</h3>
                            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-700'
                              : booking.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                              }`}>
                              {booking.status === 'confirmed' ? 'ยืนยันแล้ว' :
                                booking.status === 'pending' ? 'รอยืนยัน' : 'ยกเลิก'}
                            </span>
                            {isCurrentlyStaying && (
                              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 border border-green-300">
                                กำลังเข้าพัก
                              </span>
                            )}
                            {isUpcoming && (
                              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 border border-blue-300">
                                กำลังจะมาถึง
                              </span>
                            )}
                            {isPast && (
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 border border-slate-300">
                                ผ่านมาแล้ว
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} className="text-slate-400" />
                              {formatDate(booking.check_in)} - {formatDate(booking.check_out)}
                            </span>
                            <span>{booking.nights} คืน</span>
                            <span>{booking.guests} คน</span>
                            <span className="font-semibold text-primary">{formatPrice(booking.total_price)}</span>
                          </div>
                          {booking.created_at && (
                            <div className="flex items-center gap-1 text-xs text-slate-500 pt-1">
                              <Clock size={12} className="text-slate-400" />
                              <span>จองเมื่อ {formatDateTime(booking.created_at)}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-start pt-1">
                          <Link to={`/rooms/${booking.room_id}`}>
                            <Button variant="ghost" className="w-full sm:w-auto text-sm">
                              ดูรายละเอียดห้องพัก
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">ยังไม่มีการจอง</h3>
                <p className="text-sm text-slate-500 mb-6">เริ่มต้นการจองห้องพักของคุณเลย</p>
                <Link to="/rooms">
                  <Button>ค้นหาห้องพัก</Button>
                </Link>
              </Card>
            )}
          </div>
        </Container>
      </div>
    </MemberLayout>
  )
}
