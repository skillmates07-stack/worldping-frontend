'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, Upload, Send, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useDeviceId } from '@/hooks/useDeviceId'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface CreateSnapModalProps {
  isOpen: boolean
  onClose: () => void
  latitude: number
  longitude: number
  onSuccess?: () => void
}

export default function CreateSnapModal({ isOpen, onClose, latitude, longitude, onSuccess }: CreateSnapModalProps) {
  const [caption, setCaption] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const deviceId = useDeviceId()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be < 5MB')
      return
    }

    setImageFile(file)
    
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!imageFile && !caption.trim()) {
      toast.error('Add photo or caption')
      return
    }

    if (!deviceId) return

    setUploading(true)

    try {
      let imageUrl = null

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${deviceId}-${Date.now()}.${fileExt}`
        const filePath = `snaps/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('worldping-snaps')
          .upload(filePath, imageFile)

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('worldping-snaps')
            .getPublicUrl(filePath)
          imageUrl = publicUrl
        }
      }

      const { error } = await supabase
        .from('snaps')
        .insert({
          device_id: deviceId,
          caption: caption.trim() || null,
          image_url: imageUrl,
          latitude,
          longitude,
          location: `POINT(${longitude} ${latitude})`
        })

      if (error) throw error

      toast.success('📸 Snap posted!')
      onSuccess?.()
      onClose()
      
      setCaption('')
      setImageFile(null)
      setImagePreview(null)
    } catch (error: any) {
      toast.error('Failed to post snap')
    } finally {
      setUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm modal-overlay">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="bg-gray-900 border-t-2 sm:border-2 border-purple-600 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md sm:mx-4 modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Compact Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-t-3xl sm:rounded-t-2xl flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Post Snap
            </h3>
            <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            {/* Compact Image Upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative h-48 rounded-xl overflow-hidden bg-black">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null) }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-gray-700 hover:border-purple-600 rounded-xl flex flex-col items-center justify-center gap-2 transition-all"
              >
                <Camera className="w-12 h-12 text-gray-600" />
                <p className="text-white text-sm font-medium">Take Photo</p>
                <p className="text-gray-500 text-xs">Max 5MB</p>
              </button>
            )}

            {/* Caption */}
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Caption (optional)"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 text-sm resize-none"
              rows={2}
              maxLength={200}
            />

            {/* Submit */}
            <Button
              type="submit"
              disabled={uploading || (!imageFile && !caption.trim())}
              isLoading={uploading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Post Snap (24h)
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
