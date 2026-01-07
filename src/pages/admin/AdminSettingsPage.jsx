import React, { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Card from '../../components/Card'
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  Bell, 
  Shield, 
  Database,
  Save,
  RefreshCw
} from 'lucide-react'
import Swal from 'sweetalert2'
import { hotelConfig } from '../../config/hotelConfig'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    // ข้อมูลโรงแรม
    hotelName: hotelConfig.hotelName,
    hotelAddress: hotelConfig.hotelAddress,
    hotelPhone: hotelConfig.hotelPhone,
    hotelEmail: hotelConfig.hotelEmail,
    hotelWebsite: hotelConfig.hotelWebsite,
    
    // การแจ้งเตือน
    emailNotifications: true,
    smsNotifications: false,
    bookingConfirmations: true,
    
    // ความปลอดภัย
    requireEmailVerification: false,
    sessionTimeout: '30',
    passwordMinLength: '6',
    
    // ระบบ
    maintenanceMode: false,
    autoBackup: true,
    backupFrequency: 'daily',
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async (section) => {
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      Swal.fire({
        icon: 'success',
        title: 'บันทึกสำเร็จ',
        text: `ตั้งค่า${section}ถูกบันทึกเรียบร้อยแล้ว`,
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#0d9488',
      })
    }, 1000)
  }

  const handleReset = () => {
    Swal.fire({
      title: 'รีเซ็ตการตั้งค่า?',
      text: 'คุณต้องการรีเซ็ตการตั้งค่าทั้งหมดกลับเป็นค่าเริ่มต้นหรือไม่?',
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
          emailNotifications: true,
          smsNotifications: false,
          bookingConfirmations: true,
          requireEmailVerification: false,
          sessionTimeout: '30',
          passwordMinLength: '6',
          maintenanceMode: false,
          autoBackup: true,
          backupFrequency: 'daily',
        })
        
        Swal.fire({
          icon: 'success',
          title: 'รีเซ็ตสำเร็จ',
          text: 'การตั้งค่าถูกรีเซ็ตเป็นค่าเริ่มต้นแล้ว',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#0d9488',
        })
      }
    })
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">ตั้งค่า</h1>
            <p className="text-slate-600 mt-1">จัดการการตั้งค่าระบบ</p>
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
              onClick={() => handleSave('ข้อมูลโรงแรม')}
              disabled={isLoading}
            >
              <Save size={18} />
              {isLoading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
            </Button>
          </div>
        </Card>

        {/* การแจ้งเตือน */}
        <Card className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-lg bg-teal-50 p-2">
              <Bell size={24} className="text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-primary">การแจ้งเตือน</h2>
              <p className="text-sm text-slate-500">จัดการการแจ้งเตือนต่างๆ</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div>
                <p className="font-medium text-slate-700">แจ้งเตือนทางอีเมล</p>
                <p className="text-sm text-slate-500">ส่งการแจ้งเตือนผ่านอีเมล</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
            </label>
            
            <label className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div>
                <p className="font-medium text-slate-700">แจ้งเตือนทาง SMS</p>
                <p className="text-sm text-slate-500">ส่งการแจ้งเตือนผ่าน SMS</p>
              </div>
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
            </label>
            
            <label className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div>
                <p className="font-medium text-slate-700">ยืนยันการจองอัตโนมัติ</p>
                <p className="text-sm text-slate-500">ยืนยันการจองโดยอัตโนมัติ</p>
              </div>
              <input
                type="checkbox"
                checked={settings.bookingConfirmations}
                onChange={(e) => handleChange('bookingConfirmations', e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
            </label>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={() => handleSave('การแจ้งเตือน')}
              disabled={isLoading}
            >
              <Save size={18} />
              {isLoading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
            </Button>
          </div>
        </Card>

        {/* ความปลอดภัย */}
        <Card className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-lg bg-teal-50 p-2">
              <Shield size={24} className="text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-primary">ความปลอดภัย</h2>
              <p className="text-sm text-slate-500">จัดการการตั้งค่าความปลอดภัย</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <label className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div>
                <p className="font-medium text-slate-700">ต้องยืนยันอีเมล</p>
                <p className="text-sm text-slate-500">ผู้ใช้ต้องยืนยันอีเมลก่อนใช้งาน</p>
              </div>
              <input
                type="checkbox"
                checked={settings.requireEmailVerification}
                onChange={(e) => handleChange('requireEmailVerification', e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
            </label>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Session Timeout (นาที)
                </label>
                <Input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleChange('sessionTimeout', e.target.value)}
                  placeholder="30"
                  min="5"
                  max="120"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ความยาวรหัสผ่านขั้นต่ำ
                </label>
                <Input
                  type="number"
                  value={settings.passwordMinLength}
                  onChange={(e) => handleChange('passwordMinLength', e.target.value)}
                  placeholder="6"
                  min="6"
                  max="20"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={() => handleSave('ความปลอดภัย')}
              disabled={isLoading}
            >
              <Save size={18} />
              {isLoading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
            </Button>
          </div>
        </Card>

        {/* ระบบ */}
        <Card className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-lg bg-teal-50 p-2">
              <Database size={24} className="text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-primary">ระบบ</h2>
              <p className="text-sm text-slate-500">จัดการการตั้งค่าระบบ</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <label className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div>
                <p className="font-medium text-slate-700">โหมดบำรุงรักษา</p>
                <p className="text-sm text-slate-500">ปิดการใช้งานเว็บไซต์ชั่วคราว</p>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
            </label>
            
            <label className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div>
                <p className="font-medium text-slate-700">สำรองข้อมูลอัตโนมัติ</p>
                <p className="text-sm text-slate-500">สำรองข้อมูลโดยอัตโนมัติ</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={(e) => handleChange('autoBackup', e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
            </label>
            
            {settings.autoBackup && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ความถี่ในการสำรองข้อมูล
                </label>
                <select
                  value={settings.backupFrequency}
                  onChange={(e) => handleChange('backupFrequency', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="daily">รายวัน</option>
                  <option value="weekly">รายสัปดาห์</option>
                  <option value="monthly">รายเดือน</option>
                </select>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={() => handleSave('ระบบ')}
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

