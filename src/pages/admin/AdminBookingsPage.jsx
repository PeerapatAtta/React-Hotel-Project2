import React, { useState, useMemo, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import BookingsManagementTable from '../../components/admin/BookingsManagementTable'
import AddBookingModal from '../../components/admin/AddBookingModal'
import Button from '../../components/Button'
import { bookingService } from '../../services/bookingService'
import { Search, Filter, Download, Calendar, Plus } from 'lucide-react'
import Input from '../../components/Input'
import { formatPrice } from '../../utils/formatters'
import Swal from 'sweetalert2'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDate, setFilterDate] = useState('')
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

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch = 
        booking.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.guest_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.room_name?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = filterStatus === 'all' || booking.status === filterStatus
      
      const matchesDate = !filterDate || 
        booking.check_in === filterDate || 
        booking.check_out === filterDate ||
        (new Date(booking.check_in) <= new Date(filterDate) && 
         new Date(booking.check_out) >= new Date(filterDate))
      
      return matchesSearch && matchesStatus && matchesDate
    })
  }, [bookings, searchQuery, filterStatus, filterDate])

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
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search size={18} />
                </div>
                <Input
                  placeholder="ค้นหาการจอง (รหัส, ชื่อผู้เข้าพัก, อีเมล, ห้อง)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
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
          <div className="mt-4">
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
          </div>
        </div>

        {/* Bookings Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">
              พบ {filteredBookings.length} การจอง
            </p>
          </div>
          <BookingsManagementTable bookings={filteredBookings} onRefresh={fetchBookings} />
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

