import React, { useState, useEffect } from 'react'
import { X, Mail, Phone, User } from 'lucide-react'
import Button from '../Button'
import Input from '../Input'
import { userService } from '../../services/userService'
import Swal from 'sweetalert2'
import LoadingSpinner from '../LoadingSpinner'

export default function EditUserModal({ isOpen, onClose, onSuccess, userId }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUser, setIsLoadingUser] = useState(false)

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserData()
    }
  }, [isOpen, userId])

  const fetchUserData = async () => {
    setIsLoadingUser(true)
    try {
      const { data, error } = await userService.getUserById(userId)
      
      if (error) {
        console.error('Error fetching user:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.message || 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#0d9488',
        })
        onClose()
        return
      }

      if (data) {
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          status: data.status || 'active',
        })
      }
    } catch (err) {
      console.error('Error:', err)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#0d9488',
      })
      onClose()
    } finally {
      setIsLoadingUser(false)
    }
  }

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
      const { data, error } = await userService.updateUser(userId, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        status: formData.status,
      })

      if (error) {
        console.error('Error updating user:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.message || 'ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#0d9488',
        })
        setIsLoading(false)
        return
      }

      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: 'อัปเดตข้อมูลผู้ใช้เรียบร้อยแล้ว',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#0d9488',
      })

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Exception updating user:', error)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error.message || 'ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง',
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
      status: 'active',
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
          <h2 className="text-2xl font-bold text-primary">แก้ไขข้อมูลผู้ใช้</h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            disabled={isLoading || isLoadingUser}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        {isLoadingUser ? (
          <div className="py-12">
            <LoadingSpinner text="กำลังโหลดข้อมูล..." />
          </div>
        ) : (
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

            {/* สถานะ */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                สถานะ *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${
                  errors.status ? 'border-red-300' : 'border-slate-200 bg-white'
                }`}
                disabled={isLoading}
              >
                <option value="active">ใช้งาน</option>
                <option value="inactive">ไม่ใช้งาน</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status}</p>
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
                {isLoading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

