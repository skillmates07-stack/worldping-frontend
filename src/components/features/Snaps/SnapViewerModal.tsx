'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Flame, Zap, Eye, Camera, Share2, MapPin, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useDeviceId } from '@/hooks/useDeviceId'
import { useToast } from '@/components/ui/Toast'
import { formatTimeAgo } from '@/lib/utils'
import ShareModal from '@/components/ui/ShareModal'

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

function SnapViewerModal({ snap, isOpen, onClose }: SnapViewerModalProps) {
  const toast = useToast()
  const deviceId = useDeviceId()
  
  const [userReaction, setUserReaction] = useState<'fire' | 'love' | 'wow' | null>(null)
  const [localReactions, setLocalReactions] = useState(snap?.reactions || { fire: 0, love: 0, wow: 0 })
  const [shareOpen, setShareOpen] = useState(false)

  useEffect(() => {
    if (isOpen && snap) {
      setLocalReactions(snap.reactions)
      checkUserReaction()
      incrementViewCount()
    }
  }, [isOpen, snap])

  const checkUserReaction = useCallback(async () => {
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
  }, [snap, deviceId])

  const incrementViewCount = useCallback(async () => {
    if (!snap) return

    await supabase
      .from('snaps')
      .update({ view_count: (snap.view_count || 0) + 1 })
      .eq('id', snap.id)
  }, [snap])

  const handleReaction = useCallback(async (type: 'fire' | 'love' | 'wow') => {
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
        toast('Reaction removed', 'info')
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
        toast('Reaction added!', 'success')
      }
    } catch (error) {
      console.error('Reaction error:', error)
      toast('Failed to react', 'error')
    }
  }, [snap, deviceId, userReaction, toast])

  if (!isOpen || !snap) return null

  const totalReactions = localReactions.fire + localReactions.love + localReactions.wow
  const timeLeft = new Date(snap.expires_at).getTime() - Date.now()
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)))

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex items-center justify-center modal-overlay"
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
              className="absolute top-4 right-4 z-10 p-2 bg-black/70 hover:bg-black/90 rounded-full transition-colors shadow-lg"
              aria-label="Close snap"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Snap Content */}
            <article className="bg-gray-900 rounded-2xl overflow-hidden border-2 border-gray-800 shadow-2xl">
              {/* Image/Video */}
              {snap.image_url ? (
                <div className="relative aspect-[9/16] bg-black">
                  <img 
                    src={snap.image_url} 
                    alt={snap.caption || 'Snap'} 
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                  
                  {/* Gradient overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/90 to-transparent pointer-events-none"></div>
                  
                  {/* Caption overlay */}
                  {snap.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white text-lg font-medium drop-shadow-2xl">
                        {snap.caption}
                      </p>
                    </div>
                  )}

                  {/* Time remaining badge */}
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-white text-sm font-medium">{hoursLeft}h left</span>
                  </div>

                  {/* Share Button */}
                  <button
                    onClick={() => setShareOpen(true)}
                    className="absolute top-4 right-4 p-2 bg-black/80 backdrop-blur-md hover:bg-black/90 rounded-full transition-colors shadow-lg"
                    aria-label="Share snap"
                  >
                    <Share2 className="w-5 h-5 text-white" />
                  </button>
                </div>
              ) : (
                // No image placeholder
                <div className="aspect-[9/16] bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 flex items-center justify-center">
                  <div className="text-center px-6">
                    <Camera className="w-20 h-20 text-white/50 mx-auto mb-4" />
                    {snap.caption && (
                      <p className="text-white text-xl font-bold">{snap.caption}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Reaction Bar */}
              <footer className="p-4 bg-gray-900 border-t border-gray-800">
                {/* Stats Row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Eye className="w-4 h-4" aria-hidden="true" />
                    <span>{snap.view_count || 0} views</span>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {totalReactions} reactions
                  </div>
                </div>

                {/* Reaction Buttons */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleReaction('fire')}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all ${
                      userReaction === 'fire'
                        ? 'bg-orange-500/30 border-2 border-orange-500 text-orange-400'
                        : 'bg-gray-800 border-2 border-transparent text-gray-400 hover:bg-gray-700 hover:border-orange-500/50'
                    }`}
                    aria-label={`React with fire: ${localReactions.fire}`}
                  >
                    <Flame className="w-7 h-7" />
                    <span className="text-xs font-bold">{localReactions.fire}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleReaction('love')}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all ${
                      userReaction === 'love'
                        ? 'bg-pink-500/30 border-2 border-pink-500 text-pink-400'
                        : 'bg-gray-800 border-2 border-transparent text-gray-400 hover:bg-gray-700 hover:border-pink-500/50'
                    }`}
                    aria-label={`React with love: ${localReactions.love}`}
                  >
                    <Heart className="w-7 h-7" />
                    <span className="text-xs font-bold">{localReactions.love}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleReaction('wow')}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all ${
                      userReaction === 'wow'
                        ? 'bg-purple-500/30 border-2 border-purple-500 text-purple-400'
                        : 'bg-gray-800 border-2 border-transparent text-gray-400 hover:bg-gray-700 hover:border-purple-500/50'
                    }`}
                    aria-label={`React with wow: ${localReactions.wow}`}
                  >
                    <Zap className="w-7 h-7" />
                    <span className="text-xs font-bold">{localReactions.wow}</span>
                  </motion.button>
                </div>

                {/* Location & Time */}
                <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" aria-hidden="true" />
                    {snap.latitude.toFixed(2)}°, {snap.longitude.toFixed(2)}°
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" aria-hidden="true" />
                    {formatTimeAgo(snap.created_at)}
                  </span>
                </div>
              </footer>
            </article>
          </motion.div>

          {/* Share Modal */}
          <ShareModal
            isOpen={shareOpen}
            onClose={() => setShareOpen(false)}
            shareTitle="WorldPing Snap"
            shareText={snap.caption || 'Check out this snap on WorldPing!'}
            shareUrl={`https://worldping-frontend.netlify.app/snap/${snap.id}`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default memo(SnapViewerModal)
