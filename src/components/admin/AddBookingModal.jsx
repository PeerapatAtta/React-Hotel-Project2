import React, { useState, useEffect, useCallback } from 'react'
import { X, Calendar, Users, Mail, Phone, Home, User } from 'lucide-react'
import Button from '../Button'
import Input from '../Input'
import { bookingService } from '../../services/bookingService'
import { roomService } from '../../services/roomService'
import Swal from 'sweetalert2'
import { formatPrice } from '../../utils/formatters'
import { useAuth } from '../../hooks/useAuth'

export default function AddBookingModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    room_id: '',
    guest_name: '',
    email: '',
    phone: '',
    check_in: '',
    check_out: '',
    guests: '2',
    status: 'pending',
  })
  const [rooms, setRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingRooms, setIsLoadingRooms] = useState(false)
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)

  // ดึงข้อมูลห้องทั้งหมด
  useEffect(() => {
    if (isOpen) {
      fetchRooms()
    }
  }, [isOpen])

  // เมื่อเลือกห้อง ให้ดึงข้อมูลห้อง
  useEffect(() => {
    if (formData.room_id) {
      const room = rooms.find(r => r.id === formData.room_id)
      setSelectedRoom(room || null)
    } else {
      setSelectedRoom(null)
    }
  }, [formData.room_id, rooms])

  const fetchRooms = async () => {
    setIsLoadingRooms(true)
    try {
      const { data, error } = await roomService.getAllRooms()
      if (error) {
        console.error('Error fetching rooms:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถโหลดข้อมูลห้องได้',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#0d9488',
        })
      } else {
        setRooms(data || [])
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setIsLoadingRooms(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // คำนวณจำนวนคืนและราคารวม
  const calculateBooking = () => {
    if (!formData.check_in || !formData.check_out || !selectedRoom) {
      return { nights: 0, totalPrice: 0 }
    }

    const checkIn = new Date(formData.check_in)
    const checkOut = new Date(formData.check_out)
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
    const totalPrice = nights > 0 ? parseFloat(selectedRoom.base_price) * nights : 0

    return { nights, totalPrice }
  }

  const { nights, totalPrice } = calculateBooking()

  // ตรวจสอบห้องว่าง
  const checkAvailability = useCallback(async () => {
    if (!formData.room_id || !formData.check_in || !formData.check_out) {
      return
    }

    setIsCheckingAvailability(true)
    try {
      const { available, error } = await bookingService.checkRoomAvailability(
        formData.room_id,
        formData.check_in,
        formData.check_out
      )

      if (error) {
        console.error('Error checking availability:', error)
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
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setIsCheckingAvailability(false)
    }
  }, [formData.room_id, formData.check_in, formData.check_out])

  // ตรวจสอบห้องว่างเมื่อเลือกวันที่ (ใช้ debounce เพื่อหลีกเลี่ยงการเรียก API บ่อยเกินไป)
  useEffect(() => {
    if (formData.room_id && formData.check_in && formData.check_out) {
      const checkIn = new Date(formData.check_in)
      const checkOut = new Date(formData.check_out)
      if (checkOut > checkIn) {
        // ใช้ setTimeout เพื่อ debounce การเรียก API
        const timer = setTimeout(() => {
          checkAvailability()
        }, 500) // รอ 500ms หลังจากผู้ใช้หยุดพิมพ์

        return () => clearTimeout(timer)
      }
    }
  }, [formData.room_id, formData.check_in, formData.check_out, checkAvailability])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.room_id) {
      newErrors.room_id = 'กรุณาเลือกห้อง'
    }
    if (!formData.guest_name.trim()) {
      newErrors.guest_name = 'กรุณากรอกชื่อผู้เข้าพัก'
    }
    // Email เป็น optional แต่ถ้ากรอกต้องเป็นรูปแบบที่ถูกต้อง
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
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
    } else if (selectedRoom && Number(formData.guests) > selectedRoom.capacity) {
      newErrors.guests = `จำนวนผู้เข้าพักต้องไม่เกิน ${selectedRoom.capacity} คน`
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
    if (formData.room_id && formData.check_in && formData.check_out) {
      const { available, error: availabilityError } = await bookingService.checkRoomAvailability(
        formData.room_id,
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
        room_id: formData.room_id,
        room_name: selectedRoom.name,
        guest_name: formData.guest_name.trim(),
        email: formData.email.trim() || '',
        phone: formData.phone.trim(),
        check_in: formData.check_in,
        check_out: formData.check_out,
        guests: parseInt(formData.guests),
        total_price: totalPrice,
        status: formData.status,
        user_id: user?.id || null, // เก็บ user_id ของ admin ที่สร้างการจอง
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
          title: 'สำเร็จ',
          text: 'สร้างการจองสำเร็จ',
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
    setFormData({
      room_id: '',
      guest_name: '',
      email: '',
      phone: '',
      check_in: '',
      check_out: '',
      guests: '2',
      status: 'pending',
    })
    setSelectedRoom(null)
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-[95%] md:w-[60%] min-w-[320px] max-w-[1200px] max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h2 className="text-2xl font-bold text-primary">เพิ่มการจองใหม่</h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ชื่อผู้จอง (Admin) */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              <User size={16} className="inline mr-2" />
              ชื่อผู้จอง
            </label>
            <Input
              type="text"
              value={user?.name || ''}
              disabled
              readOnly
              className="bg-slate-50 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-slate-500">ชื่อผู้ดูแลระบบที่สร้างการจองนี้</p>
          </div>

          {/* เลือกห้อง */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              <Home size={16} className="inline mr-2" />
              เลือกห้อง *
            </label>
            {isLoadingRooms ? (
              <div className="text-sm text-slate-500">กำลังโหลดข้อมูลห้อง...</div>
            ) : (
              <select
                value={formData.room_id}
                onChange={(e) => handleChange('room_id', e.target.value)}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${errors.room_id ? 'border-red-300' : 'border-slate-200 bg-white'
                  }`}
              >
                <option value="">-- เลือกห้อง --</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} ({room.type}) - {room.capacity} คน - {formatPrice(room.base_price)}/คืน
                  </option>
                ))}
              </select>
            )}
            {errors.room_id && (
              <p className="mt-1 text-sm text-red-600">{errors.room_id}</p>
            )}
            {selectedRoom && (
              <div className="mt-2 rounded-lg bg-slate-50 p-3 text-sm">
                <p className="font-medium text-slate-700">ข้อมูลห้อง</p>
                <p className="text-slate-600">ประเภท: {selectedRoom.type}</p>
                <p className="text-slate-600">ความจุ: {selectedRoom.capacity} คน</p>
                <p className="text-slate-600">ราคาต่อคืน: {formatPrice(selectedRoom.base_price)}</p>
              </div>
            )}
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
                อีเมล
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
                max={selectedRoom?.capacity || 10}
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
                min={new Date().toISOString().split('T')[0]}
                className={errors.check_in ? 'border-red-300' : ''}
              />
              {errors.check_in && (
                <p className="mt-1 text-sm text-red-600">{errors.check_in}</p>
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
                min={formData.check_in || new Date().toISOString().split('T')[0]}
                className={errors.check_out ? 'border-red-300' : ''}
              />
              {errors.check_out && (
                <p className="mt-1 text-sm text-red-600">{errors.check_out}</p>
              )}
            </div>
          </div>

          {/* สถานะ */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              สถานะการจอง
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="pending">รอจ่ายเงิน</option>
              <option value="confirmed">จ่ายเงินแล้ว</option>
            </select>
          </div>

          {/* สรุปราคา */}
          {nights > 0 && selectedRoom && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">จำนวนคืน</span>
                <span className="font-medium text-slate-700">{nights} คืน</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">ราคาต่อคืน</span>
                <span className="font-medium text-slate-700">
                  {formatPrice(selectedRoom.base_price)}
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
              {isLoading ? 'กำลังสร้างการจอง...' : 'สร้างการจอง'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

