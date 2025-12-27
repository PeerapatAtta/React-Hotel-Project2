import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Home } from 'lucide-react'
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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginPage.jsx:59',message:'login result received',data:{success:result?.success,hasError:!!result?.error,errorMessage:result?.error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion

      if (result.success) {
        // Determine redirect path based on user role from login result
        const userRole = result.user?.role
        const redirectPath = searchParams.get('returnUrl') || 
          (userRole === 'admin' ? '/admin' : 
           userRole === 'member' ? '/member' : '/')
        
        console.log('[LoginPage] Login successful, navigating to:', redirectPath, 'user role:', userRole)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginPage.jsx:66',message:'navigating after successful login',data:{redirectPath,userRole,returnUrl:searchParams.get('returnUrl')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
        // #endregion
        // Redirect ไปที่ dashboard ตาม role หรือ returnUrl ถ้ามี
        navigate(redirectPath)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginPage.jsx:72',message:'navigate() called',data:{redirectPath},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
        // #endregion
      } else {
        console.error('[LoginPage] Login failed:', result.error)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginPage.jsx:70',message:'login failed, setting error',data:{error:result?.error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
        // #endregion
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
      </Container>
    </div>
  )
}

