import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Users, Bed, Check, ArrowLeft, Image as ImageIcon } from 'lucide-react'
import { roomService } from '../services/roomService'
import { formatPriceNumber } from '../utils/formatters'
import Button from '../components/Button'
import Badge from '../components/Badge'
import Card from '../components/Card'
import Container from '../components/layout/Container'
import SectionTitle from '../components/SectionTitle'
import IconLabel from '../components/IconLabel'
import ErrorState from '../components/ErrorState'
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
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  if (loading) {
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
    Swal.fire({
      icon: 'info',
      title: 'แจ้งเตือน',
      text: 'ระบบจองจะเปิดใช้งานเร็วๆ นี้',
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
                <div className="space-y-4">
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
                      text={`${formatPriceNumber(room.basePrice)} / คืน`}
                      size={18}
                      className="font-semibold text-accent"
                    />
                  </div>
                </div>
                <Badge className="bg-slate-100 text-slate-600">{room.type}</Badge>
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
    </div>
  )
}

