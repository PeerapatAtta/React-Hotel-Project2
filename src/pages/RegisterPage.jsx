import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import Input from '../components/Input'
import Card from '../components/Card'
import Container from '../components/layout/Container'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

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
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'กรุณากรอกชื่อ'
    }
    
    if (!formData.email) {
      newErrors.email = 'กรุณากรอกอีเมล'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
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
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    // Mock registration
    setTimeout(() => {
      const result = register(formData.name, formData.email, formData.password)
      if (result.success) {
        navigate('/')
      } else {
        setErrors({ submit: result.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' })
      }
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-teal-50 via-blue-50 to-pink-50">
      <Container>
        <Card className="max-w-md mx-auto p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">สมัครสมาชิก</h1>
            <p className="text-sm text-slate-500">สร้างบัญชีใหม่เพื่อเริ่มต้น</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <div className="absolute left-3 top-9 text-slate-400">
                <User size={18} />
              </div>
              <Input
                label="ชื่อ-นามสกุล"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={errors.name}
                placeholder="ชื่อของคุณ"
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
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                error={errors.password}
                placeholder="อย่างน้อย 6 ตัวอักษร"
                helperText="รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"
                className="pl-10"
              />
            </div>
            
            <div className="relative">
              <div className="absolute left-3 top-9 text-slate-400">
                <Lock size={18} />
              </div>
              <Input
                label="ยืนยันรหัสผ่าน"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                className="pl-10"
              />
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
              {isLoading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              มีบัญชีอยู่แล้ว?{' '}
              <Link to="/login" className="text-teal-600 hover:text-teal-700 font-semibold transition-colors">
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>
        </Card>
      </Container>
    </div>
  )
}

