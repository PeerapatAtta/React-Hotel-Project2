import React, { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import StatCard from '../../components/admin/StatCard'
import BookingsTable from '../../components/admin/BookingsTable'
import RevenueChart from '../../components/admin/RevenueChart'
import { bookingService } from '../../services/bookingService'
import { DollarSign, Calendar, Users, Home, TrendingUp } from 'lucide-react'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([])
  const [statistics, setStatistics] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    activeBookings: 0,
    availableRooms: 0,
    occupancyRate: 0,
    monthlyRevenue: [],
    todayStats: {
      checkIns: 0,
      checkOuts: 0,
      newBookings: 0,
      revenue: 0,
    },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [bookingsResult, statsResult] = await Promise.all([
          bookingService.getAllBookings(),
          bookingService.getBookingStatistics(),
        ])

        if (bookingsResult.error) {
          console.error('Error fetching bookings:', bookingsResult.error)
          setBookings([])
        } else if (bookingsResult.data) {
          setBookings(Array.isArray(bookingsResult.data) ? bookingsResult.data : [])
        }

        if (statsResult.error) {
          console.error('Error fetching statistics:', statsResult.error)
        } else if (statsResult.data) {
          setStatistics({
            ...statsResult.data,
            monthlyRevenue: statsResult.data.monthlyRevenue || [],
          })
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setBookings([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length
  const pendingBookings = bookings.filter(b => b.status === 'pending').length

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner text="กำลังโหลดข้อมูลแดชบอร์ด..." />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-primary">แดชบอร์ด</h1>
          <p className="text-slate-600 mt-1">ภาพรวมการจัดการโรงแรม</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="รายได้รวม"
            value={`฿${Math.round(statistics.totalRevenue || 0).toLocaleString()}`}
            icon={DollarSign}
            trend="+12.5% จากเดือนที่แล้ว"
            trendUp={true}
          />
          <StatCard
            title="การจองทั้งหมด"
            value={statistics.totalBookings}
            icon={Calendar}
            trend={`${confirmedBookings} ยืนยัน, ${pendingBookings} รอยืนยัน`}
            trendUp={true}
          />
          <StatCard
            title="การจองที่กำลังใช้งาน"
            value={statistics.activeBookings}
            icon={Users}
            trend={`${statistics.todayStats.checkIns} เช็กอินวันนี้`}
            trendUp={true}
          />
          <StatCard
            title="ห้องว่าง"
            value={statistics.availableRooms}
            icon={Home}
            trend={`${statistics.occupancyRate}% ถูกจอง`}
            trendUp={false}
          />
        </div>

        {/* Today's Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600 mb-1">เช็กอินวันนี้</p>
            <p className="text-2xl font-bold text-primary">{statistics.todayStats.checkIns}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600 mb-1">เช็กเอาต์วันนี้</p>
            <p className="text-2xl font-bold text-primary">{statistics.todayStats.checkOuts}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600 mb-1">การจองใหม่</p>
            <p className="text-2xl font-bold text-primary">{statistics.todayStats.newBookings}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600 mb-1">รายได้วันนี้</p>
            <p className="text-2xl font-bold text-primary">
              ฿{Math.round(statistics.todayStats.revenue || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Charts and Tables */}
        <div className="grid gap-6 lg:grid-cols-2">
          <RevenueChart data={statistics.monthlyRevenue || []} />
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-primary">สถิติการจอง</h2>
                <p className="text-sm text-slate-500 mt-1">สรุปสถานะการจอง</p>
              </div>
              <div className="rounded-lg bg-teal-50 p-2">
                <TrendingUp size={20} className="text-teal-600" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-green-50">
                <div>
                  <p className="text-sm font-medium text-green-700">ยืนยันแล้ว</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{confirmedBookings}</p>
                </div>
                <div className="text-green-600 text-sm font-semibold">
                  {bookings.length > 0 ? ((confirmedBookings / bookings.length) * 100).toFixed(0) : 0}%
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-50">
                <div>
                  <p className="text-sm font-medium text-yellow-700">รอยืนยัน</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">{pendingBookings}</p>
                </div>
                <div className="text-yellow-600 text-sm font-semibold">
                  {bookings.length > 0 ? ((pendingBookings / bookings.length) * 100).toFixed(0) : 0}%
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-red-50">
                <div>
                  <p className="text-sm font-medium text-red-700">ยกเลิก</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {bookings.filter(b => b.status === 'cancelled').length}
                  </p>
                </div>
                <div className="text-red-600 text-sm font-semibold">
                  {bookings.length > 0 ? ((bookings.filter(b => b.status === 'cancelled').length / bookings.length) * 100).toFixed(0) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <BookingsTable bookings={bookings} showAll={true} />
      </div>
    </AdminLayout>
  )
}

