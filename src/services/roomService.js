import { supabase } from '../lib/supabaseClient'

export const roomService = {
  /**
   * ดึงข้อมูลห้องทั้งหมด
   */
  async getAllRooms() {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  /**
   * ดึงข้อมูลห้องตาม ID
   */
  async getRoomById(id) {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single()
    
    return { data, error }
  },

  /**
   * สร้างห้องใหม่ (Admin only)
   */
  async createRoom(room) {
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        ...room,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    
    return { data, error }
  },

  /**
   * อัปเดตข้อมูลห้อง (Admin only)
   */
  async updateRoom(id, updates) {
    const { data, error } = await supabase
      .from('rooms')
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
   * ลบห้อง (Admin only)
   */
  async deleteRoom(id) {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id)
    
    return { error }
  },

  /**
   * ค้นหาห้องตามเงื่อนไข
   */
  async searchRooms({ minCapacity, type, searchQuery }) {
    let query = supabase
      .from('rooms')
      .select('*')

    if (minCapacity) {
      query = query.gte('capacity', minCapacity)
    }

    if (type && type !== 'all') {
      query = query.eq('type', type)
    }

    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,type.ilike.%${searchQuery}%`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    
    return { data, error }
  }
}

