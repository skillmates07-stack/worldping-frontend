'use client'

import { useEffect, useState } from 'react'
import { supabase, type Message } from '@/lib/supabase/client'

export function useMessages(latitude?: number, longitude?: number, radiusKm: number = 500) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMessages()
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('Real-time update:', payload)
          
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [payload.new as Message, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev => 
              prev.map(msg => 
                msg.id === payload.new.id ? payload.new as Message : msg
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setMessages(prev => prev.filter(msg => msg.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [latitude, longitude, radiusKm])

  async function fetchMessages() {
    try {
      setLoading(true)
      
      let query = supabase
        .from('messages')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(100)

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      setMessages(data || [])
    } catch (err: any) {
      console.error('Error fetching messages:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { messages, loading, error, refetch: fetchMessages }
}
