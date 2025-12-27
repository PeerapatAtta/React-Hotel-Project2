import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2, Upload, Link as LinkIcon, Image as ImageIcon } from 'lucide-react'
import Button from '../Button'
import Input from '../Input'
import { roomService } from '../../services/roomService'
import { supabase } from '../../lib/supabaseClient'
import Swal from 'sweetalert2'

const AMENITY_OPTIONS = [
  'Wi-Fi ความเร็วสูง',
  'เครื่องปรับอากาศ',
  'โทรทัศน์',
  'ตู้เย็น',
  'ห้องน้ำในตัว',
  'ระเบียง',
  'ตู้เซฟ',
  'ไมโครเวฟ',
  'กาต้มน้ำ',
  'เครื่องเป่าผม',
  'ชุดเครื่องนอนคุณภาพ',
  'ห้องนั่งเล่น',
  'อื่นๆ'
]

export default function EditRoomModal({ isOpen, onClose, onSuccess, room }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: '',
    capacity: '',
    base_price: '',
    images: [{ type: 'url', value: '', file: null, preview: null }],
    amenities: [{ type: 'select', value: '' }]
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState({})
  const [dragActive, setDragActive] = useState({})
  const [loadingRoom, setLoadingRoom] = useState(false)

  // Load room data when modal opens
  useEffect(() => {
    if (isOpen && room) {
      setLoadingRoom(true)
      // Convert room data to form format
      const images = (room.images || []).map(img => ({
        type: 'url',
        value: img,
        file: null,
        preview: null
      }))
      if (images.length === 0) {
        images.push({ type: 'url', value: '', file: null, preview: null })
      }

      const amenities = (room.amenities || []).map(amenity => {
        const isInOptions = AMENITY_OPTIONS.includes(amenity)
        return {
          type: isInOptions ? 'select' : 'custom',
          value: amenity
        }
      })
      if (amenities.length === 0) {
        amenities.push({ type: 'select', value: '' })
      }

      setFormData({
        id: room.id || '',
        name: room.name || '',
        type: room.type || '',
        capacity: room.capacity || '',
        base_price: room.base_price || room.basePrice || '',
        images: images,
        amenities: amenities
      })
      setLoadingRoom(false)
    }
  }, [isOpen, room])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleArrayChange = (field, index, value) => {
    if (field === 'images') {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].map((item, i) => 
          i === index ? { ...item, value } : item
        )
      }))
    } else if (field === 'amenities') {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].map((item, i) => 
          i === index ? { type: item.type || 'select', value } : item
        )
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].map((item, i) => i === index ? value : item)
      }))
    }
  }

  const handleImageTypeChange = (index, type) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((item, i) => 
        i === index ? { type, value: '', file: null, preview: null } : item
      )
    }))
  }

  const handleFileChange = async (index, file) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: 'error',
        title: 'ไฟล์ไม่ถูกต้อง',
        text: 'กรุณาเลือกไฟล์รูปภาพเท่านั้น',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#0d9488',
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'ไฟล์ใหญ่เกินไป',
        text: 'ขนาดไฟล์ต้องไม่เกิน 5MB',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#0d9488',
      })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        images: prev.images.map((item, i) => 
          i === index ? { ...item, file, preview: reader.result } : item
        )
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleDrag = (e, index) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(prev => ({ ...prev, [index]: true }))
    } else if (e.type === 'dragleave') {
      setDragActive(prev => ({ ...prev, [index]: false }))
    }
  }

  const handleDrop = (e, index) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(prev => ({ ...prev, [index]: false }))

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      handleFileChange(index, file)
    }
  }

  const uploadImageToStorage = async (file, roomId, imageIndex) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${roomId}-${imageIndex}-${Date.now()}.${fileExt}`
      const filePath = `room-images/${fileName}`

      setUploadingImages(prev => ({ ...prev, [imageIndex]: true }))

      const { data, error } = await supabase.storage
        .from('room-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        throw error
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('room-images')
        .getPublicUrl(filePath)

      setUploadingImages(prev => {
        const newState = { ...prev }
        delete newState[imageIndex]
        return newState
      })

      return publicUrl
    } catch (error) {
      setUploadingImages(prev => {
        const newState = { ...prev }
        delete newState[imageIndex]
        return newState
      })
      throw error
    }
  }

  const addArrayItem = (field) => {
    if (field === 'images') {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], { type: 'url', value: '', file: null, preview: null }]
      }))
    } else if (field === 'amenities') {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], { type: 'select', value: '' }]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], '']
      }))
    }
  }

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}

    // Validation (no need to validate ID since it's disabled)
    if (!formData.name.trim()) {
      newErrors.name = 'กรุณากรอกชื่อห้อง'
    }
    if (!formData.type.trim()) {
      newErrors.type = 'กรุณาเลือกประเภทห้อง'
    }
    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = 'กรุณากรอกจำนวนคน (อย่างน้อย 1 คน)'
    }
    if (!formData.base_price || formData.base_price < 0) {
      newErrors.base_price = 'กรุณากรอกราคา (ต้องมากกว่าหรือเท่ากับ 0)'
    }

    // Filter empty images and amenities
    const images = formData.images.filter(img => {
      if (img.type === 'url') {
        return img.value && img.value.trim() !== ''
      } else {
        return img.file !== null
      }
    })
    const amenities = formData.amenities
      .map(amenity => typeof amenity === 'object' ? amenity.value : amenity)
      .filter(amenity => amenity && amenity.trim() !== '')

    if (images.length === 0) {
      newErrors.images = 'กรุณาเพิ่มรูปภาพอย่างน้อย 1 รูป'
    }
    if (amenities.length === 0) {
      newErrors.amenities = 'กรุณาเพิ่มความสะดวกอย่างน้อย 1 รายการ'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      // Upload files first
      const imageUrls = []
      for (let i = 0; i < formData.images.length; i++) {
        const img = formData.images[i]
        if (img.type === 'url' && img.value.trim()) {
          imageUrls.push(img.value.trim())
        } else if (img.type === 'upload' && img.file) {
          try {
            const url = await uploadImageToStorage(img.file, formData.id.trim(), i)
            imageUrls.push(url)
          } catch (uploadError) {
            console.error('Error uploading image:', uploadError)
            Swal.fire({
              icon: 'error',
              title: 'เกิดข้อผิดพลาด',
              text: `ไม่สามารถอัปโหลดรูปภาพที่ ${i + 1} ได้: ${uploadError.message}`,
              confirmButtonText: 'ตกลง',
              confirmButtonColor: '#0d9488',
            })
            setIsLoading(false)
            return
          }
        }
      }

      const roomData = {
        name: formData.name.trim(),
        type: formData.type.trim(),
        capacity: parseInt(formData.capacity),
        base_price: parseFloat(formData.base_price),
        images: imageUrls,
        amenities: amenities
      }

      const { data, error } = await roomService.updateRoom(formData.id.trim(), roomData)

      if (error) {
        console.error('Error updating room:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.message || 'ไม่สามารถแก้ไขห้องได้ กรุณาลองใหม่อีกครั้ง',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#0d9488',
        })
        return
      }

      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: 'แก้ไขห้องเรียบร้อยแล้ว',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#0d9488',
      })

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Exception updating room:', error)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error.message || 'ไม่สามารถแก้ไขห้องได้ กรุณาลองใหม่อีกครั้ง',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#0d9488',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-[60vw] max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white p-6">
          <h2 className="text-2xl font-bold text-primary">แก้ไขห้อง</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        {loadingRoom ? (
          <div className="p-12 text-center">
            <p className="text-slate-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Room ID - Disabled */}
              <div>
                <Input
                  label="ID ห้อง *"
                  value={formData.id}
                  disabled
                  helperText="ไม่สามารถแก้ไข ID ห้องได้"
                />
              </div>

              {/* Room Name */}
              <div>
                <Input
                  label="ชื่อห้อง *"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  error={errors.name}
                  placeholder="เช่น Deluxe City View"
                  helperText="กรอกชื่อห้องเป็นภาษาไทยหรืออังกฤษ (เช่น Deluxe City View)"
                />
              </div>

              {/* Room Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ประเภทห้อง *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className={`w-full rounded-lg border ${errors.type ? 'border-red-300' : 'border-slate-200'
                    } bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                >
                  <option value="">เลือกประเภทห้อง</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Suite">Suite</option>
                  <option value="Studio">Studio</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Standard">Standard</option>
                </select>
                {errors.type ? (
                  <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                ) : (
                  <p className="mt-1 text-sm text-slate-500">เลือกประเภทห้องที่เหมาะสม (เช่น Deluxe)</p>
                )}
              </div>

              {/* Capacity */}
              <div>
                <Input
                  label="จำนวนคน *"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => handleChange('capacity', e.target.value)}
                  error={errors.capacity}
                  placeholder="เช่น 2"
                  min="1"
                  helperText="จำนวนคนที่สามารถพักได้ในห้องนี้ (เช่น 2)"
                />
              </div>

              {/* Base Price */}
              <div className="md:col-span-2">
                <Input
                  label="ราคาต่อคืน (บาท) *"
                  type="number"
                  value={formData.base_price}
                  onChange={(e) => handleChange('base_price', e.target.value)}
                  error={errors.base_price}
                  placeholder="เช่น 3200"
                  min="0"
                  step="0.01"
                  helperText="ราคาต่อคืนเป็นบาท (ไม่รวมภาษี) (เช่น 3200)"
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                รูปภาพ * {errors.images && <span className="text-red-600">({errors.images})</span>}
              </label>
              <div className="space-y-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="space-y-2">
                    {/* Image Type Selector */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleImageTypeChange(index, 'url')}
                        className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${image.type === 'url'
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                        <LinkIcon size={16} />
                        URL
                      </button>
                      <button
                        type="button"
                        onClick={() => handleImageTypeChange(index, 'upload')}
                        className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${image.type === 'upload'
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                        <Upload size={16} />
                        อัปโหลด
                      </button>
                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('images', index)}
                          className="ml-auto rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>

                    {/* URL Input */}
                    {image.type === 'url' && (
                      <div>
                        <Input
                          type="url"
                          value={image.value}
                          onChange={(e) => handleArrayChange('images', index, e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="w-full"
                        />
                        {image.value && (
                          <img
                            src={image.value}
                            alt="Preview"
                            className="mt-2 w-full max-w-xs h-32 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                        )}
                      </div>
                    )}

                    {/* File Upload */}
                    {image.type === 'upload' && (
                      <div className="space-y-2">
                        <label
                          className={`flex flex-col items-center justify-center w-full min-h-[200px] max-h-[400px] border-2 border-dashed rounded-lg cursor-pointer transition-colors overflow-hidden ${dragActive[index]
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                            }`}
                          onDragEnter={(e) => handleDrag(e, index)}
                          onDragLeave={(e) => handleDrag(e, index)}
                          onDragOver={(e) => handleDrag(e, index)}
                          onDrop={(e) => handleDrop(e, index)}
                        >
                          {image.preview ? (
                            <div className="relative w-full h-full flex items-center justify-center p-2">
                              <img
                                src={image.preview}
                                alt="Preview"
                                className="max-w-full max-h-full object-contain rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  setFormData(prev => ({
                                    ...prev,
                                    images: prev.images.map((item, i) =>
                                      i === index ? { ...item, file: null, preview: null } : item
                                    )
                                  }))
                                }}
                                className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 z-10"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <ImageIcon className="w-10 h-10 mb-2 text-slate-400" />
                              <p className="mb-2 text-sm text-slate-500">
                                <span className="font-semibold">คลิกเพื่อเลือกรูปภาพ</span> หรือลากวางที่นี่
                              </p>
                              <p className="text-xs text-slate-500">PNG, JPG, GIF (สูงสุด 5MB)</p>
                            </div>
                          )}
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleFileChange(index, file)
                            }}
                          />
                        </label>
                        {uploadingImages[index] && (
                          <p className="text-sm text-teal-600">กำลังอัปโหลด...</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('images')}
                  className="flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-100 transition-colors"
                >
                  <Plus size={16} />
                  เพิ่มรูปภาพ
                </button>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ความสะดวก * {errors.amenities && <span className="text-red-600">({errors.amenities})</span>}
              </label>
              <p className="mb-2 text-sm text-slate-500">เลือกความสะดวกที่ต้องการ (เช่น Wi-Fi ความเร็วสูง)</p>
              <div className="space-y-2">
                {formData.amenities.map((amenity, index) => (
                  <div key={index} className="flex gap-2">
                    {amenity.type === 'select' ? (
                      <select
                        value={amenity.value}
                        onChange={(e) => {
                          const selectedValue = e.target.value
                          if (selectedValue === 'อื่นๆ') {
                            setFormData(prev => ({
                              ...prev,
                              amenities: prev.amenities.map((item, i) =>
                                i === index ? { type: 'custom', value: '' } : item
                              )
                            }))
                          } else {
                            handleArrayChange('amenities', index, selectedValue)
                          }
                        }}
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      >
                        <option value="">เลือกความสะดวก</option>
                        {AMENITY_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        value={amenity.value}
                        onChange={(e) => handleArrayChange('amenities', index, e.target.value)}
                        placeholder="กรอกความสะดวกเอง"
                        className="flex-1"
                      />
                    )}
                    {formData.amenities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('amenities', index)}
                        className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('amenities')}
                  className="flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-100 transition-colors"
                >
                  <Plus size={16} />
                  เพิ่มความสะดวก
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

