'use client'

import { useState } from 'react'
import { supabase, type Message } from '@/lib/supabase/client'
import { useDeviceId } from '@/hooks/useDeviceId'

interface MessageCardProps {
  message: Message
}

export default function MessageCard({ message }: MessageCardProps) {
  const deviceId = useDeviceId()
  const [voting, setVoting] = useState(false)
  const [localVotes, setLocalVotes] = useState({
    upvotes: message.upvotes,
    downvotes: message.downvotes
  })

  const score = localVotes.upvotes - localVotes.downvotes

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!deviceId || voting) return
    
    setVoting(true)
    
    try {
      // Insert or update vote
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

      // Update local state optimistically
      setLocalVotes(prev => ({
        upvotes: voteType === 'up' ? prev.upvotes + 1 : prev.upvotes,
        downvotes: voteType === 'down' ? prev.downvotes + 1 : prev.downvotes
      }))
    } catch (err) {
      console.error('Vote error:', err)
    } finally {
      setVoting(false)
    }
  }

  const timeAgo = () => {
    const seconds = Math.floor((Date.now() - new Date(message.created_at).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="bg-brand-gray border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {message.emoji && (
          <div className="text-3xl flex-shrink-0">{message.emoji}</div>
        )}
        
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm leading-relaxed break-words">
            {message.content}
          </p>
        </div>

        {/* Score Badge */}
        <div className={`flex-shrink-0 px-2 py-1 rounded-lg text-xs font-bold ${
          score > 0 ? 'bg-green-500/20 text-green-400' :
          score < 0 ? 'bg-red-500/20 text-red-400' :
          'bg-gray-700 text-gray-400'
        }`}>
          {score > 0 ? '+' : ''}{score}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-800">
        {/* Location & Time */}
        <div className="text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            📍 {message.latitude.toFixed(2)}°, {message.longitude.toFixed(2)}°
          </span>
          <span className="mx-2">•</span>
          <span>{timeAgo()}</span>
        </div>

        {/* Vote Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleVote('up')}
            disabled={voting}
            className="px-3 py-1.5 bg-gray-800 hover:bg-green-500/20 hover:text-green-400 text-gray-400 rounded-lg transition-all duration-200 disabled:opacity-50 text-sm font-medium"
          >
            👍 {localVotes.upvotes}
          </button>
          <button
            onClick={() => handleVote('down')}
            disabled={voting}
            className="px-3 py-1.5 bg-gray-800 hover:bg-red-500/20 hover:text-red-400 text-gray-400 rounded-lg transition-all duration-200 disabled:opacity-50 text-sm font-medium"
          >
            👎 {localVotes.downvotes}
          </button>
        </div>
      </div>
    </div>
  )
}
