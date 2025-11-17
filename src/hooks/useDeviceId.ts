'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function useDeviceId() {
  const [deviceId, setDeviceId] = useState<string>("")

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }} = await supabase.auth.getSession()
      // This works for Google, Email, etc.
      setDeviceId(session?.user?.id ?? "")
    }
    getSession()
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setDeviceId(session?.user?.id ?? "")
    })
    return () => { listener?.subscription.unsubscribe() }
  }, [])

  return deviceId
}
