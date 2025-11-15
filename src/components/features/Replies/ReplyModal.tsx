'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Loader2, MessageCircle } from 'lucide-react'
import { supabase, type Message } from '@/lib/supabase/client'
import { useDeviceId } from '@/hooks/useDeviceId'
import { formatTimeAgo } from '@/lib/utils'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface Reply {
  id: string
  message_id: string
  device_id: string
  content: string
  created_at: string
}

interface ReplyModalProps {
  message: Message | null
  isOpen: boolean
  onClose: () => void
}

export default function ReplyModal({ message, isOpen, onClose }: ReplyModalProps) {
  const [replies, setReplies] = useState<Reply[]>([])
  const [newReply, setNewReply] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const deviceId = useDeviceId()

  useEffect(() => {
    if (isOpen && message) {
      fetchReplies()
      subscribeToReplies()
    }
  }, [isOpen, message])

  useEffect(() => {
    scrollToBottom()
  }, [replies])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function fetchReplies() {
    if (!message) return
    
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('message_replies')
        .select('*')
        .eq('message_id', message.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setReplies(data || [])
    } catch (error) {
      console.error('Error fetching replies:', error)
    } finally {
      setLoading(false)
    }
  }

  function subscribeToReplies() {
    if (!message) return

    const channel = supabase
      .channel(`replies-${message.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_replies',
          filter: `message_id=eq.${message.id}`
        },
        (payload) => {
          setReplies(prev => [...prev, payload.new as Reply])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault()
    
    if (!newReply.trim() || !deviceId || !message) return

    setSending(true)
    try {
      const { error } = await supabase
        .from('message_replies')
        .insert({
          message_id: message.id,
          device_id: deviceId,
          content: newReply.trim()
        })

      if (error) throw error
      
      setNewReply('')
      toast.success('💬 Reply sent!')
    } catch (error: any) {
      toast.error('Failed to send reply')
      console.error(error)
    } finally {
      setSending(false)
    }
  }

  if (!isOpen || !message) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Conversation Thread
                </h3>
                <p className="text-white/80 text-xs mt-1">
                  {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Original Message */}
            <div className="p-4 border-b border-gray-800 bg-gray-800/50">
              <div className="flex gap-3">
                <div className="text-3xl">{message.emoji || '💬'}</div>
                <div className="flex-1">
                  <p className="text-white text-sm leading-relaxed">{message.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>{formatTimeAgo(message.created_at)}</span>
                    <span>•</span>
                    <span>👍 {message.upvotes}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Replies List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : replies.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-700 mb-2" />
                  <p className="text-gray-400 text-sm font-medium">No replies yet</p>
                  <p className="text-gray-600 text-xs mt-1">Be the first to reply!</p>
                </div>
              ) : (
                <>
                  {replies.map((reply) => {
                    const isOwnReply = reply.device_id === deviceId
                    
                    return (
                      <motion.div
                        key={reply.id}
                        initial={{ opacity: 0, x: isOwnReply ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex ${isOwnReply ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-xl px-4 py-2 ${
                            isOwnReply
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-800 text-gray-200'
                          }`}
                        >
                          <p className="text-sm break-words">{reply.content}</p>
                          <p className={`text-xs mt-1 ${
                            isOwnReply ? 'text-blue-200' : 'text-gray-500'
                          }`}>
                            {formatTimeAgo(reply.created_at)}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Reply Input */}
            <form onSubmit={handleSendReply} className="p-4 border-t border-gray-800 bg-gray-900">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
                  maxLength={300}
                  disabled={sending}
                />
                <Button
                  type="submit"
                  disabled={!newReply.trim() || sending}
                  isLoading={sending}
                  size="lg"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {newReply.length}/300 characters
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
