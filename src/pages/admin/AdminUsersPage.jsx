import React, { useState, useMemo, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import UsersManagementTable from '../../components/admin/UsersManagementTable'
import Button from '../../components/Button'
import { userService } from '../../services/userService'
import { useAuth } from '../../hooks/useAuth'
import { Search, Filter, UserPlus, Users, Shield, User as UserIcon, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import Input from '../../components/Input'
import Swal from 'sweetalert2'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortField, setSortField] = useState('name') // default sort by name
  const [sortDirection, setSortDirection] = useState('asc') // 'asc' or 'desc'

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      setError(null)
      
      // ตรวจสอบ current user
      console.log('[AdminUsersPage] Current user:', {
        id: currentUser?.id,
        email: currentUser?.email,
        role: currentUser?.role,
        name: currentUser?.name
      })
      
      if (!currentUser) {
        console.error('[AdminUsersPage] No current user found')
        setError('ไม่พบข้อมูลผู้ใช้ปัจจุบัน')
        setLoading(false)
        return
      }
      
      if (currentUser.role !== 'admin') {
        console.error('[AdminUsersPage] User is not admin:', currentUser.role)
        setError('คุณไม่มีสิทธิ์เข้าถึงหน้านี้')
        setLoading(false)
        return
      }
      
      try {
        console.log('[AdminUsersPage] Fetching users...')
        const { data, error: fetchError } = await userService.getAllUsers()
        
        console.log('[AdminUsersPage] Fetch result:', {
          hasData: !!data,
          dataLength: data?.length,
          hasError: !!fetchError,
          error: fetchError
        })
        
        if (fetchError) {
          console.error('[AdminUsersPage] Error fetching users:', fetchError)
          
          // แสดง error message ที่เข้าใจง่าย
          let errorMessage = 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้'
          if (fetchError.code === 'PGRST116') {
            errorMessage = 'ไม่พบข้อมูลผู้ใช้ (อาจเป็นเพราะ RLS policies)'
          } else if (fetchError.message) {
            errorMessage = fetchError.message
          }
          
          setError(errorMessage)
        } else {
          const usersData = data || []
          console.log('[AdminUsersPage] Users loaded:', usersData.length, 'users')
          console.log('[AdminUsersPage] Users data:', usersData)
          
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminUsersPage.jsx:72',message:'before setUsers',data:{usersDataLength:usersData.length,firstUser:usersData[0]?{id:usersData[0].id,name:usersData[0].name,email:usersData[0].email,role:usersData[0].role,status:usersData[0].status,phone:usersData[0].phone}:null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C'})}).catch(()=>{});
          // #endregion
          
          setUsers(usersData)
          
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminUsersPage.jsx:76',message:'after setUsers',data:{usersDataLength:usersData.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
          // #endregion
          
          if (usersData.length === 0) {
            console.warn('[AdminUsersPage] No users found. This might be due to RLS policies or empty database.')
          }
        }
      } catch (err) {
        console.error('[AdminUsersPage] Exception:', err)
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [currentUser])

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Set new field with ascending direction
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminUsersPage.jsx:93',message:'filteredUsers useMemo entry',data:{usersLength:users.length,searchQuery,filterRole,filterStatus},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D'})}).catch(()=>{});
    // #endregion
    
    let result = users.filter((user) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminUsersPage.jsx:96',message:'filtering user',data:{userId:user.id,userName:user.name,userEmail:user.email,userPhone:user.phone,userRole:user.role,userStatus:user.status,phoneIsNull:user.phone===null,phoneIsUndefined:user.phone===undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C'})}).catch(()=>{});
      // #endregion
      
      try {
        const matchesSearch = 
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user.phone && user.phone.includes(searchQuery))
        
        const matchesRole = filterRole === 'all' || user.role === filterRole
        const matchesStatus = filterStatus === 'all' || user.status === filterStatus
        
        const passes = matchesSearch && matchesRole && matchesStatus
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminUsersPage.jsx:103',message:'filter result for user',data:{userId:user.id,matchesSearch,matchesRole,matchesStatus,passes},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'})}).catch(()=>{});
        // #endregion
        
        return passes
      } catch (err) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminUsersPage.jsx:110',message:'filter error',data:{userId:user.id,error:err.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return false
      }
    })
    
    // Sort users
    result = [...result].sort((a, b) => {
      let aValue, bValue

      switch (sortField) {
        case 'name':
          aValue = (a.name || '').toLowerCase()
          bValue = (b.name || '').toLowerCase()
          break
        case 'email':
          aValue = (a.email || '').toLowerCase()
          bValue = (b.email || '').toLowerCase()
          break
        case 'role':
          aValue = a.role || ''
          bValue = b.role || ''
          break
        case 'status':
          aValue = a.status || ''
          bValue = b.status || ''
          break
        case 'totalBookings':
          aValue = a.totalBookings || 0
          bValue = b.totalBookings || 0
          break
        case 'lastLogin':
          const aDate = a.lastLogin || a.last_login
          const bDate = b.lastLogin || b.last_login
          if (!aDate && !bDate) return 0
          if (!aDate) return 1
          if (!bDate) return -1
          aValue = new Date(aDate)
          bValue = new Date(bDate)
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminUsersPage.jsx:115',message:'filteredUsers useMemo exit',data:{inputLength:users.length,outputLength:result.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B'})}).catch(()=>{});
    // #endregion
    
    return result
  }, [users, searchQuery, filterRole, filterStatus, sortField, sortDirection])

  // Calculate statistics
  const stats = useMemo(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminUsersPage.jsx:108',message:'stats useMemo entry',data:{filteredUsersLength:filteredUsers.length,usersLength:users.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    const total = filteredUsers.length
    const active = filteredUsers.filter(u => u.status === 'active').length
    const inactive = filteredUsers.filter(u => u.status === 'inactive').length
    const admins = filteredUsers.filter(u => u.role === 'admin').length
    const members = filteredUsers.filter(u => u.role === 'member').length
    const regularUsers = filteredUsers.filter(u => u.role === 'user').length

    const result = { total, active, inactive, admins, members, regularUsers }
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4a7ba6e6-b3d4-4517-a9a2-7b182113fea9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminUsersPage.jsx:117',message:'stats useMemo exit',data:result,timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    return result
  }, [filteredUsers, users])

  const handleAddUser = () => {
    Swal.fire({
      icon: 'info',
      title: 'แจ้งเตือน',
      text: 'ฟีเจอร์เพิ่มผู้ใช้จะเปิดใช้งานเร็วๆ นี้',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#0d9488',
    })
  }

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner text="กำลังโหลดข้อมูลผู้ใช้..." />
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">ผู้ใช้</h1>
            <p className="text-slate-600 mt-1">จัดการผู้ใช้ทั้งหมด</p>
          </div>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="text-center">
              <p className="text-red-600 font-semibold mb-2">เกิดข้อผิดพลาด</p>
              <p className="text-red-700">{error}</p>
              <p className="text-sm text-red-600 mt-4">
                ตรวจสอบ Console (F12) เพื่อดูรายละเอียดเพิ่มเติม
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
              >
                รีเฟรชหน้า
              </Button>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">ผู้ใช้</h1>
            <p className="text-slate-600 mt-1">จัดการผู้ใช้ทั้งหมด</p>
          </div>
          <Button onClick={handleAddUser} className="w-full md:w-auto">
            <UserPlus size={18} />
            เพิ่มผู้ใช้ใหม่
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid gap-4 md:grid-cols-6">
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Users size={20} className="text-slate-400" />
              <p className="text-sm font-medium text-slate-600">ผู้ใช้ทั้งหมด</p>
            </div>
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-green-500" />
              <p className="text-sm font-medium text-slate-600">ใช้งาน</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-red-500" />
              <p className="text-sm font-medium text-slate-600">ไม่ใช้งาน</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={20} className="text-purple-400" />
              <p className="text-sm font-medium text-slate-600">ผู้ดูแลระบบ</p>
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <UserIcon size={20} className="text-blue-400" />
              <p className="text-sm font-medium text-slate-600">สมาชิก</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.members}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <UserIcon size={20} className="text-slate-400" />
              <p className="text-sm font-medium text-slate-600">ผู้ใช้ทั่วไป</p>
            </div>
            <p className="text-2xl font-bold text-primary">{stats.regularUsers}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search size={18} />
                </div>
                <Input
                  placeholder="ค้นหาผู้ใช้ (ชื่อ, อีเมล, เบอร์โทร)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Filter size={18} />
                </div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 pl-10 text-sm font-medium text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="all">ทุกบทบาท</option>
                  <option value="admin">ผู้ดูแลระบบ</option>
                  <option value="member">สมาชิก</option>
                  <option value="user">ผู้ใช้ทั่วไป</option>
                </select>
              </div>
            </div>
            <div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Filter size={18} />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 pl-10 text-sm font-medium text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="all">ทุกสถานะ</option>
                  <option value="active">ใช้งาน</option>
                  <option value="inactive">ไม่ใช้งาน</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">
              พบ {filteredUsers.length} ผู้ใช้
            </p>
          </div>
          <UsersManagementTable 
            users={filteredUsers} 
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </div>
      </div>
    </AdminLayout>
  )
}

