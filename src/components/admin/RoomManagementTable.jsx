import React, { useState } from 'react'
import { formatPrice } from '../../utils/formatters'
import Button from '../Button'
import Badge from '../Badge'
import { Edit, Trash2, Eye, Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react'
import Swal from 'sweetalert2'

export default function RoomManagementTable({ rooms, onEdit }) {
  const [imageErrors, setImageErrors] = useState({})
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)

  const handleEdit = (room) => {
    if (onEdit) {
      onEdit(room)
    }
  }

  const handleDelete = (roomId) => {
    Swal.fire({
      title: 'ลบห้อง?',
      text: `คุณต้องการลบห้อง "${roomId}" ใช่หรือไม่?`,
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
          text: `ฟีเจอร์ลบห้อง "${roomId}" จะเปิดใช้งานเร็วๆ นี้`,
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#0d9488',
        })
      }
    })
  }

  const handleView = (roomId) => {
    window.open(`/rooms/${roomId}`, '_blank')
  }

  const handleImageError = (roomId) => {
    setImageErrors(prev => ({ ...prev, [roomId]: true }))
  }

  const handleImageClick = (room, imageIndex = 0) => {
    setSelectedRoom(room)
    setSelectedImage(imageIndex)
  }

  const handleCloseImageModal = () => {
    setSelectedImage(null)
    setSelectedRoom(null)
  }

  const handleNextImage = () => {
    if (selectedRoom && selectedImage < selectedRoom.images.length - 1) {
      setSelectedImage(selectedImage + 1)
    }
  }

  const handlePrevImage = () => {
    if (selectedRoom && selectedImage > 0) {
      setSelectedImage(selectedImage - 1)
    }
  }

  if (rooms.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-12 shadow-sm text-center">
        <p className="text-slate-500">ไม่พบห้องที่ค้นหา</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                รูปภาพ
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                ชื่อห้อง
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                ประเภท
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                ความจุ
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                ราคา/คืน
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                สิ่งอำนวยความสะดวก
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                การจัดการ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rooms.map((room) => (
              <tr key={room.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div 
                    className="w-32 h-32 rounded-lg overflow-hidden bg-slate-100 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handleImageClick(room, 0)}
                  >
                    {imageErrors[room.id] ? (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200">
                        <ImageIcon size={32} className="text-slate-400" />
                      </div>
                    ) : (
                      <img
                        src={room.images?.[0] || ''}
                        alt={room.name}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(room.id)}
                      />
                    )}
                  </div>
                  {room.images?.length > 1 && (
                    <p className="text-xs text-slate-500 mt-1 text-center">
                      +{room.images.length - 1} รูปเพิ่มเติม
                    </p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-primary">{room.name}</p>
                    <p className="text-xs text-slate-500 mt-1">ID: {room.id}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge className="bg-slate-100 text-slate-700">{room.type}</Badge>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">{room.capacity} คน</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-primary">
                    {formatPrice(room.base_price || room.basePrice)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {room.amenities.slice(0, 2).map((amenity, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600"
                      >
                        {amenity}
                      </span>
                    ))}
                    {room.amenities.length > 2 && (
                      <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600">
                        +{room.amenities.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => handleView(room.id)}
                      className="p-2"
                      title="ดูรายละเอียด"
                    >
                      <Eye size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleEdit(room)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      title="แก้ไข"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDelete(room.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="ลบ"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Image Modal */}
      {selectedRoom && selectedImage !== null && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={handleCloseImageModal}
        >
          <div className="relative max-w-6xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={handleCloseImageModal}
              className="absolute top-4 right-4 z-10 rounded-full bg-white/10 backdrop-blur-sm p-2 text-white hover:bg-white/20 transition-colors"
            >
              <X size={24} />
            </button>

            {/* Navigation Buttons */}
            {selectedRoom.images.length > 1 && (
              <>
                {selectedImage > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePrevImage()
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/10 backdrop-blur-sm p-3 text-white hover:bg-white/20 transition-colors"
                  >
                    <ChevronLeft size={24} />
                  </button>
                )}
                {selectedImage < selectedRoom.images.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNextImage()
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/10 backdrop-blur-sm p-3 text-white hover:bg-white/20 transition-colors"
                  >
                    <ChevronRight size={24} />
                  </button>
                )}
              </>
            )}

            {/* Image */}
            <div className="rounded-lg overflow-hidden bg-slate-900">
              <img
                src={selectedRoom.images[selectedImage]}
                alt={`${selectedRoom.name} - Image ${selectedImage + 1}`}
                className="w-full h-auto max-h-[90vh] object-contain"
              />
            </div>

            {/* Image Info */}
            <div className="mt-4 text-center text-white">
              <p className="text-lg font-semibold">{selectedRoom.name}</p>
              <p className="text-sm text-white/70">
                รูปภาพ {selectedImage + 1} จาก {selectedRoom.images.length}
              </p>
            </div>

            {/* Thumbnail Navigation */}
            {selectedRoom.images.length > 1 && (
              <div className="mt-4 flex gap-2 justify-center overflow-x-auto pb-2">
                {selectedRoom.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedImage(idx)
                    }}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === selectedImage
                        ? 'border-teal-500 ring-2 ring-teal-500/50'
                        : 'border-transparent hover:border-white/50'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

