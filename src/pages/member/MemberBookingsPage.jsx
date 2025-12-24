import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Calendar, CheckCircle, Clock, X } from 'lucide-react'
import MemberLayout from '../../components/member/MemberLayout'
import Card from '../../components/Card'
import Container from '../../components/layout/Container'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { bookings } from '../../data/bookings'
import { formatDate, formatPrice } from '../../utils/formatters'
import { useAuth } from '../../context/AuthContext'

export default function MemberBookingsPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // ข้อมูล mockup user ถ้ายังไม่มี user
  const mockUser = user || {
    id: '1',
    name: 'สมชาย ใจดี',
    email: 'somchai@example.com',
    role: 'member',
  }

  // ดึงการจองของ member นี้ (mockup)
  let memberBookings = bookings.filter(b => b.email === mockUser?.email)

  // ถ้ายังไม่มีการจอง ให้แสดงข้อมูล mockup
  if (memberBookings.length === 0) {
    memberBookings = [
      {
        id: 'BK001',
        roomId: 'deluxe-city',
        roomName: 'Deluxe City View',
        guestName: mockUser.name,
        email: mockUser.email,
        phone: '081-234-5678',
        checkIn: '2025-01-15',
        checkOut: '2025-01-17',
        nights: 2,
        guests: 2,
        totalPrice: 6400,
        status: 'confirmed',
        createdAt: '2025-01-10T10:30:00',
      },
      {
        id: 'BK002',
        roomId: 'garden-suite',
        roomName: 'Garden Suite',
        guestName: mockUser.name,
        email: mockUser.email,
        phone: '081-234-5678',
        checkIn: '2025-01-20',
        checkOut: '2025-01-22',
        nights: 2,
        guests: 4,
        totalPrice: 9600,
        status: 'pending',
        createdAt: '2025-01-12T14:20:00',
      },
      {
        id: 'BK003',
        roomId: 'studio-loft',
        roomName: 'Studio Loft',
        guestName: mockUser.name,
        email: mockUser.email,
        phone: '081-234-5678',
        checkIn: '2025-01-18',
        checkOut: '2025-01-19',
        nights: 1,
        guests: 2,
        totalPrice: 2600,
        status: 'confirmed',
        createdAt: '2025-01-11T09:15:00',
      },
      {
        id: 'BK004',
        roomId: 'penthouse-sky',
        roomName: 'Penthouse Sky Lounge',
        guestName: mockUser.name,
        email: mockUser.email,
        phone: '081-234-5678',
        checkIn: '2025-01-25',
        checkOut: '2025-01-28',
        nights: 3,
        guests: 5,
        totalPrice: 18600,
        status: 'confirmed',
        createdAt: '2025-01-13T16:45:00',
      },
      {
        id: 'BK005',
        roomId: 'executive-horizon',
        roomName: 'Executive Horizon',
        guestName: mockUser.name,
        email: mockUser.email,
        phone: '081-234-5678',
        checkIn: '2025-01-22',
        checkOut: '2025-01-24',
        nights: 2,
        guests: 2,
        totalPrice: 7600,
        status: 'cancelled',
        createdAt: '2025-01-14T11:20:00',
      },
      {
        id: 'BK006',
        roomId: 'deluxe-city',
        roomName: 'Deluxe City View',
        guestName: mockUser.name,
        email: mockUser.email,
        phone: '081-234-5678',
        checkIn: '2024-12-20',
        checkOut: '2024-12-22',
        nights: 2,
        guests: 2,
        totalPrice: 6400,
        status: 'confirmed',
        createdAt: '2024-12-15T10:30:00',
      },
    ]
  }

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return memberBookings.filter((booking) => {
      const matchesSearch =
        booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.guestName.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = filterStatus === 'all' || booking.status === filterStatus

      return matchesSearch && matchesStatus
    })
  }, [memberBookings, searchQuery, filterStatus])

  // Calculate statistics
  const stats = useMemo(() => {
    const confirmed = filteredBookings.filter(b => b.status === 'confirmed').length
    const pending = filteredBookings.filter(b => b.status === 'pending').length
    const cancelled = filteredBookings.filter(b => b.status === 'cancelled').length
    const upcoming = filteredBookings.filter(b => {
      const checkIn = new Date(b.checkIn)
      return checkIn >= new Date() && b.status !== 'cancelled'
    }).length

    return { confirmed, pending, cancelled, upcoming }
  }, [filteredBookings])

  const getStatusBadge = (status) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
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

  return (
    <MemberLayout>
      <div className="space-y-6">
        <Container>
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-primary">การจองของฉัน</h1>
            <p className="text-slate-600 mt-1">ดูและจัดการการจองทั้งหมดของคุณ</p>
          </div>

          {/* Stats Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">ยืนยันแล้ว</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{stats.confirmed}</p>
                </div>
                <div className="rounded-xl bg-green-50 p-3">
                  <CheckCircle size={20} className="text-green-600" />
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">รอยืนยัน</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
                </div>
                <div className="rounded-xl bg-yellow-50 p-3">
                  <Clock size={20} className="text-yellow-600" />
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">ยกเลิก</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{stats.cancelled}</p>
                </div>
                <div className="rounded-xl bg-red-50 p-3">
                  <X size={20} className="text-red-600" />
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">กำลังจะมาถึง</p>
                  <p className="text-2xl font-bold text-teal-600 mt-1">{stats.upcoming}</p>
                </div>
                <div className="rounded-xl bg-teal-50 p-3">
                  <Calendar size={20} className="text-teal-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card className="p-6">
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
              <div className="space-y-4">
                {filteredBookings.map((booking) => {
                  const checkIn = new Date(booking.checkIn)
                  const checkOut = new Date(booking.checkOut)
                  const isUpcoming = checkIn >= new Date()
                  const isPast = checkOut < new Date()

                  return (
                    <Card key={booking.id} className="p-6">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-semibold text-primary">
                              {booking.roomName}
                            </h3>
                            {getStatusBadge(booking.status)}
                            {isUpcoming && booking.status !== 'cancelled' && (
                              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                กำลังจะมาถึง
                              </span>
                            )}
                            {isPast && booking.status === 'confirmed' && (
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
                                {formatDate(booking.checkIn)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-500">วันที่เช็คเอาท์</p>
                              <p className="text-sm font-semibold text-slate-700">
                                {formatDate(booking.checkOut)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-500">จำนวนคืน</p>
                              <p className="text-sm font-semibold text-slate-700">
                                {booking.nights} คืน
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                            <span>👥 {booking.guests} คน</span>
                            <span className="font-semibold text-primary text-base">
                              {formatPrice(booking.totalPrice)}
                            </span>
                            <span className="text-xs text-slate-400">
                              จองเมื่อ {formatDate(booking.createdAt)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 lg:items-end">
                          <Link to={`/rooms/${booking.roomId}`}>
                            <Button variant="ghost" className="w-full lg:w-auto">
                              ดูรายละเอียดห้อง
                            </Button>
                          </Link>
                          {booking.status === 'pending' && (
                            <Button variant="secondary" className="w-full lg:w-auto">
                              ยกเลิกการจอง
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

