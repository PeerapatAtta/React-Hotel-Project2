import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Users, Bed, Check, ArrowLeft, Image as ImageIcon, Calendar } from 'lucide-react'
import { roomService } from '../services/roomService'
import { formatPriceNumber } from '../utils/formatters'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/Button'
import Badge from '../components/Badge'
import Card from '../components/Card'
import Container from '../components/layout/Container'
import SectionTitle from '../components/SectionTitle'
import IconLabel from '../components/IconLabel'
import ErrorState from '../components/ErrorState'
import BookingModal from '../components/member/BookingModal'
import Swal from 'sweetalert2'

// Fallback image URL
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1000&q=80'

function RoomImage({ src, alt, className }) {
  const [imageError, setImageError] = useState(false)
  const imageUrl = src || FALLBACK_IMAGE

  return (
    <div className="relative overflow-hidden bg-slate-100">
      {imageError ? (
        <div className={`flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 ${className}`}>
          <div className="text-center p-4">
            <ImageIcon size={48} className="mx-auto text-slate-400" />
            <p className="mt-2 text-xs text-slate-500">ไม่สามารถโหลดรูปภาพ</p>
          </div>
        </div>
      ) : (
        <img 
          src={imageUrl} 
          alt={alt}
          className={`object-cover transition-transform duration-300 hover:scale-105 ${className}`}
          onError={() => setImageError(true)}
          loading="lazy"
        />
      )}
    </div>
  )
}

export default function RoomDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [showStickyBar, setShowStickyBar] = useState(false)

  useEffect(() => {
    const fetchRoom = async () => {
      if (!id) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      
      try {
        const decodedId = decodeURIComponent(id)
        const { data, error: fetchError } = await roomService.getRoomById(decodedId)
        
        if (fetchError) {
          console.error('Error fetching room:', fetchError)
          setError(fetchError.message)
        } else if (data) {
          setRoom(data)
        } else {
          setError('ไม่พบข้อมูลห้องนี้')
        }
      } catch (err) {
        console.error('Error:', err)
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
      } finally {
        setLoading(false)
      }
    }

    fetchRoom()
  }, [id])

  // ตรวจสอบ scroll position เพื่อแสดง sticky bar
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      // แสดง sticky bar เมื่อ scroll ลงมากกว่า 200px
      setShowStickyBar(scrollPosition > 200)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (loading || authLoading) {
    return (
      <Container>
        <div className="py-20 text-center">
          <p className="text-slate-600">กำลังโหลดข้อมูล...</p>
        </div>
      </Container>
    )
  }

  if (error || !room) {
    return (
      <Container>
        <div className="py-20">
          <ErrorState
            title={error || "ไม่พบข้อมูลห้องนี้"}
            description="กรุณากลับไปยังหน้ารายการห้องเพื่อเลือกห้องอื่น"
            actionLabel="กลับไปหน้ารายการห้อง"
            onAction={() => navigate('/rooms')}
          />
        </div>
      </Container>
    )
  }

  const handleBooking = () => {
    // ตรวจสอบว่า user login หรือยัง
    if (!user) {
      // ถ้ายังไม่ login ให้ redirect ไปหน้า login พร้อม returnUrl เพื่อกลับมาหน้านี้หลัง login
      const currentUrl = window.location.pathname + window.location.search
      navigate(`/login?returnUrl=${encodeURIComponent(currentUrl)}`)
      return
    }

    // ถ้า login แล้ว ให้เปิด modal จองห้อง
    setIsBookingModalOpen(true)
  }

  const handleBookingSuccess = () => {
    // หลังจากจองสำเร็จ อาจจะ redirect ไปหน้าจองของฉัน หรือแสดงข้อความสำเร็จ
    Swal.fire({
      icon: 'success',
      title: 'จองห้องสำเร็จ',
      text: 'คุณสามารถดูรายละเอียดการจองได้ที่หน้า "การจองของฉัน"',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#0d9488',
    })
  }

  return (
    <div className="space-y-10 pb-24 pt-8 md:pb-28 md:pt-12">
      <Container>
        <div className="space-y-10">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/rooms')}
            className="mb-2"
          >
            <ArrowLeft size={16} />
            กลับไปหน้ารายการห้อง
          </Button>

          {/* Header */}
          <Card className="p-6 md:p-8">
            <div className="space-y-6">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="space-y-4 flex-1">
                  <SectionTitle
                    subtitle="รายละเอียดห้องพัก"
                    title={room.name}
                  />
                  <div className="flex flex-wrap items-center gap-5 pt-1">
                    <IconLabel 
                      icon={Bed} 
                      text={room.type}
                      size={18}
                    />
                    <IconLabel 
                      icon={Users} 
                      text={`รองรับสูงสุด ${room.capacity} คน`}
                      size={18}
                    />
                    <IconLabel 
                      iconText="฿"
                      text={`${formatPriceNumber(room.base_price || room.basePrice)} / คืน`}
                      size={18}
                      className="font-semibold text-accent"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <Badge className="bg-slate-100 text-slate-600">{room.type}</Badge>
                  <Button onClick={handleBooking} className="w-full md:w-auto">
                    <Calendar size={18} />
                    จองห้อง
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Image Gallery */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(room.images || []).map((src, index) => (
              <div 
                key={`${src}-${index}`} 
                className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
              >
                <RoomImage 
                  src={src}
                  alt={`${room.name} - ภาพ ${index + 1}`}
                  className="h-64 w-full md:h-72"
                />
              </div>
            ))}
          </div>

          {/* Amenities Section */}
          <Card className="p-6 md:p-8">
            <div className="space-y-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <SectionTitle
                    title="สิ่งอำนวยความสะดวก"
                    description="บริการที่รวมอยู่ในห้องพักและพื้นที่ส่วนกลาง"
                  />
                </div>
                <Button onClick={handleBooking} className="w-full md:w-auto">
                  <Calendar size={18} />
                  จองห้อง
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {(room.amenities || []).map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-5 transition-colors hover:bg-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-white p-2">
                        <Check size={16} className="text-accent" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">{amenity}</p>
                    </div>
                    <Badge className="bg-white text-xs text-slate-500">พร้อมใช้งาน</Badge>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </Container>

      {/* Sticky Booking Bar */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg">
          <Container>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
              <div className="flex-1">
                <h3 className="font-semibold text-primary text-lg">{room.name}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <Users size={16} />
                    {room.capacity} คน
                  </span>
                  <span className="font-semibold text-primary text-base">
                    ฿{formatPriceNumber(room.base_price || room.basePrice)} / คืน
                  </span>
                </div>
              </div>
              <Button onClick={handleBooking} className="w-full sm:w-auto min-w-[200px]">
                <Calendar size={18} />
                จองห้อง
              </Button>
            </div>
          </Container>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={handleBookingSuccess}
        room={room}
      />
    </div>
  )
}

