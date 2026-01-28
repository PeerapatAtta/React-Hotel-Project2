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

  // LINE OA Icon Component (Simple circle with LINE text)
  const LineIcon = ({ size = 20, className = '' }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* White circle outline */}
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* LINE text - white */}
      <text
        x="12"
        y="13"
        fontSize="7"
        fontWeight="700"
        fill="currentColor"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        letterSpacing="0.3"
      >
        LINE
      </text>
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
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  <LineIcon size={20} className="text-white" />
                </div>
                <span className="text-white font-medium">LINE OA</span>
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

