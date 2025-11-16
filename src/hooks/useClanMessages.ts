import { useEffect, useState } from 'react'
import { supabase, type Message } from '@/lib/supabase/client'
import { useDeviceId } from './useDeviceId'
import toast from 'react-hot-toast'

export function useClanMessages(clanId: string) {
  const deviceId = useDeviceId()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!clanId) return
    fetchMessages()

    const channel = supabase
      .channel(`clan-messages-${clanId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clan_messages', filter: `clan_id=eq.${clanId}`},
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [...prev, payload.new as Message])
            toast('🛡️ New clan message!', { icon: '👥', duration: 3000 })
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev =>
              prev.map(m => (m.id === payload.new.id ? (payload.new as Message) : m))
            )
          } else if (payload.eventType === 'DELETE') {
            setMessages(prev => prev.filter(m => m.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [clanId])

  async function fetchMessages() {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('clan_messages')
        .select('*')
        .eq('clan_id', clanId)
        .order('created_at', { ascending: true })
        .limit(200)

      if (fetchError) throw fetchError
      setMessages(data || [])
    } catch (err: any) {
      console.error('Fetch clan messages error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    messages,
    loading,
    error,
    refetch: fetchMessages
  }
}
