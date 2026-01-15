import React, { useState, useEffect, useCallback } from 'react'
import { X, Calendar, Users, Mail, Phone, Home } from 'lucide-react'
import Button from '../Button'
import Input from '../Input'
import { bookingService } from '../../services/bookingService'
import Swal from 'sweetalert2'
import { formatPrice } from '../../utils/formatters'
import { useAuth } from '../../hooks/useAuth'

// ฟังก์ชัน format เบอร์โทรศัพท์ให้มี "-"
function formatPhoneNumber(phone) {
  if (!phone) return ''
  
  // ลบ "-" และช่องว่างออกก่อน
  const cleaned = phone.replace(/[-\s]/g, '')
  
  // ถ้าไม่ใช่ตัวเลขทั้งหมด ให้คืนค่าเดิม
  if (!/^\d+$/.test(cleaned)) {
    return phone
  }
  
  // Format ตามรูปแบบเบอร์โทรศัพท์ไทย
  if (cleaned.startsWith('0')) {
    if (cleaned.length === 10) {
      // มือถือ: 0XX-XXX-XXXX (เช่น 087-697-6306)
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    } else if (cleaned.length === 9) {
      // เบอร์บ้าน/สำนักงาน: 0X-XXX-XXXX (เช่น 02-123-4567)
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5)}`
    }
  }
  
  // ถ้าไม่ใช่รูปแบบที่รู้จัก ให้คืนค่าเดิม
  return phone
}

// ฟังก์ชันลบ "-" ออกจากเบอร์โทรศัพท์
function cleanPhoneNumber(phone) {
  if (!phone) return ''
  return phone.replace(/[-\s]/g, '')
}

export default function BookingModal({ isOpen, onClose, onSuccess, room }) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    guest_name: user?.name || '',
    email: user?.email || '',
    phone: '',
    check_in: '',
    check_out: '',
    guests: '2',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)

  // เติมข้อมูล user เมื่อเปิด modal
  useEffect(() => {
    if (isOpen && user) {
      // ตรวจสอบเบอร์โทรศัพท์ - ถ้ามีและไม่ใช่ email ให้ใช้
      let phoneValue = ''
      if (user.phone) {
        // ถ้า phone ไม่มี @ และไม่เท่ากับ email ให้ใช้
        if (!user.phone.includes('@') && user.phone !== user.email) {
          phoneValue = formatPhoneNumber(user.phone)
        }
      }

      setFormData(prev => ({
        ...prev,
        guest_name: user.name || prev.guest_name,
        email: user.email || prev.email,
        phone: phoneValue || prev.phone,
      }))
    }
  }, [isOpen, user])

  // Reset form เมื่อปิด modal
  useEffect(() => {
    if (!isOpen) {
      // ตรวจสอบเบอร์โทรศัพท์ - ถ้ามีและไม่ใช่ email ให้ใช้
      let phoneValue = ''
      if (user?.phone) {
        // ถ้า phone ไม่มี @ และไม่เท่ากับ email ให้ใช้
        if (!user.phone.includes('@') && user.phone !== user.email) {
          phoneValue = formatPhoneNumber(user.phone)
        }
      }

      setFormData({
        guest_name: user?.name || '',
        email: user?.email || '',
        phone: phoneValue,
        check_in: '',
        check_out: '',
        guests: '2',
      })
      setErrors({})
    }
  }, [isOpen, user])

  const handleChange = (field, value) => {
    // ถ้าเป็น phone field ให้ format เบอร์โทรศัพท์
    if (field === 'phone') {
      // ลบ "-" ออกก่อน format ใหม่
      const cleaned = cleanPhoneNumber(value)
      // Format ใหม่
      const formatted = formatPhoneNumber(cleaned)
      setFormData(prev => ({ ...prev, [field]: formatted }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // คำนวณจำนวนคืนและราคารวม
  const calculateBooking = () => {
    if (!formData.check_in || !formData.check_out || !room) {
      return { nights: 0, totalPrice: 0 }
    }

    const checkIn = new Date(formData.check_in)
    const checkOut = new Date(formData.check_out)
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
    const totalPrice = nights > 0 ? parseFloat(room.base_price || room.basePrice) * nights : 0

    return { nights, totalPrice }
  }

  const { nights, totalPrice } = calculateBooking()

  // ตรวจสอบห้องว่าง
  const checkAvailability = useCallback(async () => {
    if (!room?.id || !formData.check_in || !formData.check_out) {
      return
    }

    setIsCheckingAvailability(true)
    try {
      const { available, error } = await bookingService.checkRoomAvailability(
        room.id,
        formData.check_in,
        formData.check_out
      )

      if (error) {
        console.error('Error checking availability:', error)
        return
      }

      if (!available) {
        setErrors(prev => ({
          ...prev,
          check_in: 'ห้องไม่ว่างในช่วงวันที่ที่เลือก',
          check_out: 'กรุณาเลือกวันที่อื่น',
        }))
      } else {
        // ลบ error ถ้าห้องว่าง
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.check_in
          delete newErrors.check_out
          return newErrors
        })
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setIsCheckingAvailability(false)
    }
  }, [room?.id, formData.check_in, formData.check_out])

  // ตรวจสอบห้องว่างเมื่อเลือกวันที่ (ใช้ debounce)
  useEffect(() => {
    if (room?.id && formData.check_in && formData.check_out) {
      const checkIn = new Date(formData.check_in)
      const checkOut = new Date(formData.check_out)
      if (checkOut > checkIn) {
        const timer = setTimeout(() => {
          checkAvailability()
        }, 500)

        return () => clearTimeout(timer)
      }
    }
  }, [room?.id, formData.check_in, formData.check_out, checkAvailability])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.guest_name.trim()) {
      newErrors.guest_name = 'กรุณากรอกชื่อผู้เข้าพัก'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'กรุณากรอกอีเมล'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์'
    }
    if (!formData.check_in) {
      newErrors.check_in = 'กรุณาเลือกวันที่เช็กอิน'
    }
    if (!formData.check_out) {
      newErrors.check_out = 'กรุณาเลือกวันที่เช็กเอาต์'
    }
    if (formData.check_in && formData.check_out) {
      const checkIn = new Date(formData.check_in)
      const checkOut = new Date(formData.check_out)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (checkIn < today) {
        newErrors.check_in = 'วันที่เช็กอินต้องไม่เป็นอดีต'
      }
      if (checkOut <= checkIn) {
        newErrors.check_out = 'วันที่เช็กเอาต์ต้องอยู่หลังวันที่เช็กอิน'
      }
    }
    if (!formData.guests || Number(formData.guests) < 1) {
      newErrors.guests = 'กรุณาระบุจำนวนผู้เข้าพักอย่างน้อย 1 คน'
    } else if (room && Number(formData.guests) > room.capacity) {
      newErrors.guests = `จำนวนผู้เข้าพักต้องไม่เกิน ${room.capacity} คน`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // ตรวจสอบห้องว่างอีกครั้งก่อนบันทึก
    if (room?.id && formData.check_in && formData.check_out) {
      const { available, error: availabilityError } = await bookingService.checkRoomAvailability(
        room.id,
        formData.check_in,
        formData.check_out
      )

      if (availabilityError) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถตรวจสอบห้องว่างได้',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#0d9488',
        })
        return
      }

      if (!available) {
        Swal.fire({
          icon: 'warning',
          title: 'ห้องไม่ว่าง',
          text: 'ห้องนี้ถูกจองในช่วงวันที่ที่เลือกแล้ว กรุณาเลือกวันที่อื่น',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#0d9488',
        })
        return
      }
    }

    setIsLoading(true)

    try {
      const bookingData = {
        room_id: room.id,
        room_name: room.name,
        guest_name: formData.guest_name.trim(),
        email: formData.email.trim(),
        phone: cleanPhoneNumber(formData.phone.trim()), // ลบ "-" ออกก่อนส่งไป backend
        check_in: formData.check_in,
        check_out: formData.check_out,
        guests: parseInt(formData.guests),
        total_price: totalPrice,
        status: 'pending',
        user_id: user?.id || null,
      }

      const { data, error } = await bookingService.createBooking(bookingData)

      if (error) {
        console.error('Error creating booking:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.message || 'ไม่สามารถสร้างการจองได้ กรุณาลองใหม่อีกครั้ง',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#0d9488',
        })
      } else {
        Swal.fire({
          icon: 'success',
          title: 'จองห้องสำเร็จ',
          text: 'การจองของคุณถูกส่งเรียบร้อยแล้ว รอการยืนยันจากทางโรงแรม',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#0d9488',
        })
        handleClose()
        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (err) {
      console.error('Error:', err)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถสร้างการจองได้ กรุณาลองใหม่อีกครั้ง',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#0d9488',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    // ตรวจสอบเบอร์โทรศัพท์ - ถ้ามีและไม่ใช่ email ให้ใช้
    let phoneValue = ''
    if (user?.phone) {
      // ถ้า phone ไม่มี @ และไม่เท่ากับ email ให้ใช้
      if (!user.phone.includes('@') && user.phone !== user.email) {
        phoneValue = formatPhoneNumber(user.phone)
      }
    }

    setFormData({
      guest_name: user?.name || '',
      email: user?.email || '',
      phone: phoneValue,
      check_in: '',
      check_out: '',
      guests: '2',
    })
    setErrors({})
    onClose()
  }

  if (!isOpen || !room) return null

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-[95%] md:w-[60%] min-w-[320px] max-w-[800px] max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-2xl font-bold text-primary">จองห้อง</h2>
            <p className="text-sm text-slate-600 mt-1">{room.name}</p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ข้อมูลห้อง */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Home size={20} className="text-teal-600" />
              <h3 className="font-semibold text-slate-700">ข้อมูลห้อง</h3>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">ประเภท:</span>
                <span className="font-medium text-slate-700">{room.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">ความจุ:</span>
                <span className="font-medium text-slate-700">{room.capacity} คน</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">ราคาต่อคืน:</span>
                <span className="font-medium text-primary">{formatPrice(room.base_price || room.basePrice)}</span>
              </div>
            </div>
          </div>

          {/* ข้อมูลผู้เข้าพัก */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                ชื่อผู้เข้าพัก *
              </label>
              <Input
                type="text"
                placeholder="กรอกชื่อผู้เข้าพัก"
                value={formData.guest_name}
                onChange={(e) => handleChange('guest_name', e.target.value)}
                className={errors.guest_name ? 'border-red-300' : ''}
              />
              {errors.guest_name && (
                <p className="mt-1 text-sm text-red-600">{errors.guest_name}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                <Mail size={16} className="inline mr-2" />
                อีเมล *
              </label>
              <Input
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={errors.email ? 'border-red-300' : ''}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                <Phone size={16} className="inline mr-2" />
                เบอร์โทรศัพท์ *
              </label>
              <Input
                type="tel"
                placeholder="081-234-5678"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={errors.phone ? 'border-red-300' : ''}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                <Users size={16} className="inline mr-2" />
                จำนวนผู้เข้าพัก *
              </label>
              <Input
                type="number"
                min="1"
                max={room.capacity}
                placeholder="2"
                value={formData.guests}
                onChange={(e) => handleChange('guests', e.target.value)}
                className={errors.guests ? 'border-red-300' : ''}
              />
              {errors.guests && (
                <p className="mt-1 text-sm text-red-600">{errors.guests}</p>
              )}
            </div>
          </div>

          {/* วันที่เข้าพัก */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                <Calendar size={16} className="inline mr-2" />
                วันที่เช็กอิน *
              </label>
              <Input
                type="date"
                value={formData.check_in}
                onChange={(e) => handleChange('check_in', e.target.value)}
                min={today}
                className={errors.check_in ? 'border-red-300' : ''}
              />
              {errors.check_in && (
                <p className="mt-1 text-sm text-red-600">{errors.check_in}</p>
              )}
              {isCheckingAvailability && (
                <p className="mt-1 text-xs text-slate-500">กำลังตรวจสอบห้องว่าง...</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                <Calendar size={16} className="inline mr-2" />
                วันที่เช็กเอาต์ *
              </label>
              <Input
                type="date"
                value={formData.check_out}
                onChange={(e) => handleChange('check_out', e.target.value)}
                min={formData.check_in || today}
                className={errors.check_out ? 'border-red-300' : ''}
              />
              {errors.check_out && (
                <p className="mt-1 text-sm text-red-600">{errors.check_out}</p>
              )}
            </div>
          </div>

          {/* สรุปราคา */}
          {nights > 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">จำนวนคืน</span>
                <span className="font-medium text-slate-700">{nights} คืน</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">ราคาต่อคืน</span>
                <span className="font-medium text-slate-700">
                  {formatPrice(room.base_price || room.basePrice)}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 mt-2 flex items-center justify-between">
                <span className="text-base font-semibold text-slate-700">
                  <span className="text-lg font-bold mr-1">฿</span>
                  ราคารวม
                </span>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>
          )}

          {/* ปุ่ม */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || isCheckingAvailability}
            >
              {isLoading ? 'กำลังจองห้อง...' : 'ยืนยันการจอง'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

