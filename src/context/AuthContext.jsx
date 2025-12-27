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
      fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:104',message:'onAuthStateChange fired',data:{event:_event,hasSession:!!session,userId:session?.user?.id,initAuthCompleted,mounted,loadingProfileUserId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      if (!mounted) return

      // ข้ามถ้า initAuth ยังไม่เสร็จ หรือกำลัง load profile อยู่
      if (!initAuthCompleted || (session && loadingProfileUserId === session.user.id)) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:109',message:'onAuthStateChange skipped (initAuth not completed or loading)',data:{initAuthCompleted,loadingProfileUserId,userId:session?.user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
        return
      }

      // เพิ่ม: ตรวจสอบว่า session เปลี่ยนจริงๆ หรือไม่
      // ถ้า session ไม่เปลี่ยน (user เดิม) และมี user อยู่แล้ว ให้ข้าม
      const currentUserId = userRef.current?.id
      const newUserId = session?.user?.id
      
      // ถ้า session ไม่เปลี่ยนและมี user อยู่แล้ว ไม่ต้องทำอะไร (ป้องกันการ load ซ้ำ)
      if (currentUserId === newUserId && userRef.current && lastLoadedUserId.current === newUserId) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:119',message:'onAuthStateChange skipped (same user)',data:{currentUserId,newUserId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
        return
      }
      
      // ถ้า session หายไป แต่ user ยังมีอยู่ ให้ตรวจสอบ session อีกครั้งแบบเบาๆ
      if (!session && userRef.current) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:124',message:'onAuthStateChange rechecking session',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
        // ตรวจสอบ session อีกครั้งเพื่อยืนยันว่าหายไปจริงๆ
        const { data: { session: recheckSession } } = await supabase.auth.getSession()
        if (recheckSession) {
          // ถ้ายังมี session อยู่ ไม่ต้องทำอะไร
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:128',message:'onAuthStateChange recheck found session, skipping',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
          // #endregion
          return
        }
      }

      try {
        // ตั้ง loading เฉพาะเมื่อ session เปลี่ยนจริงๆ
        if (currentUserId !== newUserId) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:135',message:'onAuthStateChange setting loading true',data:{currentUserId,newUserId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
          // #endregion
          setLoading(true)
        }
        
        if (session) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:140',message:'onAuthStateChange loading profile',data:{userId:session.user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
          // #endregion
          loadingProfileUserId = session.user.id
          await loadUserProfile(session.user.id)
          loadingProfileUserId = null
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:143',message:'onAuthStateChange profile loaded',data:{userId:session.user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
          // #endregion
        } else {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:146',message:'onAuthStateChange clearing user (no session)',data:{hasUser:!!userRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
          // #endregion
          // ถ้า session หายไปจริงๆ ให้ clear user
          if (userRef.current) {
            setUser(null)
            lastLoadedUserId.current = null
          }
        }
      } catch (err) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:152',message:'onAuthStateChange error',data:{error:err?.message,stack:err?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
        console.error('[AuthContext] onAuthStateChange error:', err)
        if (mounted) {
          setUser(null)
          lastLoadedUserId.current = null
        }
      } finally {
        if (mounted) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:159',message:'onAuthStateChange setting loading false',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
          // #endregion
          setLoading(false)
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
    fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:171',message:'loadUserProfile called',data:{userId,lastLoadedUserId:lastLoadedUserId.current,currentUserId:user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    // ถ้า load user เดิมแล้ว และ user state มีอยู่แล้ว ให้ข้าม
    if (lastLoadedUserId.current === userId && user?.id === userId) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:175',message:'loadUserProfile skipped (already loaded)',data:{userId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      return
    }

    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:180',message:'querying profiles table',data:{userId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
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
      fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:192',message:'profile query completed',data:{hasProfile:!!profile,hasError:!!error,errorMessage:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
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
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:196',message:'no authUser, throwing error',data:{error:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        throw error
      }

      const userData = {
        id: profile.id,
        email: profile.email || '',
        name: profile.name,
        role: profile.role || 'member',
        ...profile
      }
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:270',message:'setting user state',data:{userId:userData.id,name:userData.name,role:userData.role},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      setUser(userData)
      lastLoadedUserId.current = userId // เก็บ userId ที่ load แล้ว
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:275',message:'user state set, lastLoadedUserId updated',data:{userId,lastLoadedUserId:lastLoadedUserId.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
    } catch (error) {
      console.error('Error loading profile:', error)
      lastLoadedUserId.current = null // reset เมื่อเกิด error
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:250',message:'login function called',data:{email:email?.substring(0,5)+'***',hasPassword:!!password},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    try {
      console.log('[AuthContext] Starting login for:', email)
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:255',message:'calling supabase.auth.signInWithPassword',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:262',message:'signInWithPassword completed',data:{hasData:!!data,hasUser:!!data?.user,hasSession:!!data?.session,hasError:!!error,errorMessage:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,C'})}).catch(()=>{});
      // #endregion

      console.log('[AuthContext] Login response:', {
        hasData: !!data,
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        error: error?.message
      })

      if (error) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:273',message:'login error detected',data:{error:error?.message,status:error?.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
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

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:295',message:'returning login error',data:{errorMessage},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        return { success: false, error: errorMessage }
      }

      if (!data.user) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:300',message:'no user data in response',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        console.error('[AuthContext] No user data in response')
        return { success: false, error: 'ไม่พบข้อมูลผู้ใช้' }
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:305',message:'calling loadUserProfile',data:{userId:data.user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      console.log('[AuthContext] Loading user profile for:', data.user.id)
      await loadUserProfile(data.user.id)
      
      // Wait a bit to ensure React state has updated
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Verify user state is set
      let attempts = 0
      while (attempts < 10 && !userRef.current) {
        await new Promise(resolve => setTimeout(resolve, 50))
        attempts++
      }
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:315',message:'loadUserProfile completed, checking user state',data:{hasUser:!!userRef.current,userId:userRef.current?.id,userRole:userRef.current?.role,attempts},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      console.log('[AuthContext] Login successful')
      return { success: true, user: userRef.current }
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:312',message:'login catch block',data:{error:error?.message,stack:error?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:376',message:'logout function called',data:{hasUser:!!userRef.current,userId:userRef.current?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B,E'})}).catch(()=>{});
    // #endregion
    
    // Clear user state immediately for better UX, regardless of signOut result
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:380',message:'clearing user state immediately',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    setUser(null)
    lastLoadedUserId.current = null
    
    // Attempt signOut with timeout to prevent hanging
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:386',message:'calling supabase.auth.signOut() with timeout',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B,E'})}).catch(()=>{});
      // #endregion
      
      // Add timeout to prevent hanging
      const signOutPromise = supabase.auth.signOut()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('SignOut timeout after 5 seconds')), 5000)
      )
      
      const { error } = await Promise.race([signOutPromise, timeoutPromise])
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:395',message:'supabase.auth.signOut() completed',data:{hasError:!!error,errorMessage:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B,E'})}).catch(()=>{});
      // #endregion
      
      if (error) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:399',message:'signOut error',data:{error:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        console.error('Logout error:', error)
      }
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:404',message:'logout function completed successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:408',message:'logout catch block (timeout or error)',data:{error:error?.message,stack:error?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
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


