'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { generateUniqueUsername } from '@/lib/usernameGenerator'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function initialize() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await ensureProfile(session.user.id)
      }
      setLoading(false)
    }

    async function ensureProfile(userId: string) {
      // Use maybeSingle() here to avoid 406 error if there's no existing profile (brand-new user)
      let { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (!existingProfile) {
        // Create new profile with unique username
        const displayName = await generateUniqueUsername(supabase)

        const { data: newProfile } = await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            display_name: displayName
          })
          .select()
          .single()

        existingProfile = newProfile
      }

      setProfile(existingProfile)
    }

    initialize()

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await ensureProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => { listener?.subscription.unsubscribe() }
  }, [])

  return { user, profile, loading }
}
