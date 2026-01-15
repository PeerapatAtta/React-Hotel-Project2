import React, { useState, useEffect } from 'react'
import MemberLayout from '../../components/member/MemberLayout'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Card from '../../components/Card'
import Container from '../../components/layout/Container'
import { 
  Lock,
  Eye,
  EyeOff,
  Save,
  User,
  Phone,
  Mail
} from 'lucide-react'
import Swal from 'sweetalert2'
import { useAuth } from '../../hooks/useAuth'
import { userService } from '../../services/userService'

// ฟังก์ชัน format เบอร์โทรศัพท์ให้มี "-"
function formatPhoneNumber(phone) {
  if (!phone) return ''
  
  // ลบ "-" และช่องว่างออกก่อน
  const cleaned = phone.replace(/[-\s]/g, '')
  
  // ถ้าไม่ใช่ตัวเลขทั้งหมด ให้คืนค่าเดิม
  if (!/^\d+$/.test(cleaned)) {
    return phone
  }
  
  // Format ตามรูปแบบเบอร์โทรศัพท์ไทย
  if (cleaned.startsWith('0')) {
    if (cleaned.length === 10) {
      // มือถือ: 0XX-XXX-XXXX (เช่น 087-697-6306)
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    } else if (cleaned.length === 9) {
      // เบอร์บ้าน/สำนักงาน: 0X-XXX-XXXX (เช่น 02-123-4567)
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5)}`
    }
  }
  
  // ถ้าไม่ใช่รูปแบบที่รู้จัก ให้คืนค่าเดิม
  return phone
}

// ฟังก์ชันลบ "-" ออกจากเบอร์โทรศัพท์
function cleanPhoneNumber(phone) {
  if (!phone) return ''
  return phone.replace(/[-\s]/g, '')
}

export default function MemberSettingsPage() {
  const { changePassword, user, loadUserProfile } = useAuth()
  
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

  // Profile data
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    email: '',
  })
  const [profileErrors, setProfileErrors] = useState({})
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)

  // Load user profile data
  useEffect(() => {
    if (user) {
      // ตรวจสอบว่า phone ไม่ใช่ email และเป็น string ที่ถูกต้อง
      let phoneValue = user.phone || ''
      
      // ถ้า phone มี @ แสดงว่าเป็น email ให้ล้างออก
      if (phoneValue && phoneValue.includes('@')) {
        phoneValue = ''
      }
      
      // ถ้า phone เท่ากับ email ให้ล้างออก
      if (phoneValue && user.email && phoneValue === user.email) {
        phoneValue = ''
      }
      
      // ถ้า phone เป็น email format (มี .com, .net, etc.) ให้ล้างออก
      if (phoneValue && (phoneValue.includes('.com') || phoneValue.includes('.net') || phoneValue.includes('.org'))) {
        phoneValue = ''
      }
      
      // Format เบอร์โทรศัพท์ให้มี "-"
      if (phoneValue) {
        phoneValue = formatPhoneNumber(phoneValue)
      }
      
      setProfileData({
        name: user.name || '',
        phone: phoneValue,
        email: user.email || '',
      })
    }
  }, [user])

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

  const handleProfileChange = (field, value) => {
    // ถ้าเป็น phone field ให้ format เบอร์โทรศัพท์
    if (field === 'phone') {
      // ลบ "-" ออกก่อน format ใหม่
      const cleaned = cleanPhoneNumber(value)
      // Format ใหม่
      const formatted = formatPhoneNumber(cleaned)
      setProfileData(prev => ({
        ...prev,
        [field]: formatted
      }))
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }))
    }
    
    // Clear error when user types
    if (profileErrors[field]) {
      setProfileErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleUpdateProfile = async () => {
    // Validation
    const errors = {}
    
    if (!profileData.name || profileData.name.trim() === '') {
      errors.name = 'กรุณากรอกชื่อ'
    }
    
    if (profileData.phone && profileData.phone.trim() !== '') {
      // Validate phone format (optional but if provided, should be valid)
      const phoneRegex = /^[0-9-+\s()]*$/
      if (!phoneRegex.test(profileData.phone)) {
        errors.phone = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง'
      }
    }

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors)
      return
    }

    setIsLoadingProfile(true)
    setProfileErrors({})

    try {
      const { data, error: updateError } = await userService.updateUser(user.id, {
        name: profileData.name.trim(),
        phone: cleanPhoneNumber(profileData.phone.trim()) || null, // ลบ "-" ออกก่อนส่งไป backend
      })

      if (updateError) {
        console.error('Error updating profile:', updateError)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: updateError.message || 'ไม่สามารถอัปเดตข้อมูลได้',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#0d9488',
        })
      } else {
        // Reload user profile to update context
        await loadUserProfile(user.id)
        
        Swal.fire({
          icon: 'success',
          title: 'อัปเดตข้อมูลสำเร็จ',
          text: 'ข้อมูลส่วนตัวของคุณถูกอัปเดตเรียบร้อยแล้ว',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#0d9488',
        })
      }
    } catch (err) {
      console.error('Exception updating profile:', err)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: err.message || 'ไม่สามารถอัปเดตข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#0d9488',
      })
    } finally {
      setIsLoadingProfile(false)
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

  return (
    <MemberLayout>
      <div className="space-y-6">
        <Container>
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-primary">ตั้งค่า</h1>
            <p className="text-slate-600 mt-1">จัดการข้อมูลส่วนตัวของคุณ</p>
          </div>
        </Container>

        <Container>
          {/* ข้อมูลส่วนตัว */}
          <Card className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-lg bg-teal-50 p-2">
                <User size={24} className="text-teal-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary">ข้อมูลส่วนตัว</h2>
                <p className="text-sm text-slate-500">จัดการข้อมูลส่วนตัวของคุณ</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div className="relative">
                <div className="absolute left-3 top-9 text-slate-400">
                  <User size={18} />
                </div>
                <Input
                  label="ชื่อ *"
                  type="text"
                  placeholder="กรอกชื่อของคุณ"
                  value={profileData.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  className={`pl-10 ${profileErrors.name ? 'border-red-500' : ''}`}
                  error={profileErrors.name}
                />
              </div>

              {/* Email (Read-only) */}
              <div className="relative">
                <div className="absolute left-3 top-9 text-slate-400">
                  <Mail size={18} />
                </div>
                <Input
                  label="อีเมล"
                  type="email"
                  value={profileData.email}
                  disabled
                  className="!bg-blue-50 !border-blue-200 text-slate-600 cursor-not-allowed pl-10"
                  style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}
                  helperText="ไม่สามารถแก้ไขอีเมลได้"
                />
              </div>

              {/* Phone */}
              <div className="relative">
                <div className="absolute left-3 top-9 text-slate-400">
                  <Phone size={18} />
                </div>
                <Input
                  label="เบอร์โทรศัพท์"
                  type="tel"
                  placeholder="02-123-4567"
                  value={profileData.phone && !profileData.phone.includes('@') && profileData.phone !== profileData.email ? profileData.phone : ''}
                  onChange={(e) => {
                    const value = e.target.value
                    // ป้องกันการกรอก email ในช่อง phone
                    if (!value.includes('@') && value !== profileData.email) {
                      handleProfileChange('phone', value)
                    }
                  }}
                  className={`pl-10 ${profileErrors.phone ? 'border-red-500' : ''}`}
                  error={profileErrors.phone}
                  helperText="กรอกเบอร์โทรศัพท์ (ไม่บังคับ)"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleUpdateProfile} disabled={isLoadingProfile}>
                <Save size={18} />
                {isLoadingProfile ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
              </Button>
            </div>
          </Card>
        </Container>

        <Container>
          {/* บัญชีผู้ใช้ */}
          <Card className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-lg bg-teal-50 p-2">
                <Lock size={24} className="text-teal-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary">บัญชีผู้ใช้</h2>
                <p className="text-sm text-slate-500">เปลี่ยนรหัสผ่านของคุณ</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Current Password */}
              <div className="relative md:col-span-2">
                <div className="absolute left-3 top-9 text-slate-400 z-10">
                  <Lock size={18} />
                </div>
                <Input
                  label="รหัสผ่านปัจจุบัน"
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="กรอกรหัสผ่านปัจจุบัน"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  className="pl-10 pr-10"
                  error={passwordErrors.currentPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 transition-colors z-10"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* New Password */}
              <div className="relative">
                <div className="absolute left-3 top-9 text-slate-400 z-10">
                  <Lock size={18} />
                </div>
                <Input
                  label="รหัสผ่านใหม่"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  className="pl-10 pr-10"
                  error={passwordErrors.newPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 transition-colors z-10"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <div className="absolute left-3 top-9 text-slate-400 z-10">
                  <Lock size={18} />
                </div>
                <Input
                  label="ยืนยันรหัสผ่านใหม่"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="ยืนยันรหัสผ่านใหม่"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  className="pl-10 pr-10"
                  error={passwordErrors.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 transition-colors z-10"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleChangePassword} disabled={isLoadingPassword}>
                <Save size={18} />
                {isLoadingPassword ? 'กำลังเปลี่ยนรหัสผ่าน...' : 'เปลี่ยนรหัสผ่าน'}
              </Button>
            </div>
          </Card>
        </Container>
      </div>
    </MemberLayout>
  )
}

