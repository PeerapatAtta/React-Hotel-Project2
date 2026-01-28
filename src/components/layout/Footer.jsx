import React, { useState, useEffect } from 'react'
import { MapPin, Phone, Mail, Globe, Facebook, Instagram } from 'lucide-react'
import { getHotelSettings } from '../../config/hotelConfig'

export default function Footer() {
  const [hotelInfo, setHotelInfo] = useState({
    hotelName: 'Prima Hotel & Rooms',
    hotelAddress: '123/4 ถนนสยาม กรุงเทพฯ',
    hotelPhone: '02-123-4567',
    hotelEmail: 'hello@prima.stay',
    hotelWebsite: 'https://prima.stay',
  })

  useEffect(() => {
    const loadHotelInfo = async () => {
      const settings = await getHotelSettings()
      setHotelInfo({
        hotelName: settings.hotelName,
        hotelAddress: settings.hotelAddress,
        hotelPhone: settings.hotelPhone,
        hotelEmail: settings.hotelEmail,
        hotelWebsite: settings.hotelWebsite,
      })
    }
    loadHotelInfo()
  }, [])

  // LINE OA Icon Component (custom SVG)
  const LineIcon = ({ size = 20, className = '' }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.086.766.062 1.08L11.057 23.9c-.014.144-.093.36-.188.465-.095.104-.221.223-.366.223-.188 0-.376-.075-.51-.188-.188-.15-.47-.375-.737-.6-2.108-1.77-3.58-3.808-4.576-5.933C2.603 17.612 1.5 14.713 1.5 10.314c0-5.01 4.743-9.086 10.5-9.086s10.5 4.076 10.5 9.086" />
    </svg>
  )

  return (
    <footer id="contact" className="bg-teal-700 text-sm text-white w-full">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:px-8 md:py-16 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-2 flex-shrink-0">
            <p className="text-lg font-semibold text-white">{hotelInfo.hotelName}</p>
            <p className="text-teal-100 leading-relaxed">โรงแรมบูติกใจกลางเมือง พร้อมบริการที่เป็นมิตร</p>
          </div>

          {/* Contact Section */}
          <div className="flex flex-col gap-3 flex-shrink-0">
            <p className="text-lg font-semibold text-teal-50">ติดต่อเรา</p>
            <div className="flex items-start gap-2 text-teal-100">
              <MapPin size={16} className="flex-shrink-0 text-white mt-0.5" />
              <span className="text-white break-words">{hotelInfo.hotelAddress}</span>
            </div>
            <div className="flex items-center gap-2 text-teal-100">
              <Phone size={16} className="flex-shrink-0 text-white" />
              <span className="text-white">{hotelInfo.hotelPhone}</span>
            </div>
            <div className="flex items-center gap-2 text-teal-100">
              <Mail size={16} className="flex-shrink-0 text-white" />
              <span className="text-white break-all">{hotelInfo.hotelEmail}</span>
            </div>
            <div className="flex items-center gap-2 text-teal-100">
              <Globe size={16} className="flex-shrink-0 text-white" />
              <span className="text-white break-all">
                {hotelInfo.hotelWebsite}
              </span>
            </div>
          </div>

          {/* Connect With Us Section */}
          <div className="flex flex-col gap-3 flex-shrink-0">
            <p className="text-lg font-semibold text-teal-50">Connect With Us</p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-teal-100">
                <Facebook size={20} className="flex-shrink-0 text-white" />
                <span className="text-white">Facebook</span>
              </div>
              <div className="flex items-center gap-2 text-teal-100">
                <Instagram size={20} className="flex-shrink-0 text-white" />
                <span className="text-white">Instagram</span>
              </div>
              <div className="flex items-center gap-2 text-teal-100">
                <LineIcon size={20} className="flex-shrink-0 text-white" />
                <span className="text-white">LINE OA</span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="text-teal-100 max-w-sm flex-shrink-0">
            <p className="leading-relaxed">ดูแลโดยทีมงานมีประสบการณ์ พร้อมให้ความช่วยเหลือตลอด 24 ชั่วโมง เพื่อให้การเข้าพักของคุณเป็นไปอย่างราบรื่นและน่าประทับใจ</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

