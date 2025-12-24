import { supabase } from '../lib/supabaseClient'

export const userService = {
  /**
   * ดึงข้อมูลผู้ใช้ทั้งหมด (Admin only)
   */
  async getAllUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  /**
   * ดึงข้อมูลผู้ใช้ตาม ID
   */
  async getUserById(id) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    
    return { data, error }
  },

  /**
   * อัปเดตข้อมูลผู้ใช้
   */
  async updateUser(id, updates) {
    const { data, error } = await supabase
      .from('profiles')
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
   * อัปเดต role ของผู้ใช้ (Admin only)
   */
  async updateUserRole(id, role) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  /**
   * อัปเดตสถานะผู้ใช้ (Admin only)
   */
  async updateUserStatus(id, status) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  }
}

