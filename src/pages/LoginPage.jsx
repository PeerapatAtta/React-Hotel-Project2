import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Home, Shield, User, Copy } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/Button'
import Input from '../components/Input'
import Card from '../components/Card'
import Container from '../components/layout/Container'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleFillCredentials = (email, password) => {
    setFormData({ email, password })
    setErrors({})
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
    if (errors.submit) {
      setErrors((prev) => ({ ...prev, submit: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('[LoginPage] Form submitted with:', { email: formData.email })

    const newErrors = {}

    if (!formData.email) {
      newErrors.email = 'กรุณากรอกอีเมล'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง'
    }

    if (!formData.password) {
      newErrors.password = 'กรุณากรอกรหัสผ่าน'
    }

    if (Object.keys(newErrors).length > 0) {
      console.log('[LoginPage] Validation errors:', newErrors)
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setErrors({}) // Clear previous errors
    console.log('[LoginPage] Calling login function...')

    try {
      const result = await login(formData.email, formData.password)
      console.log('[LoginPage] Login result:', result)
      if (result.success) {
        // Determine redirect path based on user role from login result
        const userRole = result.user?.role
        const redirectPath = searchParams.get('returnUrl') ||
          (userRole === 'admin' ? '/admin' :
            userRole === 'member' ? '/member' : '/')

        console.log('[LoginPage] Login successful, navigating to:', redirectPath, 'user role:', userRole) // Redirect ไปที่ dashboard ตาม role หรือ returnUrl ถ้ามี
        navigate(redirectPath)
      } else {
        console.error('[LoginPage] Login failed:', result.error)
        setErrors({ submit: result.error || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
      }
    } catch (error) {
      console.error('[LoginPage] Login exception:', error)
      console.error('[LoginPage] Exception stack:', error.stack)
      setErrors({ submit: error.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-teal-50 via-blue-50 to-pink-50">
      <Container>
        <Card className="max-w-md mx-auto p-8 shadow-xl">
          {/* Back to Home Link */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-teal-600 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>กลับหน้าแรก</span>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">เข้าสู่ระบบ</h1>
            <p className="text-sm text-slate-500">ยินดีต้อนรับกลับมา</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <div className="absolute left-3 top-9 text-slate-400">
                <Mail size={18} />
              </div>
              <Input
                label="อีเมล"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
                placeholder="your@email.com"
                className="pl-10"
              />
            </div>

            <div className="relative">
              <div className="absolute left-3 top-9 text-slate-400">
                <Lock size={18} />
              </div>
              <Input
                label="รหัสผ่าน"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                error={errors.password}
                placeholder="••••••••"
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.submit && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={isLoading}
              style={{ backgroundColor: isLoading ? '#94a3b8' : '#0d9488' }}
            >
              {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-slate-600">
              ยังไม่มีบัญชี?{' '}
              <Link to="/register" className="text-teal-600 hover:text-teal-700 font-semibold transition-colors">
                สมัครสมาชิก
              </Link>
            </p>
            <div className="pt-3 border-t border-slate-200">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 transition-colors"
              >
                <Home size={16} />
                <span>กลับหน้าแรก</span>
              </Link>
            </div>
          </div>
        </Card>

        {/* Test Credentials Card */}
        <Card className="max-w-md mx-auto mt-6 p-6 shadow-xl border-2 border-amber-200 bg-amber-50/50">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-800 text-center">
              ข้อมูลสำหรับทดสอบเว็บไซต์เท่านั้น
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Card 1: ผู้จัดการโรงแรม */}
            <div className="bg-white rounded-lg border border-purple-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={20} className="text-purple-600" />
                <h4 className="font-semibold text-slate-700">ผู้จัดการโรงแรม</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-600">อีเมล:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs text-slate-800">admin@gmail.com</span>
                    <button
                      onClick={() => handleCopy('admin@gmail.com')}
                      className="text-slate-400 hover:text-teal-600 transition-colors"
                      title="คัดลอก"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-600">รหัสผ่าน:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs text-slate-800">Admin1234th</span>
                    <button
                      onClick={() => handleCopy('Admin1234th')}
                      className="text-slate-400 hover:text-teal-600 transition-colors"
                      title="คัดลอก"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                <Button
                  onClick={() => handleFillCredentials('admin@gmail.com', 'Admin1234th')}
                  className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-sm py-2"
                  size="sm"
                >
                  ใช้ข้อมูลนี้
                </Button>
              </div>
            </div>

            {/* Card 2: สมาชิก */}
            <div className="bg-white rounded-lg border border-blue-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <User size={20} className="text-blue-600" />
                <h4 className="font-semibold text-slate-700">สมาชิก</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-600">อีเมล:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs text-slate-800">member@gmail.com</span>
                    <button
                      onClick={() => handleCopy('member@gmail.com')}
                      className="text-slate-400 hover:text-teal-600 transition-colors"
                      title="คัดลอก"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-600">รหัสผ่าน:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs text-slate-800">member1234</span>
                    <button
                      onClick={() => handleCopy('member1234')}
                      className="text-slate-400 hover:text-teal-600 transition-colors"
                      title="คัดลอก"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                <Button
                  onClick={() => handleFillCredentials('member@gmail.com', 'member1234')}
                  className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-sm py-2"
                  size="sm"
                >
                  ใช้ข้อมูลนี้
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  )
}

