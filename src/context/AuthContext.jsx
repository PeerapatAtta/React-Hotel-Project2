import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { AuthContext } from './AuthContextValue'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // ตรวจสอบ session ที่มีอยู่
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // ฟังการเปลี่ยนแปลง auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        await loadUserProfile(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

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

          setUser({
            id: newProfile.id,
            email: newProfile.email || authUser.user.email,
            name: newProfile.name,
            role: newProfile.role || 'member',
            ...newProfile
          })
          setLoading(false)
          return
        }
        throw error
      }

      setUser({
        id: profile.id,
        email: profile.email || '',
        name: profile.name,
        role: profile.role || 'member',
        ...profile
      })
    } catch (error) {
      console.error('Error loading profile:', error)
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
      console.log('[AuthContext] Login successful')
      return { success: true }
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
        } catch (profileError) {
          console.error('Error loading profile after registration:', profileError)
          // ไม่ return error เพราะ user ถูกสร้างแล้ว
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      console.error('Error stack:', error.stack)
      return { success: false, error: error.message || 'เกิดข้อผิดพลาดในการลงทะเบียน' }
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}


