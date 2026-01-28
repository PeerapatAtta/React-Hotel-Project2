import { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Calendar, Users, Bed, Check, Image as ImageIcon, Search, ArrowRight } from 'lucide-react'
import { roomService } from '../services/roomService'
import { bookingService } from '../services/bookingService'
import { formatPriceNumber, formatDate } from '../utils/formatters'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import Badge from '../components/Badge'
import Container from '../components/layout/Container'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import IconLabel from '../components/IconLabel'

const today = new Date()
const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

// Fallback image URL
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1000&q=80'

function RoomCard({ room }) {
  const [imageError, setImageError] = useState(false)
  const imageUrl = room.images?.[0] || FALLBACK_IMAGE

  return (
    <Card hover className="p-0">
      <div className="relative overflow-hidden bg-slate-100">
        {imageError ? (
          <div className="flex h-52 w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
            <div className="text-center">
              <ImageIcon size={48} className="mx-auto text-slate-400" />
              <p className="mt-2 text-xs text-slate-500">ไม่สามารถโหลดรูปภาพ</p>
            </div>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={room.name}
            className="h-52 w-full object-cover transition-transform duration-300 hover:scale-105"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        )}
      </div>
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-xl font-semibold leading-tight text-primary">{room.name}</h2>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Bed size={16} className="flex-shrink-0" />
            <Badge className="text-xs">{room.type}</Badge>
          </div>
        </div>
        <div className="space-y-2">
          <IconLabel icon={Users} text={`รองรับ ${room.capacity} คน`} size={16} />
          <IconLabel
            iconText="฿"
            text={`${formatPriceNumber(room.base_price || room.basePrice)} / คืน`}
            size={16}
            className="font-semibold text-accent"
          />
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {(room.amenities || []).slice(0, 3).map((amenity) => (
            <div
              key={amenity}
              className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1"
            >
              <Check size={12} className="flex-shrink-0 text-slate-500" />
              <span className="text-xs font-medium text-slate-600">{amenity}</span>
            </div>
          ))}
        </div>
        <Link to={`/rooms/${room.id}`} className="block pt-2">
          <Button variant="ghost" className="w-full">
            ดูรายละเอียด
          </Button>
        </Link>
      </div>
    </Card>
  )
}

