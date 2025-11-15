'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, Upload, Send, Loader2, Image as ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useDeviceId } from '@/hooks/useDeviceId'
import Button from '@/components/ui/Button'
import MoodSelector from '@/components/features/Mood/MoodSelector'
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
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const deviceId = useDeviceId()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setImageFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!imageFile && !caption.trim()) {
      toast.error('Add a photo or caption')
      return
    }

    if (!deviceId) {
      toast.error('Device not ready')
      return
    }

    setUploading(true)

    try {
      let imageUrl = null

      // Upload image to Supabase Storage
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${deviceId}-${Date.now()}.${fileExt}`
        const filePath = `snaps/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('worldping-snaps')
          .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          toast.error('Failed to upload image. Using text-only snap.')
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('worldping-snaps')
            .getPublicUrl(filePath)
          imageUrl = publicUrl
        }
      }

      // Create snap record
      const { error: insertError } = await supabase
        .from('snaps')
        .insert({
          device_id: deviceId,
          caption: caption.trim() || null,
          image_url: imageUrl,
          latitude,
          longitude,
          location: `POINT(${longitude} ${latitude})`,
          mood: selectedMood
        })

      if (insertError) throw insertError

      toast.success('📸 Snap posted!', { duration: 3000, icon: '🎉' })
      onSuccess?.()
      onClose()
      
      // Reset form
      setCaption('')
      setSelectedMood(null)
      setImageFile(null)
      setImagePreview(null)
    } catch (error: any) {
      console.error('Snap creation error:', error)
      toast.error(error.message || 'Failed to create snap')
    } finally {
      setUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 border-2 border-purple-600 rounded-2xl shadow-2xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Camera className="w-6 h-6" />
                Create Snap
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Image Upload Area */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="relative aspect-[9/16] max-h-[400px] rounded-xl overflow-hidden bg-black">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null)
                        setImagePreview(null)
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-[9/16] max-h-[400px] border-2 border-dashed border-gray-700 hover:border-purple-600 rounded-xl flex flex-col items-center justify-center gap-3 transition-all hover:bg-purple-600/10"
                  >
                    <ImageIcon className="w-16 h-16 text-gray-600" />
                    <div className="text-center">
                      <p className="text-white font-medium">Upload Photo</p>
                      <p className="text-gray-500 text-sm mt-1">JPG, PNG (max 5MB)</p>
                    </div>
                  </button>
                )}
              </div>

              {/* Caption */}
              <div>
                <label htmlFor="caption" className="block text-sm font-medium text-gray-300 mb-2">
                  Caption (optional)
                </label>
                <textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="What's happening? 📸"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 resize-none"
                  rows={3}
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1 text-right">{caption.length}/200</p>
              </div>

              {/* Mood Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mood (optional) 🎭
                </label>
                <MoodSelector 
                  selectedMood={selectedMood}
                  onSelectMood={setSelectedMood}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={uploading || (!imageFile && !caption.trim())}
                isLoading={uploading}
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Posting Snap...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Post Snap (24h)
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-gray-500">
                ⏰ Your snap will be visible for 24 hours
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
