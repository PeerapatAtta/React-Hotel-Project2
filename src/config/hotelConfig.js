// Hotel Configuration
// ค่าตั้งต้นสำหรับข้อมูลโรงแรม
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

// Function to get hotel website URL
export const getHotelWebsite = () => {
  // ในอนาคตสามารถดึงจาก database หรือ localStorage ได้
  // ตอนนี้ใช้ค่า default จาก config
  return hotelConfig.hotelWebsite
}

