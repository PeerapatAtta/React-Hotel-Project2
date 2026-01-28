import React, { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import StatCard from '../../components/admin/StatCard'
import BookingsSummaryCard from '../../components/admin/BookingsSummaryCard'
import RevenueChart from '../../components/admin/RevenueChart'
import { bookingService } from '../../services/bookingService'
import { Home } from 'lucide-react'
import LoadingSpinner from '../../components/LoadingSpinner'

// Custom Thai Baht icon component
const BathIcon = ({ size = 24, className = '' }) => (
  <div 
    className={className}
    style={{ 
      fontSize: `${size * 0.85}px`,
      lineHeight: 1,
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: `${size}px`,
      height: `${size}px`
    }}
  >
    ฿
  </div>
)

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


  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner text="กำลังโหลดข้อมูลสรุป..." />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-primary">หน้าสรุปข้อมูล</h1>
          <p className="text-slate-600 mt-1">ภาพรวมการจัดการโรงแรม</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="รายได้รวม"
            value={`฿${Math.round(statistics.totalRevenue || 0).toLocaleString()}`}
            icon={BathIcon}
            trend="+12.5% จากเดือนที่แล้ว"
            trendUp={true}
          />
          <StatCard
            title="ห้องว่าง"
            value={statistics.availableRooms}
            icon={Home}
            trend={`${statistics.occupancyRate}% ถูกจอง`}
            trendUp={false}
          />
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600 mb-1">รายได้วันนี้</p>
            <p className="text-2xl font-bold text-primary">
              ฿{Math.round(statistics.todayStats.revenue || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Charts */}
        <RevenueChart data={statistics.monthlyRevenue || []} />

        {/* Bookings Summary Card */}
        <BookingsSummaryCard bookings={bookings} todayStats={statistics.todayStats} />
      </div>
    </AdminLayout>
  )
}

