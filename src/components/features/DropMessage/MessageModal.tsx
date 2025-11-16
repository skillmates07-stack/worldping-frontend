'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Smile, Loader2, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useDeviceId } from '@/hooks/useDeviceId'
import { useStreak } from '@/hooks/useStreak'
import { useMessages } from '@/hooks/useMessages'
import { EMOJIS } from '@/lib/constants'
import { getCountryFromCoordinates } from '@/lib/utils'
import Button from '@/components/ui/Button'
import MoodSelector from '@/components/features/Mood/MoodSelector'
import TimeCapsuleToggle from '@/components/features/TimeCapsule/TimeCapsuleToggle'
import toast from 'react-hot-toast'
import UnlockCelebration from '../Unlock/UnlockCelebration'

interface MessageModalProps {
  isOpen: boolean
  onClose: () => void
  latitude: number
  longitude: number
  onSuccess?: () => void
}

export default function MessageModal({ 
  isOpen, 
  onClose, 
  latitude, 
  longitude, 
  onSuccess 
}: MessageModalProps) {
  const [content, setContent] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('')
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [isTimeCapsule, setIsTimeCapsule] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showUnlock, setShowUnlock] = useState(false)
  const [unlockedCount, setUnlockedCount] = useState(0)
  
  const deviceId = useDeviceId()
  const { updateStreakAfterPost } = useStreak()
  const { unlockRandomMessages } = useMessages()

  useEffect(() => {
    if (!isOpen) {
      setContent('')
      setSelectedEmoji('')
      setSelectedMood(null)
      setIsTimeCapsule(false)
      setShowEmojiPicker(false)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      toast.error('Please write a message')
      return
    }

    if (content.length > 500) {
      toast.error('Message too long (max 500 characters)')
      return
    }
    if (!deviceId) {
      toast.error('Please wait a moment...')
      return
    }

    setIsSubmitting(true)
    try {
      const unlockAt = isTimeCapsule 
        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        : null

      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          device_id: deviceId,
          content: content.trim(),
          emoji: selectedEmoji || null,
          mood: selectedMood,
          latitude,
          longitude,
          location: `POINT(${longitude} ${latitude})`,
          is_time_capsule: isTimeCapsule,
          unlock_at: unlockAt
        })
      if (insertError) throw insertError

      // Unlock random messages as reward (only for instant messages)
      if (!isTimeCapsule) {
        const count = unlockRandomMessages(10)
        if (count > 0) {
          setUnlockedCount(count)
          setShowUnlock(true)
        }
      }
      // Update streak
      const country = getCountryFromCoordinates(latitude, longitude)
      await updateStreakAfterPost(country)

      // Success message
      if (isTimeCapsule) {
        toast.success('🔒 Time Capsule created! Unlocks in 24 hours', {
          duration: 4000,
          icon: '⏰'
        })
      } else {
        toast.success('🌍 Message dropped successfully!')
      }

      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, isTimeCapsule ? 500 : (unlockedCount > 0 ? 3500 : 500))
    } catch (err: any) {
      console.error('Error creating message:', err)
      toast.error(err.message || 'Failed to create message')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay fixed inset-0 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="modal-content bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 px-6 py-5 border-b border-gray-800 backdrop-blur-sm z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
                    📍 Drop a Message
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
                  <MapPin className="w-4 h-4" />
                  <span>{latitude.toFixed(4)}°, {longitude.toFixed(4)}°</span>
                </div>
              </div>
              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* ... rest of your form ... */}
                {/* (same as before, not changed - keep your amazing UI) */}
                <TimeCapsuleToggle 
                  isTimeCapsule={isTimeCapsule}
                  onToggle={setIsTimeCapsule}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    What's your mood? 🎭
                  </label>
                  <MoodSelector 
                    selectedMood={selectedMood} 
                    onSelectMood={setSelectedMood} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Add an Emoji (optional)
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="flex items-center gap-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl hover:border-blue-500 transition-colors w-full justify-between"
                    >
                      <span className="text-2xl">{selectedEmoji || '😊'}</span>
                      <Smile className="w-5 h-5 text-gray-400" />
                    </button>
                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-xl p-3 shadow-xl z-10 max-h-48 overflow-y-auto"
                        >
                          <div className="grid grid-cols-8 gap-2">
                            {EMOJIS.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => {
                                  setSelectedEmoji(emoji)
                                  setShowEmojiPicker(false)
                                }}
                                className="text-2xl hover:scale-125 transition-transform p-1 hover:bg-gray-700 rounded"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                {/* Message Input */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind? Share with the world..."
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 resize-none transition-all"
                    rows={4}
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {isTimeCapsule 
                        ? '⏰ Will unlock in 24 hours'
                        : '⚡ Visible immediately'
                      }
                    </span>
                    <span className={`text-xs font-medium ${
                      content.length > 450 ? 'text-red-400' : 'text-gray-500'
                    }`}>
                      {content.length}/500
                    </span>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting || !content.trim()}
                  isLoading={isSubmitting}
                  size="lg"
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {isTimeCapsule ? 'Creating Capsule...' : 'Dropping...'}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      {isTimeCapsule ? '🔒 Create Time Capsule' : '🌍 Drop Message'}
                    </>
                  )}
                </Button>
                {isTimeCapsule && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-center text-purple-400 bg-purple-500/10 rounded-lg p-3 border border-purple-500/30"
                  >
                    ⏰ Your time capsule will be locked for 24 hours. Others can see the location but not the content until it unlocks!
                  </motion.p>
                )}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Unlock Celebration */}
      {showUnlock && (
        <UnlockCelebration 
          count={unlockedCount} 
          onClose={() => setShowUnlock(false)} 
        />
      )}
    </>
  )
}
