'use client'

import { useEffect, useState } from 'react'
import { supabase, type Message } from '@/lib/supabase/client'
import { useDeviceId } from './useDeviceId'
import { APP_CONFIG } from '@/lib/constants'
import toast from 'react-hot-toast'

export function useMessages() {
  const deviceId = useDeviceId()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userMessageCount, setUserMessageCount] = useState(0)
  const [unlockedMessages, setUnlockedMessages] = useState<string[]>([])

  useEffect(() => {
    fetchMessages()
    
    if (deviceId) {
      fetchUserMessageCount()
      loadUnlockedMessages()
    }

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [payload.new as Message, ...prev])
            toast('🌍 New message nearby!', {
              icon: '✨',
              duration: 3000
            })
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev => prev.map(m => 
              m.id === payload.new.id ? payload.new as Message : m
            ))
          } else if (payload.eventType === 'DELETE') {
            setMessages(prev => prev.filter(m => m.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [deviceId])

  async function fetchMessages() {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(200)

      if (fetchError) throw fetchError
      setMessages(data || [])
    } catch (err: any) {
      console.error('Fetch error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchUserMessageCount() {
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('device_id', deviceId)
    
    setUserMessageCount(count || 0)
  }

  function loadUnlockedMessages() {
    const unlocked = localStorage.getItem(`unlocked_${deviceId}`)
    if (unlocked) {
      setUnlockedMessages(JSON.parse(unlocked))
    }
  }

  function unlockRandomMessages(count: number = APP_CONFIG.MESSAGES_PER_UNLOCK): number {
    const locked = messages.filter(m => 
      !unlockedMessages.includes(m.id) && 
      m.device_id !== deviceId
    )
    
    const shuffled = locked.sort(() => Math.random() - 0.5)
    const toUnlock = shuffled.slice(0, count).map(m => m.id)
    
    const allUnlocked = [...unlockedMessages, ...toUnlock]
    setUnlockedMessages(allUnlocked)
    localStorage.setItem(`unlocked_${deviceId}`, JSON.stringify(allUnlocked))
    
    return toUnlock.length
  }

  function isMessageUnlocked(messageId: string): boolean {
    const message = messages.find(m => m.id === messageId)
    if (!message) return false
    
    // User's own messages are always unlocked
    if (message.device_id === deviceId) return true
    
    // Check if user has posted at least once
    if (userMessageCount > 0) return true
    
    // Check if specifically unlocked
    return unlockedMessages.includes(messageId)
  }

  return {
    messages,
    loading,
    error,
    refetch: fetchMessages,
    userMessageCount,
    unlockRandomMessages,
    isMessageUnlocked
  }
}
