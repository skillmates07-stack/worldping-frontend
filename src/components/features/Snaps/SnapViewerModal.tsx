'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Flame, Zap, Eye, MessageCircle, Camera } from 'lucide-react'  // ✅ Added Camera
import { supabase } from '@/lib/supabase/client'
import { useDeviceId } from '@/hooks/useDeviceId'
import { formatTimeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Snap {
  id: string
  device_id: string
  caption: string
  image_url: string | null
  video_url: string | null
  latitude: number
  longitude: number
  mood: string | null
  reactions: {
    fire: number
    love: number
    wow: number
  }
  view_count: number
  created_at: string
  expires_at: string
}

interface SnapViewerModalProps {
  snap: Snap | null
  isOpen: boolean
  onClose: () => void
}

export default function SnapViewerModal({ snap, isOpen, onClose }: SnapViewerModalProps) {
  const [userReaction, setUserReaction] = useState<'fire' | 'love' | 'wow' | null>(null)
  const [localReactions, setLocalReactions] = useState(snap?.reactions || { fire: 0, love: 0, wow: 0 })
  const deviceId = useDeviceId()

  useEffect(() => {
    if (isOpen && snap) {
      setLocalReactions(snap.reactions)
      checkUserReaction()
      incrementViewCount()
    }
  }, [isOpen, snap])

  async function checkUserReaction() {
    if (!snap || !deviceId) return

    const { data } = await supabase
      .from('snap_reactions')
      .select('reaction_type')
      .eq('snap_id', snap.id)
      .eq('device_id', deviceId)
      .single()

    if (data) {
      setUserReaction(data.reaction_type as any)
    }
  }

  async function incrementViewCount() {
    if (!snap) return

    await supabase
      .from('snaps')
      .update({ view_count: (snap.view_count || 0) + 1 })
      .eq('id', snap.id)
  }

  async function handleReaction(type: 'fire' | 'love' | 'wow') {
    if (!snap || !deviceId) return

    try {
      if (userReaction === type) {
        // Remove reaction
        await supabase
          .from('snap_reactions')
          .delete()
          .eq('snap_id', snap.id)
          .eq('device_id', deviceId)

        setLocalReactions(prev => ({
          ...prev,
          [type]: Math.max(0, prev[type] - 1)
        }))
        setUserReaction(null)
      } else {
        // Add/change reaction
        await supabase
          .from('snap_reactions')
          .upsert({
            snap_id: snap.id,
            device_id: deviceId,
            reaction_type: type
          })

        setLocalReactions(prev => ({
          ...prev,
          [type]: prev[type] + 1,
          ...(userReaction && { [userReaction]: Math.max(0, prev[userReaction] - 1) })
        }))
        setUserReaction(type)
      }
    } catch (error) {
      console.error('Reaction error:', error)
      toast.error('Failed to react')
    }
  }

  if (!isOpen || !snap) return null

  const totalReactions = localReactions.fire + localReactions.love + localReactions.wow
  const timeLeft = new Date(snap.expires_at).getTime() - Date.now()
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60))

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Snap Content */}
            <div className="bg-gray-900 rounded-2xl overflow-hidden border-2 border-gray-800">
              {/* Image/Video */}
              {snap.image_url && (
                <div className="relative aspect-[9/16] bg-black">
                  <img 
                    src={snap.image_url} 
                    alt="Snap" 
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Gradient overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent"></div>
                  
                  {/* Caption overlay */}
                  {snap.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white text-lg font-medium drop-shadow-lg">
                        {snap.caption}
                      </p>
                    </div>
                  )}

                  {/* Time remaining badge */}
                  <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-white text-sm font-medium">{hoursLeft}h left</span>
                  </div>
                </div>
              )}

              {/* No image placeholder */}
              {!snap.image_url && !snap.video_url && (
                <div className="aspect-[9/16] bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-20 h-20 text-white/50 mx-auto mb-4" />
                    <p className="text-white text-xl font-bold">{snap.caption}</p>
                  </div>
                </div>
              )}

              {/* Reaction Bar */}
              <div className="p-4 bg-gray-900 border-t border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Eye className="w-4 h-4" />
                    <span>{snap.view_count || 0} views</span>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {totalReactions} reactions
                  </div>
                </div>

                {/* Reaction Buttons */}
                <div className="flex items-center justify-around">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleReaction('fire')}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                      userReaction === 'fire'
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <Flame className="w-7 h-7" />
                    <span className="text-xs font-bold">{localReactions.fire}</span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleReaction('love')}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                      userReaction === 'love'
                        ? 'bg-pink-500/20 text-pink-400'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <Heart className="w-7 h-7" />
                    <span className="text-xs font-bold">{localReactions.love}</span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleReaction('wow')}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                      userReaction === 'wow'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <Zap className="w-7 h-7" />
                    <span className="text-xs font-bold">{localReactions.wow}</span>
                  </motion.button>
                </div>

                {/* Location & Time */}
                <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
                  <span>📍 {snap.latitude.toFixed(2)}°, {snap.longitude.toFixed(2)}°</span>
                  <span>{formatTimeAgo(snap.created_at)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
