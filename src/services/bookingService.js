import { supabase } from '../lib/supabaseClient'

export const bookingService = {
  /**
   * ดึงข้อมูลการจองทั้งหมด (Admin only)
   */
  async getAllBookings() {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms:room_id (id, name, type, images),
        profiles:user_id (id, name, email)
      `)
      .order('created_at', { ascending: false })
    
    return { data, error }
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
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms:room_id (*),
        profiles:user_id (*)
      `)
      .eq('id', id)
      .single()
    
    return { data, error }
  },

  /**
   * สร้างการจองใหม่
   */
  async createBooking(booking) {
    // คำนวณ nights
    const checkIn = new Date(booking.check_in)
    const checkOut = new Date(booking.check_out)
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))

    // สร้าง booking ID
    const { data: lastBooking } = await supabase
      .from('bookings')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let bookingId = 'BK001'
    if (lastBooking) {
      const lastNum = parseInt(lastBooking.id.replace('BK', ''))
      bookingId = `BK${String(lastNum + 1).padStart(3, '0')}`
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        id: bookingId,
        ...booking,
        nights,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    
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
    const { data, error } = await supabase
      .from('bookings')
      .select('id')
      .eq('room_id', roomId)
      .in('status', ['confirmed', 'pending'])
      .or(`check_in.lte.${checkOut},check_out.gte.${checkIn}`)
    
    return { 
      available: !data || data.length === 0,
      error 
    }
  },

  /**
   * ดึงสถิติการจอง
   */
  async getBookingStatistics() {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('status, total_price, check_in, check_out')

    if (error) return { error }

    const totalRevenue = bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0)

    const totalBookings = bookings.length
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length
    const pendingBookings = bookings.filter(b => b.status === 'pending').length
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length

    const today = new Date().toISOString().split('T')[0]
    const todayStats = {
      checkIns: bookings.filter(b => b.check_in === today && b.status === 'confirmed').length,
      checkOuts: bookings.filter(b => b.check_out === today && b.status === 'confirmed').length,
      newBookings: bookings.filter(b => b.created_at?.startsWith(today)).length,
      revenue: bookings
        .filter(b => b.created_at?.startsWith(today) && b.status === 'confirmed')
        .reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0),
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
        todayStats,
      },
      error: null
    }
  }
}

