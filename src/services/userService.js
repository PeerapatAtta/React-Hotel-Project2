import { supabase } from '../lib/supabaseClient'

export const userService = {
    /**
     * ดึงข้อมูลผู้ใช้ทั้งหมด (Admin only)
     */
    async getAllUsers() {
        console.log('[userService] Fetching all users from profiles table...')
        
        // ดึงข้อมูล profiles
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })

        if (profilesError) {
            console.error('[userService] Error fetching profiles:', profilesError)
            return { data: null, error: profilesError }
        }

        if (!profiles || profiles.length === 0) {
            console.log('[userService] No profiles found')
            return { data: [], error: null }
        }

        // ดึงจำนวนการจองของแต่ละ user
        const userIds = profiles.map(p => p.id)
        const { data: bookingsCount, error: bookingsError } = await supabase
            .from('bookings')
            .select('user_id')
            .in('user_id', userIds)

        if (bookingsError) {
            console.error('[userService] Error fetching bookings count:', bookingsError)
            // ถ้าเกิด error ในการนับ bookings ให้ return profiles โดยไม่มี totalBookings
            return { data: profiles.map(p => ({ ...p, totalBookings: 0 })), error: null }
        }

        // นับจำนวนการจองของแต่ละ user
        const bookingsCountMap = {}
        if (bookingsCount) {
            bookingsCount.forEach(booking => {
                if (booking.user_id) {
                    bookingsCountMap[booking.user_id] = (bookingsCountMap[booking.user_id] || 0) + 1
                }
            })
        }

        // รวมข้อมูล profiles กับจำนวนการจอง
        const usersWithBookings = profiles.map(profile => ({
            ...profile,
            totalBookings: bookingsCountMap[profile.id] || 0
        }))

        console.log('[userService] Query result:', {
            hasData: !!usersWithBookings,
            dataLength: usersWithBookings?.length,
            hasError: false
        })

        return { data: usersWithBookings, error: null }
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
    },

    /**
     * ลบผู้ใช้ (Admin only)
     * หมายเหตุ: ฟังก์ชันนี้จะลบเฉพาะจาก profiles table
     * สำหรับการลบจาก auth.users ต้องใช้ Supabase Admin API
     */
    async deleteUser(id) {
        console.log('[userService] Deleting user:', id)
        
        // ลบจาก profiles table
        const { data, error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id)
            .select()

        if (error) {
            console.error('[userService] Error deleting user:', error)
            return { error }
        }

        console.log('[userService] User deleted successfully:', data)
        return { data, error: null }
    }
}

