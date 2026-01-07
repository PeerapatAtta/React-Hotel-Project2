import React from 'react'
import Badge from '../Badge'
import Button from '../Button'
import { Edit, Trash2, Eye, Mail, Phone, Shield, User as UserIcon, Ban, CheckCircle, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import Swal from 'sweetalert2'

export default function UsersManagementTable({ users, sortField, sortDirection, onSort }) {
  const getRoleBadge = (role) => {
    const variants = {
      admin: 'bg-purple-100 text-purple-700',
      member: 'bg-blue-100 text-blue-700',
      user: 'bg-slate-100 text-slate-700',
    }
    return variants[role] || 'bg-slate-100 text-slate-700'
  }

  const getRoleText = (role) => {
    const texts = {
      admin: 'ผู้ดูแลระบบ',
      member: 'สมาชิก',
      user: 'ผู้ใช้ทั่วไป',
    }
    return texts[role] || role
  }

  const getStatusBadge = (status) => {
    const variants = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-red-100 text-red-700',
    }
    return variants[status] || 'bg-slate-100 text-slate-700'
  }

  const getStatusText = (status) => {
    const texts = {
      active: 'ใช้งาน',
      inactive: 'ไม่ใช้งาน',
    }
    return texts[status] || status
  }

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'ยังไม่เคยเข้าสู่ระบบ'
    }
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'ยังไม่เคยเข้าสู่ระบบ'
      }
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch (error) {
      return 'ยังไม่เคยเข้าสู่ระบบ'
    }
  }

  const handleEdit = (userId) => {
    Swal.fire({
      icon: 'info',
      title: 'แจ้งเตือน',
      text: `ฟีเจอร์แก้ไขผู้ใช้ "${userId}" จะเปิดใช้งานเร็วๆ นี้`,
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#0d9488',
    })
  }

  const handleDelete = (userId) => {
    Swal.fire({
      title: 'ลบผู้ใช้?',
      text: `คุณต้องการลบผู้ใช้ "${userId}" ใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่, ลบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'info',
          title: 'แจ้งเตือน',
          text: `ฟีเจอร์ลบผู้ใช้ "${userId}" จะเปิดใช้งานเร็วๆ นี้`,
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#0d9488',
        })
      }
    })
  }

  const handleView = (userId) => {
    Swal.fire({
      icon: 'info',
      title: 'แจ้งเตือน',
      text: `ฟีเจอร์ดูรายละเอียดผู้ใช้ "${userId}" จะเปิดใช้งานเร็วๆ นี้`,
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#0d9488',
    })
  }

  const handleToggleStatus = (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    Swal.fire({
      title: 'เปลี่ยนสถานะ?',
      text: `คุณต้องการเปลี่ยนสถานะผู้ใช้ "${userId}" เป็น "${getStatusText(newStatus)}" ใช่หรือไม่?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ใช่, เปลี่ยน',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#0d9488',
      cancelButtonColor: '#64748b',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'info',
          title: 'แจ้งเตือน',
          text: `ฟีเจอร์เปลี่ยนสถานะผู้ใช้ "${userId}" จะเปิดใช้งานเร็วๆ นี้`,
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#0d9488',
        })
      }
    })
  }

  if (users.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-12 shadow-sm text-center">
        <p className="text-slate-500">ไม่พบผู้ใช้ที่ค้นหา</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th 
                className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors ${sortField === 'name' ? 'bg-slate-100' : ''}`}
                onClick={() => onSort && onSort('name')}
              >
                <div className="flex items-center gap-1">
                  ผู้ใช้
                  {sortField === 'name' ? (
                    sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                  ) : (
                    <ArrowUpDown size={14} className="opacity-40" />
                  )}
                </div>
              </th>
              <th 
                className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors ${sortField === 'email' ? 'bg-slate-100' : ''}`}
                onClick={() => onSort && onSort('email')}
              >
                <div className="flex items-center gap-1">
                  ติดต่อ
                  {sortField === 'email' ? (
                    sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                  ) : (
                    <ArrowUpDown size={14} className="opacity-40" />
                  )}
                </div>
              </th>
              <th 
                className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors ${sortField === 'role' ? 'bg-slate-100' : ''}`}
                onClick={() => onSort && onSort('role')}
              >
                <div className="flex items-center gap-1">
                  บทบาท
                  {sortField === 'role' ? (
                    sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                  ) : (
                    <ArrowUpDown size={14} className="opacity-40" />
                  )}
                </div>
              </th>
              <th 
                className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors ${sortField === 'status' ? 'bg-slate-100' : ''}`}
                onClick={() => onSort && onSort('status')}
              >
                <div className="flex items-center gap-1">
                  สถานะ
                  {sortField === 'status' ? (
                    sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                  ) : (
                    <ArrowUpDown size={14} className="opacity-40" />
                  )}
                </div>
              </th>
              <th 
                className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors ${sortField === 'totalBookings' ? 'bg-slate-100' : ''}`}
                onClick={() => onSort && onSort('totalBookings')}
              >
                <div className="flex items-center gap-1">
                  การจอง
                  {sortField === 'totalBookings' ? (
                    sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                  ) : (
                    <ArrowUpDown size={14} className="opacity-40" />
                  )}
                </div>
              </th>
              <th 
                className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap ${sortField === 'lastLogin' ? 'bg-slate-100' : ''}`}
                onClick={() => onSort && onSort('lastLogin')}
              >
                <div className="flex items-center gap-1">
                  เข้าสู่ระบบล่าสุด
                  {sortField === 'lastLogin' ? (
                    sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                  ) : (
                    <ArrowUpDown size={14} className="opacity-40" />
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                การจัดการ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                      {user.role === 'admin' ? (
                        <Shield size={20} className="text-teal-700" />
                      ) : (
                        <UserIcon size={20} className="text-teal-700" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary">{user.name}</p>
                      <p className="text-xs text-slate-500 mt-1">ID: {user.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail size={12} className="text-slate-400" />
                      <p className="text-xs text-slate-600">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={12} className="text-slate-400" />
                      <p className="text-xs text-slate-600">{user.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge className={`text-xs ${getRoleBadge(user.role)}`}>
                    {getRoleText(user.role)}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge className={`text-xs ${getStatusBadge(user.status)}`}>
                    {getStatusText(user.status)}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-slate-700">
                    {user.totalBookings || 0} ครั้ง
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm text-slate-700">{formatDate(user.lastLogin || user.last_login)}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => handleView(user.id)}
                      className="p-2"
                      title="ดูรายละเอียด"
                    >
                      <Eye size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleEdit(user.id)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      title="แก้ไข"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleToggleStatus(user.id, user.status)}
                      className={`p-2 ${
                        user.status === 'active'
                          ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                          : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                      }`}
                      title={user.status === 'active' ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน'}
                    >
                      {user.status === 'active' ? (
                        <Ban size={16} />
                      ) : (
                        <CheckCircle size={16} />
                      )}
                    </Button>
                    {user.role !== 'admin' && (
                      <Button
                        variant="ghost"
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="ลบ"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

