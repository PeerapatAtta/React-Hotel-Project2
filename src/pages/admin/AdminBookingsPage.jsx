import React, { useState, useMemo, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import BookingsManagementTable from '../../components/admin/BookingsManagementTable'
import AddBookingModal from '../../components/admin/AddBookingModal'
import Button from '../../components/Button'
import { bookingService } from '../../services/bookingService'
import { Search, Filter, Download, Calendar, Plus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import Input from '../../components/Input'
import { formatPrice } from '../../utils/formatters'
import Swal from 'sweetalert2'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('all') // 'all', 'id', 'guest_name', 'email', 'room_name', 'creator_name'
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDate, setFilterDate] = useState('')
  const [sortField, setSortField] = useState('created_at') // default sort by created date
  const [sortDirection, setSortDirection] = useState('desc') // 'asc' or 'desc'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const fetchBookings = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await bookingService.getAllBookings()

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
  }, [])

  // Filter and sort bookings
  const filteredBookings = useMemo(() => {
    let result = bookings.filter((booking) => {
      // รองรับทั้ง snake_case และ camelCase
      const guestName = booking.guest_name || booking.guestName || ''
      const roomName = booking.room_name || booking.roomName || ''

      // ถ้า searchQuery ว่าง ให้ผ่านทั้งหมด (ไม่กรอง)
      const trimmedQuery = searchQuery?.trim() || ''
      const queryLower = trimmedQuery.toLowerCase()

      let matchesSearch = true

      // ถ้ามี searchQuery ให้ตรวจสอบตามประเภทที่เลือก
      if (trimmedQuery !== '') {
        switch (searchType) {
          case 'id':
            matchesSearch = booking.id?.toLowerCase().includes(queryLower) || false
            break
          case 'guest_name':
            matchesSearch = guestName.toLowerCase().includes(queryLower)
            break
          case 'email':
            matchesSearch = booking.email?.toLowerCase().includes(queryLower) || false
            break
          case 'room_name':
            matchesSearch = roomName.toLowerCase().includes(queryLower)
            break
          case 'creator_name':
            // ค้นหาตามชื่อผู้สร้าง (จาก profiles)
            const creatorName = (booking.profiles?.name || '').toLowerCase()
            const creatorEmail = (booking.profiles?.email || '').toLowerCase()
            matchesSearch = creatorName.includes(queryLower) || creatorEmail.includes(queryLower)
            break
          case 'all':
          default:
            // ค้นหาทั้งหมด
            const creatorNameAll = (booking.profiles?.name || '').toLowerCase()
            const creatorEmailAll = (booking.profiles?.email || '').toLowerCase()
            matchesSearch =
              booking.id?.toLowerCase().includes(queryLower) ||
              guestName.toLowerCase().includes(queryLower) ||
              booking.email?.toLowerCase().includes(queryLower) ||
              roomName.toLowerCase().includes(queryLower) ||
              creatorNameAll.includes(queryLower) ||
              creatorEmailAll.includes(queryLower)
            break
        }
      }

      const matchesStatus = filterStatus === 'all' || booking.status === filterStatus

      const matchesDate = !filterDate ||
        booking.check_in === filterDate ||
        booking.check_out === filterDate ||
        (new Date(booking.check_in) <= new Date(filterDate) &&
          new Date(booking.check_out) >= new Date(filterDate))

      const finalMatch = matchesSearch && matchesStatus && matchesDate
      return finalMatch
    })

    // Helper function เพื่อคำนวณสถานะเวลา
    const getTimeStatusValue = (checkIn, checkOut) => {
      if (!checkIn || !checkOut) return 0
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const checkInDate = new Date(checkIn)
      checkInDate.setHours(0, 0, 0, 0)
      
      const checkOutDate = new Date(checkOut)
      checkOutDate.setHours(0, 0, 0, 0)
      
      // past = 0, ongoing = 1, upcoming = 2
      if (checkOutDate < today) return 0 // ผ่านมาแล้ว
      if (checkInDate <= today && checkOutDate >= today) return 1 // กำลังเข้าพัก
      if (checkInDate > today) return 2 // กำลังจะมาถึง
      return 0
    }

    // Sort bookings
    result = [...result].sort((a, b) => {
      let aValue, bValue

      switch (sortField) {
        case 'id':
          aValue = (a.id || '').toLowerCase()
          bValue = (b.id || '').toLowerCase()
          break
        case 'created_at':
          aValue = new Date(a.created_at || a.createdAt || 0)
          bValue = new Date(b.created_at || b.createdAt || 0)
          break
        case 'check_in':
          aValue = new Date(a.check_in || a.checkIn || 0)
          bValue = new Date(b.check_in || b.checkIn || 0)
          break
        case 'total_price':
          aValue = parseFloat(a.total_price || a.totalPrice || 0)
          bValue = parseFloat(b.total_price || b.totalPrice || 0)
          break
        case 'guest_name':
          aValue = (a.guest_name || a.guestName || '').toLowerCase()
          bValue = (b.guest_name || b.guestName || '').toLowerCase()
          break
        case 'room_name':
          aValue = (a.room_name || a.roomName || '').toLowerCase()
          bValue = (b.room_name || b.roomName || '').toLowerCase()
          break
        case 'status':
          aValue = a.status || ''
          bValue = b.status || ''
          break
        case 'time_status':
          aValue = getTimeStatusValue(a.check_in || a.checkIn, a.check_out || a.checkOut)
          bValue = getTimeStatusValue(b.check_in || b.checkIn, b.check_out || b.checkOut)
          break
        case 'creator_name':
          aValue = ((a.profiles?.name || a.profiles?.email || '')).toLowerCase()
          bValue = ((b.profiles?.name || b.profiles?.email || '')).toLowerCase()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [bookings, searchQuery, searchType, filterStatus, filterDate, sortField, sortDirection])

  // Calculate statistics
  const stats = useMemo(() => {
    const confirmed = filteredBookings.filter(b => b.status === 'confirmed').length
    const pending = filteredBookings.filter(b => b.status === 'pending').length
    const cancelled = filteredBookings.filter(b => b.status === 'cancelled').length
    const totalRevenue = filteredBookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0)

    return { confirmed, pending, cancelled, totalRevenue }
  }, [filteredBookings])

  const handleExport = () => {
    Swal.fire({
      icon: 'info',
      title: 'แจ้งเตือน',
      text: 'ฟีเจอร์ส่งออกข้อมูลจะเปิดใช้งานเร็วๆ นี้',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#0d9488',
    })
  }

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner text="กำลังโหลดข้อมูลการจอง..." />
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-red-600">เกิดข้อผิดพลาด: {error}</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">การจอง</h1>
            <p className="text-slate-600 mt-1">จัดการการจองทั้งหมด</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full md:w-auto"
            >
              <Plus size={18} />
              เพิ่มการจอง
            </Button>
            <Button onClick={handleExport} variant="secondary" className="w-full md:w-auto">
              <Download size={18} />
              ส่งออกข้อมูล
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-600">ยืนยันแล้ว</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.confirmed}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-600">รอยืนยัน</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-600">ยกเลิก</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.cancelled}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-600">รายได้รวม</p>
            <p className="text-2xl font-bold text-primary mt-1">
              {formatPrice(stats.totalRevenue)}
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-4">
            {/* Search Type Selector */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Filter size={18} />
              </div>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 pl-10 text-sm font-medium text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="all">ค้นหาทั้งหมด</option>
                <option value="id">รหัสการจอง</option>
                <option value="guest_name">ชื่อผู้เข้าพัก</option>
                <option value="email">อีเมล</option>
                <option value="room_name">ชื่อห้อง</option>
                <option value="creator_name">ผู้สร้าง</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search size={18} />
                </div>
                <Input
                  placeholder={
                    searchType === 'all' ? "ค้นหาการจอง (รหัส, ชื่อผู้เข้าพัก, อีเมล, ห้อง, ผู้สร้าง)..." :
                      searchType === 'id' ? "ค้นหาตามรหัสการจอง..." :
                        searchType === 'guest_name' ? "ค้นหาตามชื่อผู้เข้าพัก..." :
                          searchType === 'email' ? "ค้นหาตามอีเมล..." :
                            searchType === 'room_name' ? "ค้นหาตามชื่อห้อง..." :
                              searchType === 'creator_name' ? "ค้นหาตามชื่อผู้สร้าง..." :
                                "ค้นหาการจอง..."
                  }
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
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
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="relative max-w-xs">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Calendar size={18} />
              </div>
              <Input
                type="date"
                placeholder="กรองตามวันที่"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <ArrowUpDown size={18} />
                </div>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 pl-10 text-sm font-medium text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="id">เรียงตามรหัสการจอง</option>
                  <option value="created_at">เรียงตามวันที่สร้าง</option>
                  <option value="check_in">เรียงตามวันที่เช็กอิน</option>
                  <option value="total_price">เรียงตามราคา</option>
                  <option value="guest_name">เรียงตามชื่อผู้เข้าพัก</option>
                  <option value="room_name">เรียงตามชื่อห้อง</option>
                  <option value="status">เรียงตามสถานะ</option>
                  <option value="creator_name">เรียงตามผู้สร้าง</option>
                </select>
              </div>
              <Button
                variant="secondary"
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="px-4"
                title={sortDirection === 'asc' ? 'เรียงจากน้อยไปมาก' : 'เรียงจากมากไปน้อย'}
              >
                {sortDirection === 'asc' ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">
              พบ {filteredBookings.length} การจอง
            </p>
          </div>
          <BookingsManagementTable
            bookings={filteredBookings}
            onRefresh={fetchBookings}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={(field) => {
              if (sortField === field) {
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
              } else {
                setSortField(field)
                setSortDirection('asc')
              }
            }}
          />
        </div>
      </div>

      {/* Add Booking Modal */}
      <AddBookingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchBookings}
      />
    </AdminLayout>
  )
}

