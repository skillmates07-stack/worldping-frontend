'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, X, Users, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useDeviceId } from '@/hooks/useDeviceId'
import { formatTimeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'

interface CityMessage {
  id: string
  city: string
  device_id: string
  content: string
  created_at: string
}

interface CityChatPanelProps {
  cityName: string | null
  onClose: () => void
}

export default function CityChatPanel({ cityName, onClose }: CityChatPanelProps) {
  const [messages, setMessages] = useState<CityMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [onlineCount, setOnlineCount] = useState(1)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const deviceId = useDeviceId()

  useEffect(() => {
    if (cityName) {
      fetchMessages()
      subscribeToMessages()
    }
  }, [cityName])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function fetchMessages() {
    if (!cityName) return
    
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('city_chats')
        .select('*')
        .eq('city', cityName)
        .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true })
        .limit(50)

      if (error) throw error
      setMessages(data || [])
      
      // Simulate online count (in production, use presence)
      setOnlineCount(Math.floor(Math.random() * 20) + 5)
    } catch (error) {
      console.error('Error fetching city chat:', error)
    } finally {
      setLoading(false)
    }
  }

  function subscribeToMessages() {
    if (!cityName) return

    const channel = supabase
      .channel(`city-chat-${cityName}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'city_chats',
          filter: `city=eq.${cityName}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as CityMessage])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    
    if (!newMessage.trim() || !deviceId || !cityName) return

    setSending(true)
    try {
      const { error } = await supabase
        .from('city_chats')
        .insert({
          city: cityName,
          device_id: deviceId,
          content: newMessage.trim()
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

  if (!cityName) return null

  return (
    <motion.div
      initial={{ x: 400 }}
      animate={{ x: 0 }}
      exit={{ x: 400 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed right-0 top-0 h-full w-full sm:w-96 bg-gray-900 border-l border-gray-800 shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {cityName} Chat
          </h3>
          <div className="flex items-center gap-2 text-xs text-white/80 mt-1">
            <Users className="w-3 h-3" />
            <span>{onlineCount} online</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <MessageSquare className="w-16 h-16 text-gray-700 mb-3" />
            <p className="text-gray-400 font-medium">No messages yet</p>
            <p className="text-gray-600 text-sm mt-1">Be the first to chat in {cityName}!</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isOwnMessage = msg.device_id === deviceId
              
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      isOwnMessage
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-200'
                    }`}
                  >
                    <p className="text-sm break-words">{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-blue-200' : 'text-gray-500'
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
      <form onSubmit={handleSend} className="p-4 border-t border-gray-800 bg-gray-900">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Chat in ${cityName}...`}
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
            maxLength={200}
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center justify-center"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Send className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Anonymous • Auto-deletes in 24h
        </p>
      </form>
    </motion.div>
  )
}
