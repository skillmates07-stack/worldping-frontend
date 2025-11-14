'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useDeviceId } from '@/hooks/useDeviceId'

interface MessageModalProps {
  isOpen: boolean
  onClose: () => void
  latitude: number
  longitude: number
  onSuccess?: () => void
}

const EMOJI_LIST = ['😀', '😍', '🎉', '🔥', '❤️', '👍', '🌍', '✨', '💡', '🚀', '🎯', '💯', '👋', '🙌', '😎', '🤔', '😂', '🥳', '😊', '💪']

export default function MessageModal({ isOpen, onClose, latitude, longitude, onSuccess }: MessageModalProps) {
  const [content, setContent] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const deviceId = useDeviceId()

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setContent('')
      setSelectedEmoji('')
      setError('')
      setShowEmojiPicker(false)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      setError('Message cannot be empty')
      return
    }

    if (content.length > 500) {
      setError('Message too long (max 500 characters)')
      return
    }

    if (!deviceId) {
      setError('Device ID not ready, please wait')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          device_id: deviceId,
          content: content.trim(),
          emoji: selectedEmoji || null,
          latitude,
          longitude,
          location: `POINT(${longitude} ${latitude})`
        })

      if (insertError) throw insertError

      // Success!
      onSuccess?.()
      onClose()
    } catch (err: any) {
      console.error('Error creating message:', err)
      setError(err.message || 'Failed to create message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-brand-gray border border-gray-700 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-slideUp">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-brand-accent">📍 Drop a Message</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Location Info */}
        <p className="text-sm text-gray-400 mb-4">
          {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Emoji Picker Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Add an Emoji (optional)
            </label>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="px-4 py-2 bg-brand-dark border border-gray-600 rounded-lg hover:border-brand-accent transition-colors text-2xl"
            >
              {selectedEmoji || '😊 Pick'}
            </button>

            {showEmojiPicker && (
              <div className="mt-2 p-3 bg-brand-dark border border-gray-600 rounded-lg grid grid-cols-10 gap-2 max-h-32 overflow-y-auto">
                {EMOJI_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setSelectedEmoji(emoji)
                      setShowEmojiPicker(false)
                    }}
                    className="text-2xl hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
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
              className="w-full px-4 py-3 bg-brand-dark border border-gray-600 rounded-lg focus:outline-none focus:border-brand-accent text-white placeholder-gray-500 resize-none"
              rows={4}
              maxLength={500}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {content.length}/500
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="w-full py-3 px-4 bg-brand-accent hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
          >
            {isSubmitting ? 'Dropping...' : '🌍 Drop Message'}
          </button>
        </form>
      </div>
    </div>
  )
}
