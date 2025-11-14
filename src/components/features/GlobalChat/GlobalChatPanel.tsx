'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Send, X, Users, Loader2, Minimize2, Maximize2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useDeviceId } from '@/hooks/useDeviceId'
import { formatTimeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'

interface GlobalMessage {
  id: string
  device_id: string
  content: string
  country?: string
  created_at: string
}

export default function GlobalChatPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<GlobalMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [onlineCount, setOnlineCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const deviceId = useDeviceId()

  useEffect(() => {
    if (isOpen) {
      fetchMessages()
      subscribeToMessages()
      updateOnlineCount()
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function fetchMessages() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('global_chat')
        .select('*')
        .gt('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
        .order('created_at', { ascending: true })
        .limit(100)

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching global chat:', error)
    } finally {
      setLoading(false)
    }
  }

  function subscribeToMessages() {
    const channel = supabase
      .channel('global-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'global_chat'
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as GlobalMessage])
          setOnlineCount(prev => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  async function updateOnlineCount() {
    // Simulate online users (in production, use presence)
    setOnlineCount(Math.floor(Math.random() * 500) + 100)
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    
    if (!newMessage.trim() || !deviceId) return

    setSending(true)
    try {
      const { error } = await supabase
        .from('global_chat')
        .insert({
          device_id: deviceId,
          content: newMessage.trim(),
          country: 'World' // Can add real country detection
        })

      if (error) throw error
      setNewMessage('')
    } catch (error: any) {
      toast.error('Failed to send message')
      console.error(error)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* Floating Globe Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Globe className="w-7 h-7 group-hover:rotate-180 transition-transform duration-500" />
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
            {onlineCount}
          </div>
        </motion.button>
      )}

      {/* Global Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 600 }}
            animate={{ y: 0, height: isMinimized ? '60px' : '500px' }}
            exit={{ y: 600 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 w-96 bg-gray-900 border-2 border-purple-600 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between cursor-pointer"
                 onClick={() => setIsMinimized(!isMinimized)}>
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Global Chat 🌍
                </h3>
                <div className="flex items-center gap-2 text-xs text-white/90 mt-1">
                  <Users className="w-3 h-3" />
                  <span>{onlineCount} online worldwide</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsMinimized(!isMinimized)
                  }}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsOpen(false)
                  }}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-950">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                      <Globe className="w-16 h-16 text-gray-700 mb-3" />
                      <p className="text-gray-400 font-medium">No messages yet</p>
                      <p className="text-gray-600 text-sm mt-1">Be the first to chat globally!</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg) => {
                        const isOwnMessage = msg.device_id === deviceId
                        
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, x: isOwnMessage ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                                isOwnMessage
                                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                  : 'bg-gray-800 text-gray-200'
                              }`}
                            >
                              {!isOwnMessage && msg.country && (
                                <p className="text-xs opacity-70 mb-1">📍 {msg.country}</p>
                              )}
                              <p className="text-sm break-words">{msg.content}</p>
                              <p className={`text-xs mt-1 ${
                                isOwnMessage ? 'text-purple-200' : 'text-gray-500'
                              }`}>
                                {formatTimeAgo(msg.created_at)}
                              </p>
                            </div>
                          </motion.div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-3 border-t border-gray-800 bg-gray-900">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Chat with the world..."
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white text-sm placeholder-gray-500"
                      maxLength={200}
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all"
                    >
                      {sending ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      ) : (
                        <Send className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Anonymous • 1 hour history
                  </p>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
