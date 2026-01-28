import { supabase } from '../lib/supabaseClient'

/**
 * Settings Service
 * จัดการข้อมูลตั้งค่าโรงแรม
 */

/**
 * ดึงข้อมูลตั้งค่าโรงแรม
 */
export async function getHotelSettings() {
  try {
    const { data, error } = await supabase
      .from('hotel_settings')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found, ซึ่งเป็นกรณีปกติถ้ายังไม่มีข้อมูล
      console.error('[settingsService] Error fetching hotel settings:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('[settingsService] Exception:', err)
    return { data: null, error: err }
  }
}

/**
 * อัปเดตข้อมูลตั้งค่าโรงแรม (ใช้ upsert เพื่อให้ทำงานได้ทั้งกรณีที่มีและไม่มีข้อมูล)
 */
export async function updateHotelSettings(settings) {
  try {
    // ดึง id ของ record ที่มีอยู่ (ควรมีแค่ 1 record)
    const { data: existingData } = await supabase
      .from('hotel_settings')
      .select('id')
      .limit(1)
      .maybeSingle()

    // ใช้ upsert โดยระบุ id ถ้ามีข้อมูลอยู่แล้ว หรือไม่ระบุ id ถ้ายังไม่มี
    // ไม่ส่ง hotel_name เพราะไม่สามารถแก้ไขได้
    const upsertData = {
      hotel_address: settings.hotelAddress,
      hotel_phone: settings.hotelPhone,
      hotel_email: settings.hotelEmail,
      hotel_website: settings.hotelWebsite,
    }

    // ถ้ามีข้อมูลอยู่แล้ว ให้ระบุ id เพื่อทำ update
    if (existingData && existingData.id) {
      upsertData.id = existingData.id
    }
    // ถ้ายังไม่มีข้อมูล ไม่ระบุ id ให้ database ใช้ default UUID

    const { data, error } = await supabase
      .from('hotel_settings')
      .upsert(upsertData, {
        onConflict: 'id'  // ใช้ id เป็น conflict resolution key
      })
      .select()
      .single()

    if (error) {
      console.error('[settingsService] Error updating hotel settings:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('[settingsService] Exception:', err)
    return { data: null, error: err }
  }
}

/**
 * สร้างข้อมูลตั้งค่าโรงแรม (สำหรับกรณีที่ยังไม่มีข้อมูล)
 */
export async function createHotelSettings(settings) {
  try {
    // ไม่ระบุ id ให้ database ใช้ default value
    const { data, error } = await supabase
      .from('hotel_settings')
      .insert({
        hotel_name: settings.hotelName,
        hotel_address: settings.hotelAddress,
        hotel_phone: settings.hotelPhone,
        hotel_email: settings.hotelEmail,
        hotel_website: settings.hotelWebsite,
      })
      .select()
      .single()

    if (error) {
      console.error('[settingsService] Error creating hotel settings:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('[settingsService] Exception:', err)
    return { data: null, error: err }
  }
}