export default function RoomsPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [rooms, setRooms] = useState([])
  const [error, setError] = useState(null)
  const [maxCapacity, setMaxCapacity] = useState(10) // Default value
  const checkIn = params.get('checkIn') || today.toISOString().split('T')[0]
  const checkOut = params.get('checkOut') || tomorrow.toISOString().split('T')[0]
  const guests = params.get('guests') || '2'

  const [search, setSearch] = useState({
    checkIn: checkIn,
    checkOut: checkOut,
    guests: guests,
  })
  const [errors, setErrors] = useState({})

  // ดึงข้อมูลห้องทั้งหมดเพื่อคำนวณ max capacity
  useEffect(() => {
    const fetchMaxCapacity = async () => {
      try {
        const { data, error: fetchError } = await roomService.getAllRooms()
        if (!fetchError && data && Array.isArray(data) && data.length > 0) {
          const maxCap = Math.max(...data.map(room => room.capacity || 0))
          if (maxCap > 0) {
            setMaxCapacity(maxCap)
          }
        }
      } catch (err) {
        console.error('Error fetching max capacity:', err)
      }
    }
    fetchMaxCapacity()
  }, [])

  // ดึงข้อมูลห้องจาก Supabase และตรวจสอบห้องว่างตามวันที่
  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const guestNumber = Number(guests) || 1
        const { data, error: fetchError } = await roomService.searchRooms({
          minCapacity: guestNumber,
        })

        if (fetchError) {
          console.error('Error fetching rooms:', fetchError)
          setError(fetchError.message)
        } else {
          // ตรวจสอบห้องว่างตามวันที่ที่เลือก
          const availableRooms = []
          for (const room of (data || [])) {
            const { available, error: availabilityError } = await bookingService.checkRoomAvailability(
              room.id,
              checkIn,
              checkOut
            )

            if (availabilityError) {
              console.error(`Error checking availability for room ${room.id}:`, availabilityError)
              // ถ้าเกิด error ในการตรวจสอบ ให้แสดงห้องไว้ก่อน (เพื่อไม่ให้ผู้ใช้เห็นห้องว่างน้อยเกินไป)
              availableRooms.push(room)
            } else if (available) {
              availableRooms.push(room)
            }
          }
          setRooms(availableRooms)
        }
      } catch (err) {
        console.error('Error:', err)
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRooms()
  }, [guests, checkIn, checkOut])

  // filteredRooms ไม่จำเป็นเพราะ rooms ถูก filter แล้วจาก useEffect
  const filteredRooms = rooms

  useEffect(() => {
    setSearch({
      checkIn: checkIn,
      checkOut: checkOut,
      guests: guests,
    })
  }, [checkIn, checkOut, guests])

  const validateSearch = () => {
    const newErrors = {}

    if (!search.checkIn) {
      newErrors.checkIn = 'กรุณาเลือกวันที่เช็กอิน'
    }

    if (!search.checkOut) {
      newErrors.checkOut = 'กรุณาเลือกวันที่เช็กเอาต์'
    }

    if (search.checkIn && search.checkOut && search.checkOut <= search.checkIn) {
      newErrors.checkOut = 'วันที่เช็กเอาต์ต้องอยู่หลังวันที่เช็กอิน'
    }

    if (!search.guests || Number(search.guests) < 1) {
      newErrors.guests = 'กรุณาระบุจำนวนผู้เข้าพักอย่างน้อย 1 คน'
    } else if (Number(search.guests) > maxCapacity) {
      newErrors.guests = `จำนวนผู้เข้าพักสูงสุดคือ ${maxCapacity} คน`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (validateSearch()) {
      const searchParams = new URLSearchParams({
        checkIn: search.checkIn,
        checkOut: search.checkOut,
        guests: search.guests,
      })
      navigate(`/rooms?${searchParams.toString()}`)
    }
  }

  const handleChange = (field, value) => {
    setSearch((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleResetSearch = () => {
    navigate('/')
  }

  return (
    <div className="space-y-10 pb-24 pt-8 md:pb-28 md:pt-12">
      <Container>
        <div className="space-y-6">
          {/* Search Summary */}
          <Card className="p-6 md:p-8">
            <h1 className="text-2xl font-bold text-primary md:text-3xl">ผลลัพธ์การค้นหา</h1>
            <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-slate-600">
              <IconLabel
                icon={Calendar}
                text={`${checkIn ? formatDate(checkIn) : '-'} - ${checkOut ? formatDate(checkOut) : '-'}`}
                size={18}
              />
              <IconLabel
                icon={Users}
                text={`${guests} คน`}
                size={18}
              />
            </div>
          </Card>

          {/* Search Form */}
          <Card className="p-6 md:p-8">
            <form
              onSubmit={handleSubmit}
              className="grid gap-4 md:grid-cols-4"
            >
              <div className="relative">
                <div className="absolute left-3 top-9 text-slate-400">
                  <Calendar size={18} />
                </div>
                <Input
                  label="เช็กอิน"
                  name="checkIn"
                  type="date"
                  value={search.checkIn}
                  error={errors.checkIn}
                  onChange={(event) => handleChange('checkIn', event.target.value)}
                  min={today.toISOString().split('T')[0]}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <div className="absolute left-3 top-9 text-slate-400">
                  <Calendar size={18} />
                </div>
                <Input
                  label="เช็กเอาต์"
                  name="checkOut"
                  type="date"
                  value={search.checkOut}
                  error={errors.checkOut}
                  onChange={(event) => handleChange('checkOut', event.target.value)}
                  min={search.checkIn || today.toISOString().split('T')[0]}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <div className="absolute left-3 top-9 text-slate-400">
                  <Users size={18} />
                </div>
                <Input
                  label="จำนวนผู้เข้าพัก"
                  name="guests"
                  type="number"
                  min="1"
                  max={maxCapacity}
                  value={search.guests}
                  error={errors.guests}
                  onChange={(event) => handleChange('guests', event.target.value)}
                  helperText={`สูงสุด ${maxCapacity} คน`}
                  className="pl-10"
                />
              </div>
              <div className="flex items-start pt-6">
                <Button
                  type="submit"
                  className="group w-full bg-teal-600 hover:bg-teal-700 hover:shadow-lg hover:scale-105"
                  style={{ backgroundColor: '#0d9488', color: '#ffffff' }}
                >
                  <Search size={18} />
                  <span style={{ color: '#ffffff' }}>อัปเดตผลลัพธ์</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </Container>

      {/* Results */}
      <Container>
        {isLoading ? (
          <LoadingSpinner text="กำลังค้นหาห้องว่าง..." />
        ) : error ? (
          <EmptyState
            title="เกิดข้อผิดพลาด"
            description={error || 'ไม่สามารถโหลดข้อมูลห้องพักได้ กรุณาลองใหม่อีกครั้ง'}
            actionLabel="ลองอีกครั้ง"
            onAction={() => window.location.reload()}
          />
        ) : filteredRooms.length === 0 ? (
          <EmptyState
            title="ไม่พบห้องว่างในช่วงวันที่ที่เลือก"
            description="ลองเปลี่ยนวันที่หรือจำนวนผู้เข้าพักเพื่อดูตัวเลือกเพิ่มเติม"
            actionLabel="กลับไปค้นหาใหม่"
            onAction={handleResetSearch}
          />
        ) : (
          <div className="space-y-8">
            <p className="text-sm font-medium text-slate-600">
              พบ {filteredRooms.length} ห้องว่าง
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  )
}

