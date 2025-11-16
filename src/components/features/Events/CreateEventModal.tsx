'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Upload, Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  latitude: number
  longitude: number
  onSuccess?: () => void
  allowMedia?: boolean
  categories?: { id: string, label: string }[]
}

export default function CreateEventModal({
  isOpen,
  onClose,
  latitude,
  longitude,
  onSuccess,
  allowMedia = true,
  categories = []
}: CreateEventModalProps) {
  const toast = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventType, setEventType] = useState(categories[0]?.id || 'other')
  const [customType, setCustomType] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const reset = () => {
    setTitle('')
    setDescription('')
    setEventType(categories[0]?.id || 'other')
    setCustomType('')
    setMediaFile(null)
    setMediaPreview(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 15 * 1024 * 1024) {
      toast('File must be under 15MB', 'error')
      return
    }
    setMediaFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setMediaPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleRemoveMedia = () => {
    setMediaFile(null)
    setMediaPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast('Event title is required', 'error')
      return
    }
    setUploading(true)
    let mediaUrl: string | null = null
    try {
      if (mediaFile) {
        const ext = (mediaFile.name || '').split('.').pop() || 'jpg'
        const fileName = `event-${Date.now()}.${ext}`
        const { error: uploadError } = await supabase
          .storage.from('event-media')
          .upload(fileName, mediaFile)
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('event-media').getPublicUrl(fileName)
        mediaUrl = publicUrl
      }
      const eventTypeFinal = eventType === 'other' && customType.trim()
        ? customType : categories.find(cat => cat.id === eventType)?.label || 'Other'
      const { error } = await supabase.from('live_events').insert({
        type: eventTypeFinal,
        title: title.trim(),
        description: description.trim(),
        latitude,
        longitude,
        media_url: mediaUrl,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
      if (error) throw error
      toast('🎉 Event posted!', 'success')
      reset()
      onClose()
      onSuccess?.()
    } catch (error: any) {
      toast(error.message || 'Failed to create event', 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="modal-overlay fixed inset-0 flex items-center justify-center p-4"
        onClick={onClose}
        style={{ backdropFilter: 'blur(4px)' }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="modal-content bg-gray-900 border-2 border-orange-600 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 relative flex flex-col gap-5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-white text-lg flex items-center gap-2">
              <Zap className="w-5 h-5" /> Create Event
            </h2>
            <button onClick={() => { reset(); onClose(); }} className="p-2 rounded-lg hover:bg-white/10">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              placeholder="Event title (e.g. Chill party, Study marathon...)"
              value={title}
              maxLength={50}
              onChange={e => setTitle(e.target.value)}
              disabled={uploading}
              required
            />
            <div>
              <label className="text-xs text-gray-300 mb-2 block font-bold">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${
                      eventType === cat.id
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-orange-700/20'
                    }`}
                    onClick={() => setEventType(cat.id)}
                    disabled={uploading}
                  >
                    {cat.label}
                  </button>
                ))}
                </div>
                {eventType === 'other' && (
                  <input
                    type="text"
                    className="w-full mt-2 px-3 py-2 bg-gray-800 border border-orange-600 rounded-lg text-white placeholder-gray-400 text-sm"
                    placeholder="Name your event category"
                    value={customType}
                    maxLength={20}
                    onChange={e => setCustomType(e.target.value)}
                    disabled={uploading}
                  />
                )}
            </div>
            <textarea
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none"
              rows={2}
              maxLength={150}
              placeholder="Describe your event (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={uploading}
            />
            {allowMedia && (
              <div>
                <label className="text-xs font-bold text-gray-300 mb-2 block">Optional: Upload photo or video</label>
                {!mediaPreview ? (
                  <button type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 rounded-xl border-2 border-dashed border-orange-600 flex flex-col items-center justify-center gap-2 transition-all bg-gray-900 hover:bg-orange-900/10"
                    disabled={uploading}
                  >
                    <Upload className="w-8 h-8 text-orange-500" />
                    <span className="text-xs text-white">Choose Image/Video</span>
                  </button>
                ) : (
                  <div className="relative h-40 flex items-center justify-center rounded-xl overflow-hidden bg-gray-800 border-2 border-orange-500">
                    {mediaFile?.type.startsWith('video') ? (
                      <video
                        src={mediaPreview}
                        controls
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <img
                        src={mediaPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveMedia}
                      className="absolute top-2 right-2 p-2 bg-red-500 rounded-full"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  aria-label="Upload photo or video"
                  disabled={uploading}
                />
                <p className="text-xs text-gray-500 mt-1">Max size 15MB</p>
              </div>
            )}
            <Button
              type="submit"
              disabled={uploading || !title.trim()}
              isLoading={uploading}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Post Event (24h)
                </>
              )}
            </Button>
            <p className="text-xs text-center text-gray-500">
              🎯 Your event will be live for 24 hours
            </p>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
