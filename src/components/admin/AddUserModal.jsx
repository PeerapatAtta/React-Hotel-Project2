import React, { useState } from 'react'
import { X, Mail, Phone, User, Shield, Eye, EyeOff } from 'lucide-react'
import Button from '../Button'
import Input from '../Input'
import { supabase } from '../../lib/supabaseClient'
import Swal from 'sweetalert2'

export default function AddUserModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'member',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'กรุณากรอกชื่อ'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'กรุณากรอกอีเมล'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง'
    }

    if (!formData.password) {
      newErrors.password = 'กรุณากรอกรหัสผ่าน'
    } else if (formData.password.length < 6) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'กรุณายืนยันรหัสผ่าน'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน'
    }

    if (formData.phone && formData.phone.trim() && !/^[0-9-+\s()]+$/.test(formData.phone.trim())) {
      newErrors.phone = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      // สร้าง user ใน Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            name: formData.name.trim(),
            role: formData.role,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      })

      if (authError) {
        console.error('Error creating user:', authError)
        
        let errorMessage = authError.message || 'ไม่สามารถสร้างผู้ใช้ได้'
        
        // แปลง error message เป็นภาษาไทย
        if (authError.message?.includes('already registered') || authError.message?.includes('User already registered')) {
          errorMessage = 'อีเมลนี้ถูกใช้งานแล้ว'
        } else if (authError.message?.includes('Password')) {
          errorMessage = 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบความยาวและรูปแบบ'
        } else if (authError.message?.includes('Invalid email')) {
          errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง'
        }

        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: errorMessage,
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#0d9488',
        })
        setIsLoading(false)
        return
      }

      if (!authData.user) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถสร้างผู้ใช้ได้',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#0d9488',
        })
        setIsLoading(false)
        return
      }

      // รอให้ trigger สร้าง profile (ประมาณ 1 วินาที)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // อัปเดต profile ที่ถูกสร้างโดย trigger
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: formData.name.trim(),
          phone: formData.phone.trim() || null,
          role: formData.role,
          status: 'active', // Default status is always 'active'
        })
        .eq('id', authData.user.id)

      if (profileError) {
        console.error('Error updating profile:', profileError)
        // ไม่ throw error เพราะ user ถูกสร้างแล้ว แค่ profile อาจจะยังไม่ถูกอัปเดต
      }

      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: 'เพิ่มผู้ใช้ใหม่เรียบร้อยแล้ว',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#0d9488',
      })

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'member',
      })

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Exception creating user:', error)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error.message || 'ไม่สามารถสร้างผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#0d9488',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'member',
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-[95%] md:w-[500px] max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h2 className="text-2xl font-bold text-primary">เพิ่มผู้ใช้ใหม่</h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* ชื่อ */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              <User size={16} className="inline mr-2" />
              ชื่อ *
            </label>
            <Input
              type="text"
              placeholder="กรอกชื่อผู้ใช้"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
              disabled={isLoading}
            />
          </div>

          {/* อีเมล */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              <Mail size={16} className="inline mr-2" />
              อีเมล *
            </label>
            <Input
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
              disabled={isLoading}
            />
          </div>

          {/* เบอร์โทรศัพท์ */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              <Phone size={16} className="inline mr-2" />
              เบอร์โทรศัพท์
            </label>
            <Input
              type="tel"
              placeholder="081-234-5678"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              error={errors.phone}
              disabled={isLoading}
            />
          </div>

          {/* รหัสผ่าน */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              รหัสผ่าน *
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="กรอกรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                error={errors.password}
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors z-10"
                disabled={isLoading}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* ยืนยันรหัสผ่าน */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              ยืนยันรหัสผ่าน *
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors z-10"
                disabled={isLoading}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* บทบาท */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              <Shield size={16} className="inline mr-2" />
              บทบาท *
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${
                errors.role ? 'border-red-300' : 'border-slate-200 bg-white'
              }`}
              disabled={isLoading}
            >
              <option value="member">สมาชิก</option>
              <option value="admin">ผู้ดูแลระบบ</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'กำลังสร้างผู้ใช้...' : 'สร้างผู้ใช้'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

