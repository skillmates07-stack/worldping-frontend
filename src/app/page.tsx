'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Sparkles, TrendingUp, MessageSquare, X } from 'lucide-react'
import { MessageFeed } from '@/components/features/MessageFeed'
import DiscoverPanel from '@/components/features/Discover/DiscoverPanel'
import ProfilePanel from '@/components/features/Profile/ProfilePanel'
import StreakBadge from '@/components/features/Streak/StreakBadge'
import UnifiedChatPanel from '@/components/features/Chat/UnifiedChatPanel'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const MapContainer = dynamic(
  () => import('@/components/features/Map/MapContainer').then(mod => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-400 text-sm">Loading WorldPing...</p>
        </div>
      </div>
    )
  }
)

// Random username generator (Reddit-style)
const ADJECTIVES = ['cosmic','neon','silver','golden','electric','quantum','stellar','crystal','digital','cyber','ultra','blazing','frozen','mystic','emerald','sapphire','ruby','lunar','solar','ancient']
const NOUNS = ['phoenix','dragon','tiger','wolf','eagle','falcon','raven','panda','dolphin','whale','shark','octopus','lion','leopard','wizard','bear','ninja','knight','warrior','ranger']

function generateUsername() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  const number = Math.floor(100 + Math.random() * 900)
  return `${adjective}_${noun}${number}`
}

// Enhanced auth hook with profile management
function useSupabaseUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function initializeAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser(session.user)
        await ensureProfile(session.user.id)
      }
      
      setChecking(false)
    }

    async function ensureProfile(userId: string) {
      // Check if profile exists
      let { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (!existingProfile) {
        // First-time login: generate unique username
        let unique = false
        let username = ''
        
        while (!unique) {
          username = generateUsername()
          const { data } = await supabase
            .from('user_profiles')
            .select('display_name')
            .eq('display_name', username)
            .single()
          
          unique = !data // Unique if not found
        }
        
        // Create new profile with random username
        const { data: newProfile } = await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            display_name: username
          })
          .select()
          .single()
        
        existingProfile = newProfile
      }

      setProfile(existingProfile)
    }

    initializeAuth()

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

  return { user, profile, checking }
}

export default function HomePage() {
  const { user, profile, checking } = useSupabaseUser()
  const [showMessageFeed, setShowMessageFeed] = useState(false)

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-white text-sm">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="w-full max-w-md bg-gray-900 rounded-xl border-2 border-purple-500 p-6 shadow-2xl">
          <div className="text-center mb-6">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4"
            >
              <Globe className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome to WorldPing</h1>
            <p className="text-gray-400 text-sm">Sign in with email to start dropping messages</p>
            <p className="text-purple-400 text-xs mt-2">✨ Get a random username like Reddit!</p>
          </div>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: { colors: { brand: '#9333ea', brandAccent: '#a855f7' } }
              }
            }}
            providers={[]}
            theme="dark"
            view="sign_up"  // Shows password fields
            magicLink={false}  // Disables magic link
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Professional Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="relative bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b border-gray-800"
      >
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-shimmer"></div>
        </div>

        <div className="relative px-6 py-4 flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg"
            >
              <Globe className="w-7 h-7 text-white" />
            </motion.div>

            <div>
              <h1 className="text-2xl font-bold gradient-text">
                WorldPing
              </h1>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Drop messages anywhere on Earth
              </p>
            </div>
          </div>

          {/* Stats & Message Toggle Button */}
          <div className="flex items-center gap-6">
            {/* Display Username */}
            <div className="hidden md:block text-right">
              <p className="text-xs text-gray-500">Signed in as</p>
              <p className="text-sm font-bold text-purple-400">{profile.display_name}</p>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <div className="flex items-center gap-1 text-green-400 text-sm font-semibold">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Live
                </div>
                <p className="text-xs text-gray-500">Active Now</p>
              </div>

              <div className="w-px h-10 bg-gray-800"></div>

              <div className="text-center">
                <div className="flex items-center gap-1 text-blue-400 text-sm font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  v2.0
                </div>
                <p className="text-xs text-gray-500">Latest</p>
              </div>
            </div>

            {/* Toggle Message Feed Button */}
            <button
              onClick={() => setShowMessageFeed(!showMessageFeed)}
              className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg text-white transition-all shadow-lg"
              title="Toggle Message Feed"
            >
              {showMessageFeed ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative">
        <StreakBadge />

        {/* Map - Full width, or 70% if sidebar is open */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`h-full transition-all duration-300 ${
            showMessageFeed ? 'w-full lg:w-[70%]' : 'w-full'
          }`}
        >
          <MapContainer />
        </motion.div>

        {/* Message Feed Sidebar - Only shows when toggled */}
        <AnimatePresence>
          {showMessageFeed && (
            <motion.aside
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="hidden lg:block lg:w-[30%] h-full border-l border-gray-800 overflow-hidden bg-gray-900"
            >
              <MessageFeed />
            </motion.aside>
          )}
        </AnimatePresence>
      </main>

      {/* Profile Panel */}
      <ProfilePanel />

      {/* Discover Panel */}
      <DiscoverPanel />

      {/* Unified Chat (Global + Clans) */}
      <UnifiedChatPanel />

      console.log('Runtime check (browser):', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    </div>
  )
}


