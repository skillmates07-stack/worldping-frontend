'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ThumbsUp, ThumbsDown, MapPin, Clock, Trash2, MoreVertical } from 'lucide-react'
import { supabase, type Message } from '@/lib/supabase/client'
import { useDeviceId } from '@/hooks/useDeviceId'
import { useMessageActions } from '@/hooks/useMessageActions'
import { formatTimeAgo, cn } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

interface MessageCardProps {
  message: Message
}

export default function MessageCard({ message }: MessageCardProps) {
  const deviceId = useDeviceId()
  const { deleteMessage } = useMessageActions()
  const [voting, setVoting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [localVotes, setLocalVotes] = useState({
    upvotes: message.upvotes,
    downvotes: message.downvotes
  })
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null)

  const score = localVotes.upvotes - localVotes.downvotes
  const isOwnMessage = message.device_id === deviceId

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!deviceId || voting || isOwnMessage) return
    
    setVoting(true)
    
    try {
      const { error } = await supabase
        .from('votes')
        .upsert({
          message_id: message.id,
          device_id: deviceId,
          vote_type: voteType
        }, {
          onConflict: 'message_id,device_id'
        })

      if (error) throw error

      if (userVote === voteType) {
        setLocalVotes(prev => ({
          upvotes: voteType === 'up' ? prev.upvotes - 1 : prev.upvotes,
          downvotes: voteType === 'down' ? prev.downvotes - 1 : prev.downvotes
        }))
        setUserVote(null)
      } else {
        setLocalVotes(prev => ({
          upvotes: voteType === 'up' ? prev.upvotes + 1 : (userVote === 'up' ? prev.upvotes - 1 : prev.upvotes),
          downvotes: voteType === 'down' ? prev.downvotes + 1 : (userVote === 'down' ? prev.downvotes - 1 : prev.downvotes)
        }))
        setUserVote(voteType)
      }
    } catch (err) {
      console.error('Vote error:', err)
    } finally {
      setVoting(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('🗑️ Delete this message? This cannot be undone.')) {
      const success = await deleteMessage(message.id, message.device_id)
      if (success) {
        setShowMenu(false)
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "glass-dark rounded-xl p-4 hover:border-gray-700 transition-all duration-200 group relative",
        isOwnMessage && "border-green-500/30"
      )}
    >
      {/* Header with Menu */}
      <div className="flex items-start gap-3 mb-3">
        {/* Emoji */}
        {message.emoji && (
          <div className="text-3xl flex-shrink-0 mt-0.5">
            {message.emoji}
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm leading-relaxed break-words">
            {message.content}
          </p>
          
          <div className="flex items-center gap-2 mt-2">
            {isOwnMessage && (
              <Badge variant="success" className="text-xs">
                Your Message
              </Badge>
            )}
          </div>
        </div>

        {/* Score & Menu */}
        <div className="flex items-center gap-2">
          {/* Score Badge */}
          <div className={cn(
            "flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold",
            score > 5 ? "bg-green-500/20 text-green-400" :
            score > 0 ? "bg-blue-500/20 text-blue-400" :
            score < 0 ? "bg-red-500/20 text-red-400" :
            "bg-gray-700 text-gray-400"
          )}>
            {score > 0 ? '+' : ''}{score}
          </div>

          {/* Delete Menu (Only for own messages) */}
          {isOwnMessage && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>

              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 top-8 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-10 overflow-hidden"
                >
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Message
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-800">
        {/* Meta Info */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {message.latitude.toFixed(2)}°, {message.longitude.toFixed(2)}°
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(message.created_at)}
          </span>
        </div>

        {/* Vote Buttons (Only for other's messages) */}
        {!isOwnMessage && (
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleVote('up')}
              disabled={voting}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium flex items-center gap-1",
                userVote === 'up'
                  ? "bg-green-500 text-white"
                  : "bg-gray-800 hover:bg-green-500/20 hover:text-green-400 text-gray-400"
              )}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{localVotes.upvotes}</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleVote('down')}
              disabled={voting}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium flex items-center gap-1",
                userVote === 'down'
                  ? "bg-red-500 text-white"
                  : "bg-gray-800 hover:bg-red-500/20 hover:text-red-400 text-gray-400"
              )}
            >
              <ThumbsDown className="w-4 h-4" />
              <span>{localVotes.downvotes}</span>
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
