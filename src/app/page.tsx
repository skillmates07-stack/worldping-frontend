'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Globe, Sparkles, TrendingUp } from 'lucide-react'
import { MessageFeed } from '@/components/features/MessageFeed'
import DiscoverPanel from '@/components/features/Discover/DiscoverPanel'
import ProfilePanel from '@/components/features/Profile/ProfilePanel'
import StreakBadge from '@/components/features/Streak/StreakBadge'
import UnifiedChatPanel from '@/components/features/Chat/UnifiedChatPanel'

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

export default function HomePage() {
  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Professional Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="relative bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b border-gray-800"
      >
        {/* Animated Background */}
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

          {/* Stats */}
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
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Streak Badge */}
        <StreakBadge />
        
        {/* Map - 70% on desktop, 100% on mobile */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full lg:w-[70%] h-full relative"
        >
          <MapContainer />
        </motion.div>
        
        {/* Message Feed Sidebar */}
        <motion.aside 
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="hidden lg:block lg:w-[30%] h-full border-l border-gray-800 overflow-hidden"
        >
          <MessageFeed />
        </motion.aside>
      </main>
      
      {/* Profile Panel */}
        <ProfilePanel />

      {/* Discover Panel */}
        <DiscoverPanel />

      {/* Unified Chat (Global + City) */}
      <UnifiedChatPanel />
    </div>
  )
}


