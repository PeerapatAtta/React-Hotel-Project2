import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // โหลด user จาก localStorage เมื่อ component mount
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = (email, password) => {
    // Mock authentication - ตรวจสอบกับ mock users
    let mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]')
    
    // ถ้ายังไม่มี mockUsers ให้สร้าง default users
    if (mockUsers.length === 0) {
      const defaultUsers = [
        { id: 'admin', name: 'ผู้ดูแลระบบ', email: 'admin@gmail.com', password: 'admin1234', role: 'admin' },
        { id: 'member', name: 'สมาชิก', email: 'member@gmail.com', password: 'member1234', role: 'member' },
        { id: '1', name: 'สมชาย ใจดี', email: 'somchai@example.com', password: '123456', role: 'member' },
        { id: '2', name: 'สมหญิง รักดี', email: 'somying@example.com', password: '123456', role: 'member' },
        { id: '3', name: 'วิชัย สุขดี', email: 'wichai@example.com', password: '123456', role: 'member' },
      ]
      localStorage.setItem('mockUsers', JSON.stringify(defaultUsers))
      mockUsers = defaultUsers
    } else {
      // ตรวจสอบว่ามี member@gmail.com อยู่แล้วหรือยัง ถ้ายังไม่มีให้เพิ่ม
      const hasMember = mockUsers.some(u => u.email === 'member@gmail.com')
      if (!hasMember) {
        const memberUser = { id: 'member', name: 'สมาชิก', email: 'member@gmail.com', password: 'member1234', role: 'member' }
        mockUsers.push(memberUser)
        localStorage.setItem('mockUsers', JSON.stringify(mockUsers))
      }
    }
    
    const foundUser = mockUsers.find(u => u.email === email && u.password === password)
    
    if (foundUser) {
      const userData = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role || 'member',
      }
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return { success: true }
    }
    
    return { success: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }
  }

  const register = (name, email, password) => {
    // Mock registration - ตรวจสอบว่ามี email นี้แล้วหรือยัง
    const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]')
    const existingUser = mockUsers.find(u => u.email === email)
    
    if (existingUser) {
      return { success: false, error: 'อีเมลนี้ถูกใช้งานแล้ว' }
    }

    // สร้าง user ใหม่ด้วย role 'member'
    const newUser = {
      id: Date.now().toString(),
      name: name,
      email: email,
      password: password, // ใน production ไม่ควรเก็บ password แบบนี้
      role: 'member',
      status: 'active',
      totalBookings: 0,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    }
    
    mockUsers.push(newUser)
    localStorage.setItem('mockUsers', JSON.stringify(mockUsers))
    
    const userData = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    }
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

