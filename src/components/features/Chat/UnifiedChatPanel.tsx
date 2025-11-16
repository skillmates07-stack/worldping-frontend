'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Users, Send, X, Loader2, Minimize2, Maximize2, Users2, Plus } from 'lucide-react'
import { useDeviceId } from '@/hooks/useDeviceId'
import { useJoinedClans } from '@/hooks/useClanMembership'
import { useClanMessages } from '@/hooks/useClanMessages'
import { formatTimeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase/client'

interface ChatMessage {
  id: string
  device_id: string
  content: string
  clan_id?: string
  created_at: string
  emoji?: string
}

export default function UnifiedChatPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [activeTab, setActiveTab] = useState<'global' | string>('global')
  const [globalMessages, setGlobalMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [onlineCount, setOnlineCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const deviceId = useDeviceId()

  const { clans } = useJoinedClans()
  const activeClanId = activeTab !== 'global' ? activeTab : null
  const { messages: clanMessages = [], loading: clanLoading } = useClanMessages(activeClanId || '')
  
  const messages = activeTab === 'global' ? globalMessages : clanMessages
  const chatLoading = activeTab === 'global' ? loading : clanLoading

  useEffect(() => {
    if (isOpen && activeTab === 'global') {
      fetchMessages()
      subscribeToMessages()
      updateOnlineCount()
    }
  }, [isOpen, activeTab])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isOpen, activeTab])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function fetchMessages() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('global_chat')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100)

      if (error) throw error
      setGlobalMessages(data || [])
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
          setGlobalMessages(prev => [...prev, payload.new as ChatMessage])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  async function updateOnlineCount() {
    setOnlineCount(Math.floor(Math.random() * 500) + 100)
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !deviceId) return

    setSending(true)
    try {
      if (activeTab === 'global') {
        const { error } = await supabase
          .from('global_chat')
          .insert({
            device_id: deviceId,
            content: newMessage.trim()
          })
        if (error) throw error
      } else if (activeClanId) {
        const { error } = await supabase
          .from('clan_messages')
          .insert({
            clan_id: activeClanId,
            device_id: deviceId,
            content: newMessage.trim()
          })
        if (error) throw error
      }
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
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
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
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 600, opacity: 0 }}
            animate={{ 
              y: 0, 
              opacity: 1,
              height: isMinimized ? '60px' : '500px' 
            }}
            exit={{ y: 600, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 w-96 bg-gray-900 border-2 border-purple-600 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
            style={{ maxWidth: 'calc(100vw - 3rem)' }}
          >
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    {activeTab === 'global'
                      ? <Globe className="w-4 h-4" />
                      : <Users2 className="w-4 h-4" />}
                    {activeTab === 'global'
                      ? 'Global Chat'
                      : clans.find(clan => clan.id === activeTab)?.name || 'Clan'}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-white/90 mt-0.5">
                    <Users className="w-3 h-3" />
                    <span>{onlineCount} online</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
              
              {!isMinimized && (
                <div className="flex gap-2 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('global')}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      activeTab === 'global'
                        ? 'bg-white text-purple-600'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <Globe className="w-4 h-4 inline mr-1" />
                    Global
                  </button>
                  {clans.map(clan => (
                    <button
                      key={clan.id}
                      onClick={() => setActiveTab(clan.id)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === clan.id
                          ? 'bg-white text-purple-600'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      <Users2 className="w-4 h-4 inline mr-1" />
                      {clan.emoji && <span className="mr-1">{clan.emoji}</span>}
                      {clan.name}
                    </button>
                  ))}
                  <button
                    onClick={() => toast('Show clan discovery modal')}
                    className="flex-shrink-0 px-2 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-400 flex items-center"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            
            {!isMinimized && (
              <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-950">
                {chatLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <Globe className="w-12 h-12 text-gray-700 mb-2" />
                    <p className="text-gray-400 text-sm font-medium">No messages yet</p>
                    <p className="text-gray-600 text-xs mt-1">Be the first to chat!</p>
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
                            className={`max-w-[80%] rounded-xl px-3 py-2 ${
                              isOwnMessage
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                : 'bg-gray-800 text-gray-200'
                            }`}
                          >
                            {msg.emoji && <span className="text-lg mr-1">{msg.emoji}</span>}
                            <p className="text-xs break-words">{msg.content}</p>
                            <p className={`text-[10px] mt-1 ${
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
            )}

            {!isMinimized && (
              <form onSubmit={handleSend} className="p-2 border-t border-gray-800 bg-gray-900">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={
                      activeTab === 'global'
                        ? 'Chat globally...'
                        : `Chat to your clan...`
                    }
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
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
