import React, { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import RoomManagementTable from '../../components/admin/RoomManagementTable'
import Button from '../../components/Button'
import { roomService } from '../../services/roomService'
import { Plus, Search, Filter } from 'lucide-react'
import Input from '../../components/Input'
import Swal from 'sweetalert2'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, error: fetchError } = await roomService.getAllRooms()
        if (fetchError) {
          console.error('Error fetching rooms:', fetchError)
          setError(fetchError.message)
        } else {
          setRooms(data || [])
        }
      } catch (err) {
        console.error('Error:', err)
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [])

  // Filter rooms based on search and type
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.type.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || room.type === filterType
    
    return matchesSearch && matchesType
  })

  const roomTypes = ['all', ...new Set(rooms.map(r => r.type))]

  const handleAddRoom = () => {
    Swal.fire({
      icon: 'info',
      title: 'แจ้งเตือน',
      text: 'ฟีเจอร์เพิ่มห้องจะเปิดใช้งานเร็วๆ นี้',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#0d9488',
    })
  }

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner text="กำลังโหลดข้อมูลห้อง..." />
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
            <h1 className="text-3xl font-bold text-primary">จัดการห้อง</h1>
            <p className="text-slate-600 mt-1">จัดการข้อมูลห้องพักทั้งหมด</p>
          </div>
          <Button onClick={handleAddRoom} className="w-full md:w-auto">
            <Plus size={18} />
            เพิ่มห้องใหม่
          </Button>
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
                  placeholder="ค้นหาห้อง (ชื่อ, ประเภท)..."
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
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 pl-10 text-sm font-medium text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  {roomTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'ทุกประเภท' : type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-600">ห้องทั้งหมด</p>
            <p className="text-2xl font-bold text-primary mt-1">{rooms.length}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-600">ห้องว่าง</p>
            <p className="text-2xl font-bold text-teal-600 mt-1">
              {rooms.length - filteredRooms.length + filteredRooms.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-600">ประเภทห้อง</p>
            <p className="text-2xl font-bold text-primary mt-1">{roomTypes.length - 1}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-600">ผลลัพธ์</p>
            <p className="text-2xl font-bold text-primary mt-1">{filteredRooms.length}</p>
          </div>
        </div>

        {/* Rooms Table */}
        <RoomManagementTable rooms={filteredRooms} />
      </div>
    </AdminLayout>
  )
}

