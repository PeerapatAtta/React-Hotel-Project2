import React, { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Calendar, CheckCircle, Clock, X } from 'lucide-react'
import MemberLayout from '../../components/member/MemberLayout'
import Card from '../../components/Card'
import Container from '../../components/layout/Container'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { bookingService } from '../../services/bookingService'
import { formatDate, formatPrice, formatDateTime } from '../../utils/formatters'
import { useAuth } from '../../hooks/useAuth'
import LoadingSpinner from '../../components/LoadingSpinner'
import Swal from 'sweetalert2'

export default function MemberBookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [cancellingId, setCancellingId] = useState(null)

  const fetchBookings = async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await bookingService.getBookingsByUserId(user.id)
      if (fetchError) {
        console.error('Error fetching bookings:', fetchError)
        setError(fetchError.message)
      } else {
        setBookings(data || [])
      }
    } catch (err) {
      console.error('Error:', err)
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [user])

  const handleCancelBooking = async (bookingId, roomName) => {
    const result = await Swal.fire({
      title: 'ยืนยันการยกเลิกการจอง',
      html: `คุณต้องการยกเลิกการจองห้อง <strong>${roomName}</strong> ใช่หรือไม่?<br/><br/><span class="text-sm text-slate-500">การยกเลิกไม่สามารถยกเลิกได้</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยกเลิกการจอง',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
    })

    if (!result.isConfirmed) {
      return
    }

    setCancellingId(bookingId)
    try {
      const { data, error: cancelError } = await bookingService.updateBookingStatus(
        bookingId,
        'cancelled'
      )

      if (cancelError) {
        console.error('Error cancelling booking:', cancelError)
        await Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: cancelError.message || 'ไม่สามารถยกเลิกการจองได้',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#0d9488',
        })
      } else {
        await Swal.fire({
          icon: 'success',
          title: 'ยกเลิกการจองสำเร็จ',
          text: 'การจองของคุณถูกยกเลิกแล้ว',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#0d9488',
        })
        // Refresh bookings list
        await fetchBookings()
      }
    } catch (err) {
      console.error('Exception cancelling booking:', err)
      await Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถยกเลิกการจองได้',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#0d9488',
      })
    } finally {
      setCancellingId(null)
    }
  }

  // ดึงการจองของ member นี้
  const memberBookings = bookings


  // Filter bookings
  const filteredBookings = useMemo(() => {
    return memberBookings.filter((booking) => {
      const matchesSearch =
        booking.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.room_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.guest_name?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = filterStatus === 'all' || booking.status === filterStatus

      return matchesSearch && matchesStatus
    })
  }, [memberBookings, searchQuery, filterStatus])


  const getStatusBadge = (status) => {
    const styles = {
      confirmed: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
      pending: 'bg-amber-100 text-amber-800 border border-amber-300',
      cancelled: 'bg-rose-100 text-rose-800 border border-rose-300',
    }
    const labels = {
      confirmed: 'ยืนยันแล้ว',
      pending: 'รอยืนยัน',
      cancelled: 'ยกเลิก',
    }
    return (
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  if (loading) {
    return (
      <MemberLayout>
        <Container>
          <LoadingSpinner text="กำลังโหลดข้อมูลการจอง..." />
        </Container>
      </MemberLayout>
    )
  }

  if (error) {
    return (
      <MemberLayout>
        <Container>
          <div className="text-center py-12">
            <p className="text-red-600">เกิดข้อผิดพลาด: {error}</p>
          </div>
        </Container>
      </MemberLayout>
    )
  }

  return (
    <MemberLayout>
      <div className="space-y-6">
        <Container>
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-primary">การจองของฉัน</h1>
            <p className="text-slate-600 mt-1">ดูและจัดการการจองทั้งหมดของคุณ</p>
          </div>

          {/* Search and Filter */}
          <Card className="p-6 mt-6 mb-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search size={18} />
                </div>
                <Input
                  placeholder="ค้นหาการจอง (รหัส, ชื่อห้อง)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Filter size={18} />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 pl-10 text-sm font-medium text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="all">ทุกสถานะ</option>
                  <option value="confirmed">ยืนยันแล้ว</option>
                  <option value="pending">รอยืนยัน</option>
                  <option value="cancelled">ยกเลิก</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Bookings List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">
                พบ {filteredBookings.length} การจอง
              </p>
            </div>

            {filteredBookings.length > 0 ? (
              <div className="space-y-4 mt-6">
                {filteredBookings.map((booking) => {
                  const checkIn = new Date(booking.check_in)
                  const checkOut = new Date(booking.check_out)
                  const isUpcoming = checkIn >= new Date()
                  const isPast = checkOut < new Date()

                  return (
                    <Card key={booking.id} className="p-6">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-semibold text-primary">
                              {booking.room_name}
                            </h3>
                            {getStatusBadge(booking.status)}
                            {isUpcoming && booking.status !== 'cancelled' && (
                              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                กำลังจะมาถึง
                              </span>
                            )}
                            {isPast && booking.status !== 'cancelled' && (
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                ผ่านมาแล้ว
                              </span>
                            )}
                          </div>

                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                              <p className="text-xs font-medium text-slate-500">รหัสการจอง</p>
                              <p className="text-sm font-semibold text-slate-700">{booking.id}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-500">วันที่เช็คอิน</p>
                              <p className="text-sm font-semibold text-slate-700">
                                {formatDate(booking.check_in)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-500">วันที่เช็คเอาท์</p>
                              <p className="text-sm font-semibold text-slate-700">
                                {formatDate(booking.check_out)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-500">จำนวนคืน</p>
                              <p className="text-sm font-semibold text-slate-700">
                                {booking.nights} คืน
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <span>👥 {booking.guests} คน</span>
                              <span className="font-semibold text-primary text-base">
                                {formatPrice(booking.total_price)}
                              </span>
                            </div>
                            {booking.created_at && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-auto">
                                <Clock size={12} className="text-slate-400 flex-shrink-0" />
                                <span>จองเมื่อ {formatDateTime(booking.created_at)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 lg:items-end">
                          <Link to={`/rooms/${booking.room_id}`}>
                            <Button variant="ghost" className="w-full lg:w-auto">
                              ดูรายละเอียดห้อง
                            </Button>
                          </Link>
                          {booking.status === 'pending' && (
                            <Button
                              variant="secondary"
                              className="w-full lg:w-auto"
                              onClick={() => handleCancelBooking(booking.id, booking.room_name)}
                              disabled={cancellingId === booking.id}
                            >
                              {cancellingId === booking.id ? 'กำลังยกเลิก...' : 'ยกเลิกการจอง'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  ไม่พบการจอง
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                  {searchQuery || filterStatus !== 'all'
                    ? 'ลองเปลี่ยนคำค้นหาหรือตัวกรอง'
                    : 'คุณยังไม่มีการจองใดๆ'}
                </p>
                {(!searchQuery && filterStatus === 'all') && (
                  <Link to="/rooms">
                    <Button>ค้นหาห้องพัก</Button>
                  </Link>
                )}
              </Card>
            )}
          </div>
        </Container>
      </div>
    </MemberLayout>
  )
}

