'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Music, Megaphone, PartyPopper, Zap, Send, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useDeviceId } from '@/hooks/useDeviceId'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  latitude: number
  longitude: number
  onSuccess?: () => void
}

const eventTypes = [
  { value: 'concert', label: 'Concert', icon: Music, emoji: '🎵', color: 'from-purple-500 to-pink-500' },
  { value: 'protest', label: 'Protest', icon: Megaphone, emoji: '📢', color: 'from-red-500 to-orange-500' },
  { value: 'celebration', label: 'Celebration', icon: PartyPopper, emoji: '🎉', color: 'from-yellow-500 to-orange-500' },
  { value: 'emergency', label: 'Emergency', icon: Zap, emoji: '⚠️', color: 'from-red-600 to-red-500' },
]

export default function CreateEventModal({ isOpen, onClose, latitude, longitude, onSuccess }: CreateEventModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedType, setSelectedType] = useState('concert')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const deviceId = useDeviceId()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill all fields')
      return
    }

    if (!deviceId) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('live_events')
        .insert({
          device_id: deviceId,
          type: selectedType,
          title: title.trim(),
          description: description.trim(),
          latitude,
          longitude,
          location: `POINT(${longitude} ${latitude})`
        })

      if (error) throw error

      toast.success('🎉 Live event created!', { duration: 3000 })
      onSuccess?.()
      onClose()
      
      // Reset form
      setTitle('')
      setDescription('')
      setSelectedType('concert')
    } catch (err: any) {
      toast.error(err.message || 'Failed to create event')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const selectedEventType = eventTypes.find(t => t.value === selectedType)!

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${selectedEventType.color} p-4 rounded-t-2xl`}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">{selectedEventType.emoji}</span>
                  Create Live Event
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Event Type Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Event Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {eventTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setSelectedType(type.value)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          selectedType === type.value
                            ? `bg-gradient-to-r ${type.color} border-transparent text-white`
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Icon className="w-6 h-6" />
                          <span className="text-sm font-medium">{type.label}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                  Event Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Taylor Swift Concert"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
                  maxLength={50}
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's happening?"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 resize-none"
                  rows={3}
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1 text-right">{description.length}/200</p>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting || !title.trim() || !description.trim()}
                isLoading={isSubmitting}
                size="lg"
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Create Live Event
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
