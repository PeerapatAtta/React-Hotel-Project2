import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { AuthContext } from './AuthContextValue'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const lastLoadedUserId = useRef(null) // เก็บ userId ที่ load แล้วเพื่อป้องกันการ load ซ้ำ
  const userRef = useRef(null) // เก็บ user state เพื่อใช้ใน closure

  // อัปเดต userRef เมื่อ user เปลี่ยน
  useEffect(() => {
    userRef.current = user
  }, [user])

  useEffect(() => {
    let mounted = true
    let initAuthCompleted = false
    let loadingProfileUserId = null

    // ตรวจสอบ session ที่มีอยู่
    const initAuth = async () => {
      try {
        setLoading(true)
        const { data: { session }, error } = await supabase.auth.getSession()

        if (!mounted) return

        if (error) {
          console.error('[AuthContext] getSession error:', error)
          if (mounted) {
            setUser(null)
            setLoading(false)
          }
          return
        }

        if (session) {
          try {
            loadingProfileUserId = session.user.id
            await loadUserProfile(session.user.id)
            loadingProfileUserId = null
          } catch (profileError) {
            console.error('[AuthContext] loadUserProfile error in initAuth:', profileError)
            if (mounted) {
              setUser(null)
            }
          }
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error('[AuthContext] initAuth error:', err)
        if (mounted) {
          setUser(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
      initAuthCompleted = true
    }

    initAuth()

    // ฟังการเปลี่ยนแปลง auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return

      // ข้ามถ้า initAuth ยังไม่เสร็จ หรือกำลัง load profile อยู่
      if (!initAuthCompleted || (session && loadingProfileUserId === session.user.id)) {
        return
      }

      // เพิ่ม: ตรวจสอบว่า session เปลี่ยนจริงๆ หรือไม่
      // ถ้า session ไม่เปลี่ยน (user เดิม) และมี user อยู่แล้ว ให้ข้าม
      const currentUserId = userRef.current?.id
      const newUserId = session?.user?.id
      
      // ถ้า session ไม่เปลี่ยนและมี user อยู่แล้ว ไม่ต้องทำอะไร (ป้องกันการ load ซ้ำ)
      if (currentUserId === newUserId && userRef.current && lastLoadedUserId.current === newUserId) {
        return
      }
      
      // ถ้า session หายไป แต่ user ยังมีอยู่ ให้ตรวจสอบ session อีกครั้งแบบเบาๆ
      if (!session && userRef.current) {
        // ตรวจสอบ session อีกครั้งเพื่อยืนยันว่าหายไปจริงๆ
        const { data: { session: recheckSession } } = await supabase.auth.getSession()
        if (recheckSession) {
          // ถ้ายังมี session อยู่ ไม่ต้องทำอะไร
          return
        }
      }

      try {
        // ตั้ง loading เฉพาะเมื่อ session เปลี่ยนจริงๆ
        if (currentUserId !== newUserId) {
          setLoading(true)
        }
        
        if (session) {
          loadingProfileUserId = session.user.id
          await loadUserProfile(session.user.id)
          loadingProfileUserId = null
        } else {
          // ถ้า session หายไปจริงๆ ให้ clear user
          if (userRef.current) {
            setUser(null)
            lastLoadedUserId.current = null
          }
        }
      } catch (err) {
        console.error('[AuthContext] onAuthStateChange error:', err)
        if (mounted) {
          setUser(null)
          lastLoadedUserId.current = null
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const loadUserProfile = async (userId) => {
    // ถ้า load user เดิมแล้ว และ user state มีอยู่แล้ว ให้ข้าม
    if (lastLoadedUserId.current === userId && user?.id === userId) {
      return
    }

    try {
      // เพิ่ม timeout เพื่อป้องกัน query ค้าง
      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile query timeout after 10 seconds')), 10000)
      )
      
      const { data: profile, error } = await Promise.race([queryPromise, timeoutPromise])
      
      if (error) {
        // ถ้ายังไม่มี profile ให้สร้างใหม่
        const { data: authUser } = await supabase.auth.getUser()
        if (authUser?.user) {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              name: authUser.user.user_metadata?.name || authUser.user.email?.split('@')[0] || 'User',
              email: authUser.user.email,
              role: authUser.user.user_metadata?.role || 'member',
            })
            .select()
            .single()

          if (createError) {
            console.error('Error creating profile:', createError)
            setLoading(false)
            return
          }

          const newUser = {
            id: newProfile.id,
            email: newProfile.email || authUser.user.email,
            name: newProfile.name,
            role: newProfile.role || 'member',
            ...newProfile
          }
          setUser(newUser)
          lastLoadedUserId.current = userId
          setLoading(false)
          return
        }
        throw error
      }

      const userData = {
        id: profile.id,
        email: profile.email || '',
        name: profile.name,
        role: profile.role || 'member',
        ...profile
      }
      setUser(userData)
      lastLoadedUserId.current = userId // เก็บ userId ที่ load แล้ว
    } catch (error) {
      console.error('Error loading profile:', error)
      lastLoadedUserId.current = null // reset เมื่อเกิด error
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      console.log('[AuthContext] Starting login for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('[AuthContext] Login response:', {
        hasData: !!data,
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        error: error?.message
      })

      if (error) {
        console.error('[AuthContext] Supabase login error:', error)
        console.error('[AuthContext] Error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        })

        // แปลง error message เป็นภาษาไทย
        let errorMessage = error.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'

        if (error.message?.includes('Invalid login credentials')) {
          errorMessage = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ'
        } else if (error.message?.includes('User not found')) {
          errorMessage = 'ไม่พบผู้ใช้ในระบบ'
        } else if (error.message?.includes('Too many requests')) {
          errorMessage = 'ลองเข้าสู่ระบบบ่อยเกินไป กรุณารอสักครู่'
        }
        return { success: false, error: errorMessage }
      }

      if (!data.user) {
        console.error('[AuthContext] No user data in response')
        return { success: false, error: 'ไม่พบข้อมูลผู้ใช้' }
      }
      
      console.log('[AuthContext] Loading user profile for:', data.user.id)
      await loadUserProfile(data.user.id)
      
      // อัปเดต last_login เมื่อ login สำเร็จ
      try {
        await supabase
          .from('profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id)
      } catch (updateError) {
        console.error('[AuthContext] Error updating last_login:', updateError)
        // ไม่ throw error เพราะ login สำเร็จแล้ว แค่บันทึก last_login ไม่ได้
      }
      
      // Wait a bit to ensure React state has updated
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Verify user state is set
      let attempts = 0
      while (attempts < 10 && !userRef.current) {
        await new Promise(resolve => setTimeout(resolve, 50))
        attempts++
      }
      
      console.log('[AuthContext] Login successful')
      return { success: true, user: userRef.current }
    } catch (error) {
      console.error('[AuthContext] Login exception:', error)
      console.error('[AuthContext] Exception stack:', error.stack)
      return { success: false, error: error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' }
    }
  }

  const register = async (name, email, password) => {
    try {
      console.log('Attempting to register:', { email, name })

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            role: 'member'
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      })

      if (error) {
        console.error('Supabase signup error:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))

        // แปลง error message เป็นภาษาไทย
        let errorMessage = error.message || 'เกิดข้อผิดพลาดในการลงทะเบียน'

        if (error.message?.includes('already registered') || error.message?.includes('User already registered')) {
          errorMessage = 'อีเมลนี้ถูกใช้งานแล้ว'
        } else if (error.message?.includes('Password') || error.message?.includes('password')) {
          errorMessage = 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบความยาวและรูปแบบ'
        } else if (error.message?.includes('Invalid email') || error.message?.includes('invalid')) {
          errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง'
        } else if (error.message?.includes('Email rate limit')) {
          errorMessage = 'ส่งอีเมลบ่อยเกินไป กรุณารอสักครู่'
        }

        return { success: false, error: errorMessage }
      }

      console.log('Signup successful:', { user: data.user, session: data.session })

      // ถ้า Supabase ต้องการ email confirmation
      if (data.user && !data.session) {
        console.log('Email confirmation required')
        return {
          success: true,
          message: 'กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชีของคุณ',
          requiresConfirmation: true
        }
      }

      // รอให้ profile ถูกสร้างโดย trigger
      if (data.user) {
        console.log('Waiting for profile creation...')
        await new Promise(resolve => setTimeout(resolve, 1500))

        try {
          await loadUserProfile(data.user.id)
          console.log('Profile loaded successfully')
          
          // Wait a bit to ensure React state has updated
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // Verify user state is set
          let attempts = 0
          while (attempts < 10 && !userRef.current) {
            await new Promise(resolve => setTimeout(resolve, 50))
            attempts++
          }
        } catch (profileError) {
          console.error('Error loading profile after registration:', profileError)
          // ไม่ return error เพราะ user ถูกสร้างแล้ว
        }
      }

      return { success: true, user: userRef.current }
    } catch (error) {
      console.error('Registration error:', error)
      console.error('Error stack:', error.stack)
      return { success: false, error: error.message || 'เกิดข้อผิดพลาดในการลงทะเบียน' }
    }
  }

  const logout = async () => {
    // Clear user state immediately for better UX, regardless of signOut result
    setUser(null)
    lastLoadedUserId.current = null
    
    // Attempt signOut with timeout to prevent hanging
    try {
      // Add timeout to prevent hanging
      const signOutPromise = supabase.auth.signOut()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('SignOut timeout after 5 seconds')), 5000)
      )
      
      const { error } = await Promise.race([signOutPromise, timeoutPromise])
      
      if (error) {
        console.error('Logout error:', error)
      }
    } catch (error) {
      console.error('Logout exception (timeout or error):', error)
      // User state already cleared above, so we're good
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

