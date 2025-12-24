import React from 'react'
import { MapPin, Phone, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer id="contact" className="bg-teal-700 text-sm text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:px-8 md:py-16 lg:px-10">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between md:gap-12">
          <div className="space-y-2">
            <p className="text-lg font-semibold text-white">Prima Hotel &amp; Rooms</p>
            <p className="text-teal-100 leading-relaxed">โรงแรมบูติกใจกลางเมือง พร้อมบริการที่เป็นมิตร</p>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-lg font-semibold text-teal-50">ติดต่อเรา</p>
            <div className="flex items-center gap-2 text-teal-100">
              <MapPin size={16} className="flex-shrink-0 text-white" />
              <span className="text-white">123/4 ถนนสยาม กรุงเทพฯ</span>
            </div>
            <div className="flex items-center gap-2 text-teal-100">
              <Phone size={16} className="flex-shrink-0 text-white" />
              <span className="text-white">02-123-4567</span>
            </div>
            <div className="flex items-center gap-2 text-teal-100">
              <Mail size={16} className="flex-shrink-0 text-white" />
              <span className="text-white">hello@prima.stay</span>
            </div>
          </div>
          <div className="text-teal-100 max-w-sm">
            <p className="leading-relaxed">ดูแลโดยทีมงานมีประสบการณ์ พร้อมให้ความช่วยเหลือตลอด 24 ชั่วโมง เพื่อให้การเข้าพักของคุณเป็นไปอย่างราบรื่นและน่าประทับใจ</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

