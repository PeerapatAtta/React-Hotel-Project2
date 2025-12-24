import React, { useState, useMemo, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import UsersManagementTable from '../../components/admin/UsersManagementTable'
import Button from '../../components/Button'
import { userService } from '../../services/userService'
import { Search, Filter, UserPlus, Users, Shield, User as UserIcon } from 'lucide-react'
import Input from '../../components/Input'
import Swal from 'sweetalert2'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, error: fetchError } = await userService.getAllUsers()
        if (fetchError) {
          console.error('Error fetching users:', fetchError)
          setError(fetchError.message)
        } else {
          setUsers(data || [])
        }
      } catch (err) {
        console.error('Error:', err)
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery)
      
      const matchesRole = filterRole === 'all' || user.role === filterRole
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus
      
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [searchQuery, filterRole, filterStatus])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredUsers.length
    const active = filteredUsers.filter(u => u.status === 'active').length
    const inactive = filteredUsers.filter(u => u.status === 'inactive').length
    const admins = filteredUsers.filter(u => u.role === 'admin').length
    const members = filteredUsers.filter(u => u.role === 'member').length
    const regularUsers = filteredUsers.filter(u => u.role === 'user').length

    return { total, active, inactive, admins, members, regularUsers }
  }, [filteredUsers])

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
        <div className="text-center py-12">
          <p className="text-red-600">เกิดข้อผิดพลาด: {error}</p>
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
          <UsersManagementTable users={filteredUsers} />
        </div>
      </div>
    </AdminLayout>
  )
}

