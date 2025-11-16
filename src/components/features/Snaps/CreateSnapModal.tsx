'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, Send, Loader2, ImagePlus } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useDeviceId } from '@/hooks/useDeviceId'
import { useToast } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'

interface CreateSnapModalProps {
  isOpen: boolean
  onClose: () => void
  latitude: number
  longitude: number
  onSuccess?: () => void
}

export default function CreateSnapModal({ 
  isOpen, 
  onClose, 
  latitude, 
  longitude, 
  onSuccess 
}: CreateSnapModalProps) {
  const toast = useToast()
  const deviceId = useDeviceId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [caption, setCaption] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast('Please select an image file', 'error')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast('Image must be less than 5MB', 'error')
      return
    }

    setImageFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }, [toast])

  const handleRemoveImage = useCallback(() => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (!imageFile && !caption.trim()) {
      toast('Add a photo or caption', 'error')
      return
    }

    if (!deviceId) {
      toast('Device not ready', 'error')
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
          toast('Failed to upload image', 'error')
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
          location: `POINT(${longitude} ${latitude})`
        })

      if (insertError) throw insertError

      toast('📸 Snap posted!', 'success')
      onSuccess?.()
      onClose()
      
      // Reset form
      setCaption('')
      handleRemoveImage()
    } catch (error: any) {
      console.error('Snap creation error:', error)
      toast(error.message || 'Failed to post snap', 'error')
    } finally {
      setUploading(false)
    }
  }, [imageFile, caption, deviceId, latitude, longitude, toast, onSuccess, onClose, handleRemoveImage])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm modal-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="bg-gray-900 border-t-2 sm:border-2 border-purple-600 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md sm:mx-4 modal-content overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <header className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 flex items-center justify-between">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Post Snap
            </h2>
            <button 
              onClick={onClose} 
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </header>

          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            {/* Image Upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
              aria-label="Upload photo"
            />

            {imagePreview ? (
              <div className="relative h-48 rounded-xl overflow-hidden bg-black">
                <img 
                  src={imagePreview} 
                  alt="Snap preview" 
                  className="w-full h-full object-cover" 
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                  aria-label="Remove photo"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-gray-700 hover:border-purple-600 rounded-xl flex flex-col items-center justify-center gap-2 transition-all hover:bg-purple-600/5"
              >
                <ImagePlus className="w-12 h-12 text-gray-600" />
                <p className="text-white text-sm font-medium">Take or Upload Photo</p>
                <p className="text-gray-500 text-xs">JPG, PNG • Max 5MB</p>
              </button>
            )}

            {/* Caption */}
            <div>
              <label htmlFor="snap-caption" className="sr-only">Caption</label>
              <textarea
                id="snap-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="What's happening? 📸"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 text-sm resize-none"
                rows={2}
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {caption.length}/200
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={uploading || (!imageFile && !caption.trim())}
              isLoading={uploading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
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

            <p className="text-xs text-center text-gray-500">
              ⏰ Your snap will be visible for 24 hours
            </p>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
