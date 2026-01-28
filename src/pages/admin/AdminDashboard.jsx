import React, { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import BookingsSummaryCard from '../../components/admin/BookingsSummaryCard'
import RevenueSummaryCard from '../../components/admin/RevenueSummaryCard'
import RoomsSummaryCard from '../../components/admin/RoomsSummaryCard'
import { bookingService } from '../../services/bookingService'
import { roomService } from '../../services/roomService'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([])
  const [rooms, setRooms] = useState([])
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
        const [bookingsResult, statsResult, roomsResult] = await Promise.all([
          bookingService.getAllBookings(),
          bookingService.getBookingStatistics(),
          roomService.getAllRooms(),
        ])

        let bookingsData = []
        let roomsData = []

        if (bookingsResult.error) {
          console.error('Error fetching bookings:', bookingsResult.error)
          setBookings([])
        } else if (bookingsResult.data) {
          bookingsData = Array.isArray(bookingsResult.data) ? bookingsResult.data : []
          setBookings(bookingsData)
        }

        if (roomsResult.error) {
          console.error('Error fetching rooms:', roomsResult.error)
          setRooms([])
        } else if (roomsResult.data) {
          roomsData = Array.isArray(roomsResult.data) ? roomsResult.data : []
          setRooms(roomsData)
        }

        if (statsResult.error) {
          console.error('Error fetching statistics:', statsResult.error)
        } else if (statsResult.data) {
          // คำนวณ availableRooms และ occupancyRate จากข้อมูลจริง
          const totalRooms = roomsData.length
          const today = new Date().toISOString().split('T')[0]
          
          // หาห้องที่ถูกจองในวันนี้ (confirmed หรือ pending และอยู่ในช่วงวันที่)
          const bookedRoomIds = new Set()
          bookingsData.forEach(booking => {
            if (booking.status === 'confirmed' || booking.status === 'pending') {
              const checkIn = booking.check_in || booking.checkIn
              const checkOut = booking.check_out || booking.checkOut
              
              if (checkIn && checkOut) {
                // ตรวจสอบว่าการจองทับกับวันนี้หรือไม่
                if (checkIn <= today && checkOut > today) {
                  const roomId = booking.room_id || booking.roomId
                  if (roomId) {
                    bookedRoomIds.add(roomId)
                  }
                }
              }
            }
          })
          
          const bookedRooms = bookedRoomIds.size
          const availableRooms = Math.max(0, totalRooms - bookedRooms)
          const occupancyRate = totalRooms > 0 ? Math.round((bookedRooms / totalRooms) * 100) : 0

          setStatistics({
            ...statsResult.data,
            monthlyRevenue: statsResult.data.monthlyRevenue || [],
            availableRooms,
            occupancyRate,
          })
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setBookings([])
        setRooms([])
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

        {/* Bookings Summary Card */}
        <BookingsSummaryCard bookings={bookings} todayStats={statistics.todayStats} />

        {/* Summary Cards Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue Summary Card */}
          <RevenueSummaryCard
            totalRevenue={statistics.totalRevenue}
            todayRevenue={statistics.todayStats.revenue}
            monthlyRevenue={statistics.monthlyRevenue}
            totalBookings={statistics.totalBookings}
          />

          {/* Rooms Summary Card */}
          <RoomsSummaryCard
            rooms={rooms}
            availableRooms={statistics.availableRooms}
            occupancyRate={statistics.occupancyRate}
            activeBookings={statistics.activeBookings}
          />
        </div>
      </div>
    </AdminLayout>
  )
}
