import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Home, Clock, CheckCircle } from 'lucide-react'
import Card from '../../components/Card'
import Container from '../../components/layout/Container'
import SectionTitle from '../../components/SectionTitle'
import Button from '../../components/Button'
import { bookingService } from '../../services/bookingService'
import { formatDate, formatPrice } from '../../utils/formatters'
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
  
  const upcomingBookings = displayBookings.filter(b => {
    const checkIn = new Date(b.check_in)
    return checkIn >= new Date()
  })
  const pastBookings = displayBookings.filter(b => {
    const checkIn = new Date(b.check_in)
    return checkIn < new Date()
  })

  return (
    <MemberLayout>
      <div className="space-y-10">
        <Container>
          <div className="space-y-6">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold text-primary">หน้าสรุปข้อมูลสมาชิก</h1>
            <p className="text-slate-600 mt-1">ยินดีต้อนรับ, {user?.name || 'สมาชิก'}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">การจองทั้งหมด</p>
                  <p className="text-2xl font-bold text-primary">{displayBookings.length}</p>
                </div>
                <div className="rounded-xl bg-teal-50 p-3">
                  <Calendar size={24} className="text-teal-600" />
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">การจองที่กำลังจะมาถึง</p>
                  <p className="text-2xl font-bold text-teal-600">{upcomingBookings.length}</p>
                </div>
                <div className="rounded-xl bg-teal-50 p-3">
                  <Clock size={24} className="text-teal-600" />
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">การจองที่ผ่านมา</p>
                  <p className="text-2xl font-bold text-slate-600">{pastBookings.length}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <CheckCircle size={24} className="text-slate-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="p-6 md:p-8">
            <SectionTitle
              title="เมนูด่วน"
              description="เข้าถึงฟีเจอร์ต่างๆ ได้อย่างรวดเร็ว"
            />
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link to="/rooms">
                <Button variant="ghost" className="w-full justify-start">
                  <Home size={18} />
                  ค้นหาห้องพัก
                </Button>
              </Link>
              <Link to="/rooms">
                <Button variant="ghost" className="w-full justify-start">
                  <Calendar size={18} />
                  จองห้องใหม่
                </Button>
              </Link>
              <Button variant="ghost" className="w-full justify-start">
                <CheckCircle size={18} />
                ดูการจองของฉัน
              </Button>
            </div>
          </Card>

          {/* Recent Bookings */}
          {loading ? (
            <Card className="p-12">
              <LoadingSpinner text="กำลังโหลดข้อมูล..." />
            </Card>
          ) : displayBookings.length > 0 ? (
            <Card className="p-6 md:p-8">
              <SectionTitle
                title="การจองล่าสุด"
                description="รายการการจองของคุณ"
              />
              <div className="mt-6 space-y-4">
                {displayBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-primary">{booking.room_name}</h3>
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          booking.status === 'confirmed' 
                            ? 'bg-green-100 text-green-700'
                            : booking.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {booking.status === 'confirmed' ? 'ยืนยันแล้ว' : 
                           booking.status === 'pending' ? 'รอยืนยัน' : 'ยกเลิก'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <span>{formatDate(booking.check_in)} - {formatDate(booking.check_out)}</span>
                        <span>{booking.nights} คืน</span>
                        <span>{booking.guests} คน</span>
                        <span className="font-semibold text-primary">{formatPrice(booking.total_price)}</span>
                      </div>
                    </div>
                    <Link to={`/rooms/${booking.room_id}`}>
                      <Button variant="ghost" className="w-full sm:w-auto">
                        ดูรายละเอียด
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center">
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

