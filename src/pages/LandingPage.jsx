import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Wifi, Coffee, ShieldCheck, Droplet, Calendar, Users, DollarSign, Bed, Search, ArrowRight, Star, CheckCircle } from 'lucide-react'
import Button from '../components/Button'
import Input from '../components/Input'
import Card from '../components/Card'
import Container from '../components/layout/Container'
import SectionTitle from '../components/SectionTitle'
import IconLabel from '../components/IconLabel'
import { roomService } from '../services/roomService'
import { formatPrice } from '../utils/formatters'

const amenities = [
  {
    title: 'Wi-Fi แรงเร็ว',
    description: 'เชื่อมต่อฟรีทุกมุมโรงแรม',
    icon: Wifi,
  },
  {
    title: 'สระว่ายน้ำ',
    description: 'เปิดบริการ 06:00 - 21:00',
    icon: Droplet,
  },
  {
    title: 'อาหารเช้า',
    description: 'บุฟเฟต์ไทย-นานาชาติ',
    icon: Coffee,
  },
  {
    title: 'บริการส่วนตัว',
    description: 'พนักงานดูแลตลอด 24 ชั่วโมง',
    icon: ShieldCheck,
  },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const today = new Date()
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
  const defaultSearch = {
    checkIn: today.toISOString().split('T')[0],
    checkOut: tomorrow.toISOString().split('T')[0],
    guests: '2',
  }

  const [search, setSearch] = useState(defaultSearch)
  const [errors, setErrors] = useState({})
  const [recommendedRooms, setRecommendedRooms] = useState([])

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data, error } = await roomService.getAllRooms()

        if (error) {
          console.error('Error fetching rooms:', error)
          setRecommendedRooms([])
          return
        }

        if (data && Array.isArray(data) && data.length > 0) {
          setRecommendedRooms(data.slice(0, 4))
        } else {
          setRecommendedRooms([])
        }
      } catch (err) {
        console.error('Exception while fetching rooms:', err)
        setRecommendedRooms([])
      }
    }

    fetchRooms()
  }, [])

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
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (validateSearch()) {
      const params = new URLSearchParams({
        checkIn: search.checkIn,
        checkOut: search.checkOut,
        guests: search.guests,
      })
      navigate(`/rooms?${params.toString()}`)
    }
  }

  const handleChange = (field, value) => {
    setSearch((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Background Gradient - Full Page */}
      <div className="fixed inset-0 bg-gradient-to-b from-teal-50 via-blue-50 to-pink-50 -z-10" />

      <div className="relative space-y-12 pb-24 pt-4 md:space-y-16 md:pb-28 md:pt-8">
        {/* Hero Section - Dark Teal Background */}
        <div className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-600 to-teal-800 py-12 md:py-20">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 z-0" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 z-0" />

          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-10 z-0" />
          <Container>
            <section className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:gap-12">
              <div className="relative z-10 space-y-6 md:max-w-xl" style={{ color: '#ffffff' }}>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 border border-white/20">
                  <Star size={14} className="text-yellow-300 fill-yellow-300 flex-shrink-0" />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white" style={{ color: '#ffffff' }}>
                    พักผ่อนอย่างมีสไตล์
                  </p>
                </div>
                <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl animate-fade-in" style={{ color: '#ffffff' }}>
                  โรงแรม Prima — ที่พักใจกลางเมืองสำหรับทุกโอกาส
                </h1>
                <p className="text-base leading-relaxed text-white md:text-lg opacity-90" style={{ color: '#ffffff' }}>
                  ออกแบบเพื่อผู้เข้าพักที่ชอบความสะดวกสบาย พร้อมบริการที่เข้าใจความต้องการของคุณ
                  ทุกห้องมาพร้อมวิวสวยและเชื่อมต่อกับพื้นที่ช้อปปิ้งและคาเฟ่ริมทางเท้า
                </p>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-white" style={{ color: '#ffffff' }}>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={16} className="text-teal-200 flex-shrink-0" />
                    <span className="text-white" style={{ color: '#ffffff' }}>ยืนยันการจองทันที</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={16} className="text-teal-200 flex-shrink-0" />
                    <span className="text-white" style={{ color: '#ffffff' }}>ยกเลิกฟรี</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={16} className="text-teal-200 flex-shrink-0" />
                    <span className="text-white" style={{ color: '#ffffff' }}>ราคาดีที่สุด</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2 relative z-20">
                  <button
                    onClick={handleSubmit}
                    className="search-room-button group relative z-20 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-xl transition-all duration-300 hover:bg-slate-50 hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:ring-offset-2 focus:ring-offset-teal-700"
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#0f766e',
                      border: '2px solid #0f766e',
                      zIndex: 20,
                      position: 'relative',
                      boxShadow: '0 10px 25px rgba(15, 118, 110, 0.2)'
                    }}
                  >
                    <Search size={18} style={{ color: '#0f766e' }} />
                    <span style={{ color: '#0f766e', fontWeight: 600 }}>ค้นหาห้องว่าง</span>
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" style={{ color: '#0f766e' }} />
                  </button>
                  <button
                    onClick={() => document.getElementById('recommended-rooms')?.scrollIntoView({ behavior: 'smooth' })}
                    className="relative z-20 inline-flex items-center justify-center gap-2 rounded-full border-2 bg-transparent px-6 py-3 text-sm font-semibold transition-all duration-300 hover:bg-white/10 hover:border-white/50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-teal-700"
                    style={{
                      color: '#ffffff',
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      zIndex: 20,
                      position: 'relative'
                    }}
                  >
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>ดูห้องแนะนำ</span>
                  </button>
                </div>
              </div>
              <div className="flex-1 mt-8 md:mt-0">
                <div className="relative overflow-hidden rounded-3xl border-4 border-white/20 shadow-2xl group">
                  <div className="absolute inset-0 bg-gradient-to-t from-teal-900/20 to-transparent z-10" />
                  <img
                    src="https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80"
                    alt="โรงแรม Prima"
                    className="h-64 w-full object-cover md:h-96 transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
              </div>
            </section>
          </Container>
        </div>

        {/* Search Widget - White Card Overlay */}
        <div className="relative -mt-8 md:-mt-12">
          <Container>
            <section className="mx-auto max-w-5xl rounded-3xl bg-white p-6 shadow-2xl shadow-teal-900/20 md:p-8 lg:p-10 transition-all duration-300 hover:shadow-teal-900/30">
              <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-primary md:text-2xl" style={{ color: '#1f2933' }}>ค้นหาห้องพักที่เหมาะกับคุณ</h2>
                <p className="mt-1 text-sm text-slate-500" style={{ color: '#64748b' }}>เลือกวันที่และจำนวนผู้เข้าพักเพื่อเริ่มต้น</p>
              </div>
              <form className="grid gap-4 md:grid-cols-4" onSubmit={handleSubmit}>
                <div className="relative">
                  <div className="absolute left-3 top-9 text-slate-400">
                    <Calendar size={18} />
                  </div>
                  <Input
                    label="เช็กอิน"
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
                    type="number"
                    min="1"
                    max="10"
                    value={search.guests}
                    error={errors.guests}
                    onChange={(event) => handleChange('guests', event.target.value)}
                    helperText="สูงสุด 10 คน"
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
                    <span style={{ color: '#ffffff' }}>ค้นหา</span>
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </form>
            </section>
          </Container>
        </div>

        {/* Recommended Rooms */}
        <Container>
          <section id="recommended-rooms" className="space-y-10">
            <div className="text-center space-y-2">
              <SectionTitle
                subtitle="ห้องแนะนำ"
                title="คัดสรรห้องที่ตอบโจทย์การพักผ่อนของคุณ"
              />
              <p className="text-sm text-slate-500" style={{ color: '#64748b' }}>ห้องพักยอดนิยมที่ลูกค้าชื่นชอบ</p>
            </div>
            {recommendedRooms.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 mb-4">กำลังโหลดข้อมูลห้องพัก...</p>
                <p className="text-xs text-slate-400">ตรวจสอบ Console (F12) เพื่อดูสถานะการดึงข้อมูล</p>
              </div>
            ) : (
              <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {recommendedRooms.map((room, index) => (
                  <Link key={room.id} to={`/rooms/${room.id}`}>
                    <Card hover className="p-0 bg-white shadow-lg h-full flex flex-col group cursor-pointer">
                      <div className="relative overflow-hidden">
                        <img
                          src={room.images[0]}
                          alt={room.name}
                          className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
                          <Star size={12} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-semibold text-slate-700">4.{8 + index}</span>
                        </div>
                      </div>
                      <div className="space-y-4 p-6 flex-1 flex flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-lg font-semibold leading-tight text-primary group-hover:text-teal-600 transition-colors">{room.name}</h3>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Bed size={16} className="flex-shrink-0" />
                            <span className="text-xs font-medium uppercase tracking-wide">{room.type}</span>
                          </div>
                        </div>
                        <div className="space-y-2 flex-1">
                          <IconLabel icon={Users} text={`รองรับ ${room.capacity} คน`} size={16} />
                          <IconLabel icon={DollarSign} text={`เริ่มต้น ${formatPrice(room.basePrice)}/คืน`} size={16} className="font-semibold text-teal-600" />
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {room.amenities.slice(0, 3).map((amenity) => (
                            <span
                              key={amenity}
                              className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 border border-teal-100"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                        <div className="pt-2 mt-auto">
                          <div className="flex items-center gap-2 text-sm font-semibold text-teal-600 group-hover:gap-3 transition-all">
                            <span>ดูรายละเอียด</span>
                            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </Container>

        {/* Amenities */}
        <Container>
          <section className="mx-auto max-w-4xl space-y-10 rounded-3xl bg-white p-6 shadow-xl shadow-teal-900/10 md:p-10">
            <div className="text-center space-y-2">
              <SectionTitle
                subtitle="สิ่งอำนวยความสะดวก"
                title="อัปเกรดการพักผ่อนด้วยบริการที่ครบครัน"
              />
              <p className="text-sm text-slate-500" style={{ color: '#64748b' }}>บริการที่เรามอบให้เพื่อความสะดวกสบายของคุณ</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {amenities.map((item, index) => (
                <div
                  key={item.title}
                  className="group flex items-start gap-5 rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-6 transition-all duration-300 hover:shadow-xl hover:border-teal-300 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="rounded-xl bg-teal-600 p-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <item.icon size={24} className="text-white" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="text-lg font-semibold text-primary group-hover:text-teal-600 transition-colors">{item.title}</p>
                    <p className="text-sm leading-relaxed text-slate-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Container>
      </div>
    </div>
  )
}

