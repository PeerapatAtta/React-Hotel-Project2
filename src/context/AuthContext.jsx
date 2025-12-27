import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { AuthContext } from './AuthContextValue'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:9',message:'useEffect started',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A,B,C'})}).catch(()=>{});
    // #endregion

    let mounted = true
    let initAuthCompleted = false
    let loadingProfileUserId = null

    // ตรวจสอบ session ที่มีอยู่
    const initAuth = async () => {
      try {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:16',message:'initAuth started',data:{mounted},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        setLoading(true)
        const { data: { session }, error } = await supabase.auth.getSession()
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:20',message:'getSession completed',data:{hasSession:!!session,hasError:!!error,mounted},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A,B'})}).catch(()=>{});
        // #endregion

        if (!mounted) return

        if (error) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:25',message:'getSession error',data:{error:error?.message,mounted},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          console.error('[AuthContext] getSession error:', error)
          if (mounted) {
            setUser(null)
            setLoading(false)
          }
          return
        }

        if (session) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:45',message:'session exists, calling loadUserProfile with await',data:{userId:session.user.id,mounted},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A,C'})}).catch(()=>{});
          // #endregion
          try {
            loadingProfileUserId = session.user.id
            await loadUserProfile(session.user.id)
            loadingProfileUserId = null
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:38',message:'loadUserProfile completed in initAuth',data:{mounted},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A,C'})}).catch(()=>{});
            // #endregion
          } catch (profileError) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:41',message:'loadUserProfile error in initAuth',data:{error:profileError?.message,mounted},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            console.error('[AuthContext] loadUserProfile error in initAuth:', profileError)
            if (mounted) {
              setUser(null)
            }
          }
        } else {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:49',message:'no session, setting user null',data:{mounted},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          setUser(null)
        }
      } catch (err) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:53',message:'initAuth catch block',data:{error:err?.message,mounted},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        console.error('[AuthContext] initAuth error:', err)
        if (mounted) {
          setUser(null)
        }
      } finally {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:60',message:'initAuth finally block',data:{mounted},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A,B,C'})}).catch(()=>{});
        // #endregion
        if (mounted) {
          setLoading(false)
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:63',message:'setLoading(false) in initAuth finally',data:{mounted},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A,B,C'})}).catch(()=>{});
          // #endregion
        }
      }
      initAuthCompleted = true
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:87',message:'initAuth completed',data:{mounted},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    }

    initAuth()

    // ฟังการเปลี่ยนแปลง auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:94',message:'onAuthStateChange triggered',data:{event:_event,hasSession:!!session,mounted,initAuthCompleted,loadingProfileUserId},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A,B'})}).catch(()=>{});
      // #endregion
      if (!mounted) return

      // ข้ามถ้า initAuth ยังไม่เสร็จ หรือกำลัง load profile อยู่
      if (!initAuthCompleted || (session && loadingProfileUserId === session.user.id)) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:99',message:'onAuthStateChange: skipping, initAuth not completed or already loading',data:{initAuthCompleted,loadingProfileUserId,userId:session?.user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return
      }

      try {
        setLoading(true)
        if (session) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:106',message:'onAuthStateChange: calling loadUserProfile',data:{userId:session.user.id,mounted},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          loadingProfileUserId = session.user.id
          await loadUserProfile(session.user.id)
          loadingProfileUserId = null
        } else {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:80',message:'onAuthStateChange: no session',data:{mounted},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          setUser(null)
        }
      } catch (err) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:84',message:'onAuthStateChange catch block',data:{error:err?.message,mounted},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        console.error('[AuthContext] onAuthStateChange error:', err)
        if (mounted) {
          setUser(null)
        }
      } finally {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:91',message:'onAuthStateChange finally block',data:{mounted},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A,B'})}).catch(()=>{});
        // #endregion
        if (mounted) {
          setLoading(false)
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:94',message:'setLoading(false) in onAuthStateChange finally',data:{mounted},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A,B'})}).catch(()=>{});
          // #endregion
        }
      }
    })

    return () => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:100',message:'useEffect cleanup',data:{mounted},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const loadUserProfile = async (userId) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:143',message:'loadUserProfile started',data:{userId},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:146',message:'before profile query',data:{userId},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
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

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:154',message:'profile query completed',data:{hasProfile:!!profile,hasError:!!error,errorCode:error?.code,errorMessage:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
      // #endregion

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
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:175',message:'profile creation error, setLoading(false) and return',data:{error:createError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
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
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:190',message:'profile created, setLoading(false) and return',data:{userId:newProfile.id},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          setLoading(false)
          return
        }
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:196',message:'no authUser, throwing error',data:{error:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        throw error
      }

      setUser({
        id: profile.id,
        email: profile.email || '',
        name: profile.name,
        role: profile.role || 'member',
        ...profile
      })
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:209',message:'profile loaded successfully',data:{userId:profile.id},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
    } catch (error) {
      console.error('Error loading profile:', error)
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:213',message:'loadUserProfile catch block',data:{error:error?.message,errorStack:error?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
    } finally {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:217',message:'loadUserProfile finally block, setLoading(false)',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
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


