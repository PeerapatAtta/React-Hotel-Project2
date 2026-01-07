// Hotel Configuration
// ค่าตั้งต้นสำหรับข้อมูลโรงแรม (fallback values)
export const hotelConfig = {
  hotelName: 'Prima Hotel & Rooms',
  hotelAddress: '123/4 ถนนสยาม กรุงเทพฯ',
  hotelPhone: '02-123-4567',
  hotelEmail: 'hello@prima.stay',
  hotelWebsite: 'https://prima.stay',
  
  // Social Media Links
  socialMedia: {
    facebook: 'https://www.facebook.com',
    instagram: 'https://www.instagram.com',
    lineOA: 'https://line.me',
  },
}

// Cache สำหรับเก็บข้อมูลจาก database
let cachedSettings = null

/**
 * ดึงข้อมูลโรงแรมจาก database หรือใช้ค่า default
 */
export async function getHotelSettings() {
  // ถ้ามี cache และยังไม่หมดอายุ ให้ใช้ cache
  if (cachedSettings) {
    return cachedSettings
  }

  try {
    const { getHotelSettings } = await import('../services/settingsService')
    const { data, error } = await getHotelSettings()
    
    if (error || !data) {
      // ถ้าไม่มีข้อมูลใน database ให้ใช้ค่า default
      cachedSettings = hotelConfig
      return hotelConfig
    }

    // แปลงข้อมูลจาก database เป็นรูปแบบเดียวกับ config
    cachedSettings = {
      hotelName: data.hotel_name || hotelConfig.hotelName,
      hotelAddress: data.hotel_address || hotelConfig.hotelAddress,
      hotelPhone: data.hotel_phone || hotelConfig.hotelPhone,
      hotelEmail: data.hotel_email || hotelConfig.hotelEmail,
      hotelWebsite: data.hotel_website || hotelConfig.hotelWebsite,
      socialMedia: hotelConfig.socialMedia, // ยังไม่มีใน database
    }

    return cachedSettings
  } catch (err) {
    console.error('Error loading hotel settings:', err)
    return hotelConfig
  }
}

/**
 * Function to get hotel website URL
 * ดึงจาก database หรือใช้ค่า default
 */
export const getHotelWebsite = async () => {
  const settings = await getHotelSettings()
  return settings.hotelWebsite
}

/**
 * Function to get hotel name
 */
export const getHotelName = async () => {
  const settings = await getHotelSettings()
  return settings.hotelName
}

/**
 * Function to get hotel address
 */
export const getHotelAddress = async () => {
  const settings = await getHotelSettings()
  return settings.hotelAddress
}

/**
 * Function to get hotel phone
 */
export const getHotelPhone = async () => {
  const settings = await getHotelSettings()
  return settings.hotelPhone
}

/**
 * Function to get hotel email
 */
export const getHotelEmail = async () => {
  const settings = await getHotelSettings()
  return settings.hotelEmail
}

/**
 * Clear cache (เรียกเมื่อมีการอัปเดตข้อมูล)
 */
export const clearHotelSettingsCache = () => {
  cachedSettings = null
}

