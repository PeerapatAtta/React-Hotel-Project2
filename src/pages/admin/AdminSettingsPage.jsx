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
  Lock,
  Eye,
  EyeOff,
  MapPin
} from 'lucide-react'
import Swal from 'sweetalert2'
import { hotelConfig, clearHotelSettingsCache } from '../../config/hotelConfig'
import { getHotelSettings, updateHotelSettings, createHotelSettings } from '../../services/settingsService'
import { useAuth } from '../../hooks/useAuth'

export default function AdminSettingsPage() {
  const { changePassword } = useAuth()

  const [settings, setSettings] = useState({
    // ข้อมูลโรงแรม
    hotelName: hotelConfig.hotelName,
    hotelAddress: hotelConfig.hotelAddress,
    hotelPhone: hotelConfig.hotelPhone,
    hotelEmail: hotelConfig.hotelEmail,
    hotelWebsite: hotelConfig.hotelWebsite,
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [passwordErrors, setPasswordErrors] = useState({})
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoadingPassword, setIsLoadingPassword] = useState(false)

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
          // ถ้าไม่มีข้อมูลใน database ให้ใช้ค่า default จาก config (settings state ถูกตั้งค่าไว้แล้วจาก hotelConfig)
        } else if (data) {
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
        // ถ้าเกิด exception ให้ใช้ค่า default จาก config (settings state ถูกตั้งค่าไว้แล้วจาก hotelConfig)
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
      // ไม่ส่ง hotelName ไปเพราะไม่สามารถแก้ไขได้
      const { hotelName, ...settingsToSave } = settings
      // ใช้ upsert ซึ่งจะทำงานได้ทั้งกรณีที่มีและไม่มีข้อมูล
      const { data, error } = await updateHotelSettings(settingsToSave)

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


  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user types
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleChangePassword = async () => {
    // Validation
    const errors = {}

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'กรุณากรอกรหัสผ่านปัจจุบัน'
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'กรุณากรอกรหัสผ่านใหม่'
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร'
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'กรุณายืนยันรหัสผ่านใหม่'
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'รหัสผ่านใหม่ไม่ตรงกัน'
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors)
      return
    }

    setIsLoadingPassword(true)
    setPasswordErrors({})

    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword)

      if (result.success) {
        // Clear form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })

        Swal.fire({
          icon: 'success',
          title: 'เปลี่ยนรหัสผ่านสำเร็จ',
          text: 'รหัสผ่านของคุณถูกเปลี่ยนเรียบร้อยแล้ว',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#0d9488',
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: result.error || 'ไม่สามารถเปลี่ยนรหัสผ่านได้',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#0d9488',
        })
      }
    } catch (err) {
      console.error('Exception changing password:', err)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: err.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#0d9488',
      })
    } finally {
      setIsLoadingPassword(false)
    }
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
        <div>
          <h1 className="text-3xl font-bold text-primary">ตั้งค่า</h1>
          <p className="text-slate-600 mt-1">จัดการข้อมูลโรงแรม</p>
        </div>

        {/* ข้อมูลโรงแรม */}
        <Card className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="rounded-lg bg-teal-50 p-2.5">
              <Building2 size={24} className="text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-primary">ข้อมูลโรงแรม</h2>
              <p className="text-sm text-slate-500 mt-0.5">จัดการข้อมูลพื้นฐานของโรงแรม</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* ที่อยู่ */}
            <div className="relative group">
              <div className="absolute left-3 top-9 text-slate-400 z-10 transition-colors group-focus-within:text-teal-600">
                <MapPin size={18} />
              </div>
              <Input
                label="ที่อยู่"
                value={settings.hotelAddress}
                onChange={(e) => handleChange('hotelAddress', e.target.value)}
                placeholder="ที่อยู่โรงแรม"
                className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            {/* เบอร์โทรศัพท์ */}
            <div className="relative group">
              <div className="absolute left-3 top-9 text-slate-400 z-10 transition-colors group-focus-within:text-teal-600">
                <Phone size={18} />
              </div>
              <Input
                label="เบอร์โทรศัพท์"
                value={settings.hotelPhone}
                onChange={(e) => handleChange('hotelPhone', e.target.value)}
                placeholder="02-123-4567"
                className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            {/* อีเมล */}
            <div className="relative group">
              <div className="absolute left-3 top-9 text-slate-400 z-10 transition-colors group-focus-within:text-teal-600">
                <Mail size={18} />
              </div>
              <Input
                label="อีเมล"
                type="email"
                value={settings.hotelEmail}
                onChange={(e) => handleChange('hotelEmail', e.target.value)}
                placeholder="hello@prima.stay"
                className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            {/* เว็บไซต์ */}
            <div className="relative group">
              <div className="absolute left-3 top-9 text-slate-400 z-10 transition-colors group-focus-within:text-teal-600">
                <Globe size={18} />
              </div>
              <Input
                label="เว็บไซต์"
                value={settings.hotelWebsite}
                onChange={(e) => handleChange('hotelWebsite', e.target.value)}
                placeholder="https://prima.stay"
                className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="min-w-[160px] shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <Save size={18} />
              {isLoading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
            </Button>
          </div>
        </Card>

        {/* บัญชีผู้ใช้ */}
        <Card className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="rounded-lg bg-teal-50 p-2.5">
              <Lock size={24} className="text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-primary">บัญชีผู้ใช้</h2>
              <p className="text-sm text-slate-500 mt-0.5">เปลี่ยนรหัสผ่านของคุณ</p>
            </div>
          </div>

          {/* Notice Message */}
          <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm font-medium text-amber-800 text-center">
              ⚠️ ฟีเจอร์นี้ยังไม่เปิดใช้งาน
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* รหัสผ่านปัจจุบัน */}
            <div className="relative md:col-span-2 group">
              <div className="absolute left-3 top-9 text-slate-400 z-10">
                <Lock size={18} />
              </div>
              <Input
                label="รหัสผ่านปัจจุบัน"
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                placeholder="กรอกรหัสผ่านปัจจุบัน"
                className="pl-10 pr-10 transition-all duration-200"
                error={passwordErrors.currentPassword}
                disabled={true}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-9 text-slate-300 cursor-not-allowed z-10"
                tabIndex={-1}
                disabled={true}
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* รหัสผ่านใหม่ */}
            <div className="relative group">
              <div className="absolute left-3 top-9 text-slate-400 z-10">
                <Lock size={18} />
              </div>
              <Input
                label="รหัสผ่านใหม่"
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                className="pl-10 pr-10 transition-all duration-200"
                error={passwordErrors.newPassword}
                disabled={true}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-9 text-slate-300 cursor-not-allowed z-10"
                tabIndex={-1}
                disabled={true}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* ยืนยันรหัสผ่านใหม่ */}
            <div className="relative group">
              <div className="absolute left-3 top-9 text-slate-400 z-10">
                <Lock size={18} />
              </div>
              <Input
                label="ยืนยันรหัสผ่านใหม่"
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                placeholder="ยืนยันรหัสผ่านใหม่"
                className="pl-10 pr-10 transition-all duration-200"
                error={passwordErrors.confirmPassword}
                disabled={true}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-slate-300 cursor-not-allowed z-10"
                tabIndex={-1}
                disabled={true}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
            <Button
              onClick={handleChangePassword}
              disabled={true}
              className="min-w-[160px] shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <Lock size={18} />
              {isLoadingPassword ? 'กำลังเปลี่ยนรหัสผ่าน...' : 'เปลี่ยนรหัสผ่าน'}
            </Button>
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}

