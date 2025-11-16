'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, Send, Loader2, ImagePlus, Upload } from 'lucide-react'
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
  
  // Separate refs for camera and upload
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const uploadInputRef = useRef<HTMLInputElement>(null)
  
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
    if (cameraInputRef.current) cameraInputRef.current.value = ''
    if (uploadInputRef.current) uploadInputRef.current.value = ''
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
            <h2 className="font-bold text-white flex items-center gap-2 text-base">
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
            {/* Hidden File Inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
              id="camera-input"
              aria-label="Take photo with camera"
            />

            <input
              ref={uploadInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="upload-input"
              aria-label="Upload photo from device"
            />

            {/* Image Preview or Upload Options */}
            {imagePreview ? (
              <div className="relative h-52 rounded-xl overflow-hidden bg-black">
                <img 
                  src={imagePreview} 
                  alt="Snap preview" 
                  className="w-full h-full object-cover" 
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors shadow-lg"
                  aria-label="Remove photo"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {/* Camera Button */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => cameraInputRef.current?.click()}
                  className="h-36 border-2 border-dashed border-purple-600/50 hover:border-purple-600 bg-gradient-to-br from-purple-600/10 to-purple-800/10 hover:from-purple-600/20 hover:to-purple-800/20 rounded-xl flex flex-col items-center justify-center gap-2 transition-all"
                >
                  <div className="p-3 bg-purple-600 rounded-full">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-white text-sm font-medium">Take Photo</p>
                  <p className="text-gray-500 text-xs">Use Camera</p>
                </motion.button>

                {/* Upload Button */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => uploadInputRef.current?.click()}
                  className="h-36 border-2 border-dashed border-pink-600/50 hover:border-pink-600 bg-gradient-to-br from-pink-600/10 to-pink-800/10 hover:from-pink-600/20 hover:to-pink-800/20 rounded-xl flex flex-col items-center justify-center gap-2 transition-all"
                >
                  <div className="p-3 bg-pink-600 rounded-full">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-white text-sm font-medium">Upload</p>
                  <p className="text-gray-500 text-xs">From Gallery</p>
                </motion.button>
              </div>
            )}

            <p className="text-center text-gray-500 text-xs">
              JPG, PNG • Max 5MB
            </p>

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
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
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

            <p className="text-xs text-center text-gray-500 flex items-center justify-center gap-1">
              ⏰ Your snap will be visible for 24 hours
            </p>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
