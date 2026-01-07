import React, { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Card from '../../components/Card'
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  Save,
  RefreshCw
} from 'lucide-react'
import Swal from 'sweetalert2'
import { hotelConfig, clearHotelSettingsCache } from '../../config/hotelConfig'
import { getHotelSettings, updateHotelSettings, createHotelSettings } from '../../services/settingsService'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    // ข้อมูลโรงแรม
    hotelName: hotelConfig.hotelName,
    hotelAddress: hotelConfig.hotelAddress,
    hotelPhone: hotelConfig.hotelPhone,
    hotelEmail: hotelConfig.hotelEmail,
    hotelWebsite: hotelConfig.hotelWebsite,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  // โหลดข้อมูลจาก database เมื่อเปิดหน้า
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoadingData(true)
      try {
        const { data, error } = await getHotelSettings()
        
        if (error) {
          console.error('Error loading settings:', error)
          // ถ้าไม่มีข้อมูลใน database ให้ใช้ค่า default จาก config
          return
        }

        if (data) {
          setSettings({
            hotelName: data.hotel_name || hotelConfig.hotelName,
            hotelAddress: data.hotel_address || hotelConfig.hotelAddress,
            hotelPhone: data.hotel_phone || hotelConfig.hotelPhone,
            hotelEmail: data.hotel_email || hotelConfig.hotelEmail,
            hotelWebsite: data.hotel_website || hotelConfig.hotelWebsite,
          })
        }
      } catch (err) {
        console.error('Exception loading settings:', err)
      } finally {
        setIsLoadingData(false)
      }
    }

    loadSettings()
  }, [])

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    
    try {
      // ใช้ upsert ซึ่งจะทำงานได้ทั้งกรณีที่มีและไม่มีข้อมูล
      const { data, error } = await updateHotelSettings(settings)
      
      if (error) {
        console.error('Error saving settings:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.message || 'ไม่สามารถบันทึกข้อมูลได้',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#0d9488',
        })
        setIsLoading(false)
        return
      }

      // Clear cache เพื่อให้ดึงข้อมูลใหม่
      clearHotelSettingsCache()
      
      Swal.fire({
        icon: 'success',
        title: 'บันทึกสำเร็จ',
        text: 'ตั้งค่าข้อมูลโรงแรมถูกบันทึกเรียบร้อยแล้ว',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#0d9488',
      })
    } catch (err) {
      console.error('Exception saving settings:', err)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: err.message || 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#0d9488',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    Swal.fire({
      title: 'รีเซ็ตการตั้งค่า?',
      text: 'คุณต้องการรีเซ็ตข้อมูลโรงแรมกลับเป็นค่าเริ่มต้นหรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่, รีเซ็ต',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
    }).then((result) => {
      if (result.isConfirmed) {
        // Reset to default values
        setSettings({
          hotelName: hotelConfig.hotelName,
          hotelAddress: hotelConfig.hotelAddress,
          hotelPhone: hotelConfig.hotelPhone,
          hotelEmail: hotelConfig.hotelEmail,
          hotelWebsite: hotelConfig.hotelWebsite,
        })
        
        Swal.fire({
          icon: 'success',
          title: 'รีเซ็ตสำเร็จ',
          text: 'ข้อมูลโรงแรมถูกรีเซ็ตเป็นค่าเริ่มต้นแล้ว',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#0d9488',
        })
      }
    })
  }

  if (isLoadingData) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-center py-20">
            <p className="text-slate-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">ตั้งค่า</h1>
            <p className="text-slate-600 mt-1">จัดการข้อมูลโรงแรม</p>
          </div>
          <Button 
            onClick={handleReset} 
            variant="secondary" 
            className="w-full md:w-auto"
          >
            <RefreshCw size={18} />
            รีเซ็ตการตั้งค่า
          </Button>
        </div>

        {/* ข้อมูลโรงแรม */}
        <Card className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-lg bg-teal-50 p-2">
              <Building2 size={24} className="text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-primary">ข้อมูลโรงแรม</h2>
              <p className="text-sm text-slate-500">จัดการข้อมูลพื้นฐานของโรงแรม</p>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Input
              label="ชื่อโรงแรม"
              value={settings.hotelName}
              onChange={(e) => handleChange('hotelName', e.target.value)}
              placeholder="ชื่อโรงแรม"
            />
            <Input
              label="ที่อยู่"
              value={settings.hotelAddress}
              onChange={(e) => handleChange('hotelAddress', e.target.value)}
              placeholder="ที่อยู่โรงแรม"
            />
            <div className="relative">
              <div className="absolute left-3 top-9 text-slate-400">
                <Phone size={18} />
              </div>
              <Input
                label="เบอร์โทรศัพท์"
                value={settings.hotelPhone}
                onChange={(e) => handleChange('hotelPhone', e.target.value)}
                placeholder="02-123-4567"
                className="pl-10"
              />
            </div>
            <div className="relative">
              <div className="absolute left-3 top-9 text-slate-400">
                <Mail size={18} />
              </div>
              <Input
                label="อีเมล"
                type="email"
                value={settings.hotelEmail}
                onChange={(e) => handleChange('hotelEmail', e.target.value)}
                placeholder="hello@prima.stay"
                className="pl-10"
              />
            </div>
            <div className="relative md:col-span-2">
              <div className="absolute left-3 top-9 text-slate-400">
                <Globe size={18} />
              </div>
              <Input
                label="เว็บไซต์"
                value={settings.hotelWebsite}
                onChange={(e) => handleChange('hotelWebsite', e.target.value)}
                placeholder="https://prima.stay"
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={handleSave}
              disabled={isLoading}
            >
              <Save size={18} />
              {isLoading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
            </Button>
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}

