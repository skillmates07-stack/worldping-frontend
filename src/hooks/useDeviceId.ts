'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function useDeviceId() {
  const [deviceId, setDeviceId] = useState<string>('')

  useEffect(() => {
    async function initAuth() {
      // Check if user is already signed in
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setDeviceId(session.user.id)
        return
      }

      // Sign in anonymously if not authenticated
      const { data, error } = await supabase.auth.signInAnonymously()
      
      if (error) {
        console.error('Auth error:', error)
        return
      }

      if (data.user) {
        setDeviceId(data.user.id)
        console.log('Anonymous user signed in:', data.user.id)
      }
    }

    initAuth()
  }, [])

  return deviceId
}
