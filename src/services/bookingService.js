import { supabase } from '../lib/supabaseClient'

export const bookingService = {
  /**
   * ดึงข้อมูลการจองทั้งหมด (Admin only)
   */
  async getAllBookings() {
    // Query แบบง่ายก่อนเพื่อหลีกเลี่ยงปัญหา foreign key join
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError)
      return { data: null, error: bookingsError }
    }

    // ถ้าไม่มีข้อมูล bookings ให้ return ทันที
    if (!bookings || bookings.length === 0) {
      return { data: [], error: null }
    }

    // ดึงข้อมูล rooms และ profiles แยก (ถ้าต้องการ)
    const roomIds = [...new Set(bookings.map(b => b.room_id).filter(Boolean))]
    const userIds = [...new Set(bookings.map(b => b.user_id).filter(Boolean))]

    const { data: rooms } = await supabase
      .from('rooms')
      .select('id, name, type, images')
      .in('id', roomIds)

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', userIds)

    // รวมข้อมูล
    const bookingsWithDetails = bookings.map(booking => {
      const room = rooms?.find(r => r.id === booking.room_id)
      const profile = profiles?.find(p => p.id === booking.user_id)

      return {
        ...booking,
        roomName: room?.name || booking.room_name,
        roomType: room?.type,
        roomImages: room?.images,
        guestName: booking.guest_name,
        creatorName: profile?.name,
        creatorEmail: profile?.email,
        profiles: profile ? {
          name: profile.name,
          email: profile.email
        } : null,
      }
    })

    return { data: bookingsWithDetails, error: null }
  },

  /**
   * ดึงข้อมูลการจองตาม User ID
   */
  async getBookingsByUserId(userId) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms:room_id (id, name, type, images)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  /**
   * ดึงข้อมูลการจองตาม ID
   */
  async getBookingById(id) {
    // Query แบบง่ายเพื่อหลีกเลี่ยงปัญหา foreign key join
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single()

    if (bookingError) {
      console.error('Error fetching booking:', bookingError)
      return { data: null, error: bookingError }
    }

    if (!booking) {
      return { data: null, error: { message: 'ไม่พบข้อมูลการจอง' } }
    }

    // ดึงข้อมูล rooms และ profiles แยก (ถ้าต้องการ)
    const { data: room } = await supabase
      .from('rooms')
      .select('id, name, type, images')
      .eq('id', booking.room_id)
      .single()

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq('id', booking.user_id)
      .single()

    return {
      data: {
        ...booking,
        roomName: room?.name || booking.room_name,
        roomType: room?.type,
        roomImages: room?.images,
        guestName: booking.guest_name,
        creatorName: profile?.name,
        creatorEmail: profile?.email,
      },
      error: null
    }
  },

  /**
   * สร้างการจองใหม่
   */
  async createBooking(booking) {
    // คำนวณ nights
    const checkIn = new Date(booking.check_in)
    const checkOut = new Date(booking.check_out)
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))

    // สร้าง booking ID ที่ไม่ซ้ำโดยใช้ RPC function ที่ bypass RLS
    // RLS policy ทำให้ member เห็นแค่ bookings ของตัวเอง จึงต้องใช้ function ที่ bypass RLS
    let bookingId = 'BK001'
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      // ใช้ RPC function เพื่อดึง max booking ID (bypass RLS)
      const { data: maxIdResult, error: maxIdError } = await supabase
        .rpc('get_max_booking_id')

      if (maxIdError) {
        // ถ้า RPC function ไม่มี ให้ใช้วิธีเดิม (fallback)
        const { data: currentBookings } = await supabase
          .from('bookings')
          .select('id')
          .order('created_at', { ascending: false })
          .limit(100)

        if (currentBookings && currentBookings.length > 0) {
          const maxId = currentBookings.reduce((max, b) => {
            const match = b.id.match(/^BK(\d+)$/)
            if (match) {
              const num = parseInt(match[1], 10)
              return num > max ? num : max
            }
            return max
          }, 0)
          bookingId = `BK${String(maxId + 1).padStart(3, '0')}`
        }
      } else {
        bookingId = maxIdResult || 'BK001'
      }

      // ตรวจสอบว่า ID นี้มีอยู่แล้วหรือไม่ (ใช้ RPC function ที่ bypass RLS)
      const { data: checkExistsResult, error: checkExistsError } = await supabase
        .rpc('check_booking_id_exists', { booking_id: bookingId })

      const idExists = checkExistsError ? false : (checkExistsResult === true)

      if (!idExists) {
        // ID นี้ยังไม่มี ใช้ได้
        break
      }

      // ID มีอยู่แล้ว ลองครั้งถัดไป (เพิ่ม ID)
      const match = bookingId.match(/^BK(\d+)$/)
      if (match) {
        const num = parseInt(match[1], 10)
        bookingId = `BK${String(num + 1).padStart(3, '0')}`
      } else {
        bookingId = 'BK001'
      }

      attempts++
    }

    if (attempts >= maxAttempts) {
      return {
        data: null,
        error: { message: 'ไม่สามารถสร้าง booking ID ที่ไม่ซ้ำได้ กรุณาลองใหม่อีกครั้ง' }
      }
    }

    // สร้าง insert payload พร้อม ID ที่สร้างเอง
    const insertPayload = {
      id: bookingId,
      room_id: booking.room_id,
      user_id: booking.user_id || null,
      room_name: booking.room_name,
      guest_name: booking.guest_name,
      email: booking.email,
      phone: booking.phone,
      check_in: booking.check_in,
      check_out: booking.check_out,
      nights: nights,
      guests: booking.guests,
      total_price: booking.total_price,
      status: booking.status || 'pending',
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert(insertPayload)
      .select()
      .single()

    // ถ้าเกิด duplicate key error ให้ retry (แต่ควรจะไม่เกิดเพราะเราเช็คแล้ว)
    if (error && error.code === '23505') {
      // Log error for debugging (optional - can remove if not needed)
      console.error('Duplicate key error despite check:', { bookingId, error })
    }

    return { data, error }
  },

  /**
   * อัปเดตสถานะการจอง
   */
  async updateBookingStatus(id, status) {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  /**
   * อัปเดตข้อมูลการจอง
   */
  async updateBooking(id, updates) {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  /**
   * ลบการจอง
   */
  async deleteBooking(id) {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id)

    return { error }
  },

  /**
   * ตรวจสอบห้องว่างในช่วงวันที่
   */
  async checkRoomAvailability(roomId, checkIn, checkOut) {
    // ใช้ RPC function เพื่อ bypass RLS และตรวจสอบห้องว่างได้แม้ยังไม่ login
    const { data, error } = await supabase
      .rpc('check_room_availability', {
        p_room_id: roomId,
        p_check_in: checkIn,
        p_check_out: checkOut
      })

    if (error) {
      // ถ้า RPC function ไม่มี ให้ใช้วิธีเดิม (fallback)
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id')
        .eq('room_id', roomId)
        .in('status', ['confirmed', 'pending'])
        .lt('check_in', checkOut)  // การจองเริ่มก่อนที่เราจะออก
        .gt('check_out', checkIn)  // การจองจบหลังที่เราจะเข้า

      return {
        available: !bookings || bookings.length === 0,
        error: bookingsError
      }
    }

    return {
      available: data === true,
      error: null
    }
  },

  /**
   * ดึงสถิติการจอง
   */
  async getBookingStatistics() {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('status, total_price, check_in, check_out, created_at')

    if (error) {
      console.error('Error fetching booking statistics:', error)
      return { error }
    }

    // ตรวจสอบว่า bookings เป็น array หรือไม่
    if (!bookings || !Array.isArray(bookings)) {
      return {
        data: {
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
        },
        error: null
      }
    }

    const totalRevenue = bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0)

    const totalBookings = bookings.length
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length
    const pendingBookings = bookings.filter(b => b.status === 'pending').length
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length

    const today = new Date().toISOString().split('T')[0]
    const todayStats = {
      // เช็กอินวันนี้: นับเฉพาะ confirmed และ pending (ไม่นับ cancelled)
      checkIns: bookings.filter(b => {
        const checkIn = b.check_in || b.checkIn
        return checkIn === today && b.status !== 'cancelled'
      }).length,
      // เช็กเอาต์วันนี้: นับเฉพาะ confirmed และ pending (ไม่นับ cancelled)
      checkOuts: bookings.filter(b => {
        const checkOut = b.check_out || b.checkOut
        return checkOut === today && b.status !== 'cancelled'
      }).length,
      newBookings: bookings.filter(b => b.created_at?.startsWith(today)).length,
      revenue: bookings
        .filter(b => b.created_at?.startsWith(today) && b.status === 'confirmed')
        .reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0),
    }

    // คำนวณ monthlyRevenue (ย้อนหลัง 6 เดือน)
    const monthlyRevenue = []
    const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const year = date.getFullYear()
      const month = date.getMonth()

      const monthRevenueAmount = bookings
        .filter(b => {
          if (!b.created_at) return false
          const bookingDate = new Date(b.created_at)
          return bookingDate.getFullYear() === year &&
            bookingDate.getMonth() === month &&
            b.status === 'confirmed'
        })
        .reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0)

      monthlyRevenue.push({
        month: monthNames[month],
        revenue: monthRevenueAmount
      })
    }

    return {
      data: {
        totalRevenue,
        totalBookings,
        activeBookings: confirmedBookings,
        availableRooms: 0, // จะต้องคำนวณจากจำนวนห้องทั้งหมด
        occupancyRate: 0, // จะต้องคำนวณจากจำนวนห้องทั้งหมด
        confirmedBookings,
        pendingBookings,
        cancelledBookings,
        monthlyRevenue,
        todayStats,
      },
      error: null
    }
  }
}
