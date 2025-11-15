'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, X, TrendingUp, MapPin, Trophy, Globe, Calendar, Award, Minimize2, Maximize2 } from 'lucide-react'
import { useDeviceId } from '@/hooks/useDeviceId'
import { useStreak } from '@/hooks/useStreak'
import { supabase } from '@/lib/supabase/client'
import { ACHIEVEMENT_BADGES } from '@/lib/constants'

export default function ProfilePanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalUpvotes: 0,
    totalDownvotes: 0,
    rank: 0
  })
  const [loading, setLoading] = useState(true)
  const [earnedAchievements, setEarnedAchievements] = useState<Array<[string, any]>>([])
  
  const deviceId = useDeviceId()
  const { streak } = useStreak()

  useEffect(() => {
    if (isOpen && deviceId) {
      fetchStats()
      loadAchievements()
    }
  }, [isOpen, deviceId])

  async function fetchStats() {
    try {
      setLoading(true)
      
      const { data: messages, error } = await supabase
        .from('messages')
        .select('upvotes, downvotes')
        .eq('device_id', deviceId)

      if (error) throw error

      const totalMessages = messages?.length || 0
      const totalUpvotes = messages?.reduce((sum, m) => sum + m.upvotes, 0) || 0
      const totalDownvotes = messages?.reduce((sum, m) => sum + m.downvotes, 0) || 0

      const score = totalUpvotes - totalDownvotes + totalMessages * 2
      const rank = Math.max(1, Math.floor(10000 / (score + 1)))

      setStats({ totalMessages, totalUpvotes, totalDownvotes, rank })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  function loadAchievements() {
    if (typeof window !== 'undefined' && deviceId) {
      const earned = Object.entries(ACHIEVEMENT_BADGES).filter(([key]) => {
        return localStorage.getItem(`achievement_${deviceId}_${key}`) === 'true'
      })
      setEarnedAchievements(earned)
    }
  }

  return (
    <>
      {/* Profile Button - COMPACT */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed top-24 left-4 z-[40] bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-3 rounded-full shadow-xl hover:shadow-blue-500/50 transition-all side-panel"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <User className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Profile Panel - PROFESSIONAL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ 
              x: 0, 
              opacity: 1,
              width: isMinimized ? '60px' : '320px'
            }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 h-full bg-gray-900 border-r-2 border-blue-600 shadow-2xl z-[55] overflow-hidden flex flex-col profile-panel"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {!isMinimized && (
                    <>
                      <h3 className="font-bold text-white text-sm flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Your Profile
                      </h3>
                      <p className="text-white/80 text-xs">Anonymous Explorer</p>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1.5 hover:bg-white/20 rounded-lg"
                  >
                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg">
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {!isMinimized && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <>
                    {/* Stats Grid - COMPACT */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                        <MapPin className="w-4 h-4 text-blue-400 mb-1" />
                        <p className="text-2xl font-bold text-white">{stats.totalMessages}</p>
                        <p className="text-gray-400 text-xs">Messages</p>
                      </div>

                      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                        <TrendingUp className="w-4 h-4 text-green-400 mb-1" />
                        <p className="text-2xl font-bold text-green-400">{stats.totalUpvotes}</p>
                        <p className="text-gray-400 text-xs">Upvotes</p>
                      </div>

                      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                        <Trophy className="w-4 h-4 text-yellow-400 mb-1" />
                        <p className="text-2xl font-bold text-yellow-400">#{stats.rank}</p>
                        <p className="text-gray-400 text-xs">Rank</p>
                      </div>

                      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                        <Globe className="w-4 h-4 text-purple-400 mb-1" />
                        <p className="text-2xl font-bold text-purple-400">{streak.countriesVisited.length}</p>
                        <p className="text-gray-400 text-xs">Countries</p>
                      </div>
                    </div>

                    {/* Streak - COMPACT */}
                    <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-xs font-bold">🔥 {streak.currentStreak} Day Streak</p>
                          <p className="text-gray-400 text-xs">Longest: {streak.longestStreak}</p>
                        </div>
                      </div>
                    </div>

                    {/* Achievements - COMPACT */}
                    <div>
                      <h4 className="text-white text-xs font-bold mb-2 flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        Achievements ({earnedAchievements.length}/{Object.keys(ACHIEVEMENT_BADGES).length})
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(ACHIEVEMENT_BADGES).slice(0, 4).map(([key, badge]) => {
                          const isEarned = earnedAchievements.some(([k]) => k === key)
                          
                          return (
                            <div
                              key={key}
                              className={`p-2 rounded-lg border transition-all ${
                                isEarned
                                  ? `bg-gradient-to-br ${badge.color} border-transparent`
                                  : 'bg-gray-800 border-gray-700 opacity-50'
                              }`}
                            >
                              <div className="text-2xl mb-1">{badge.icon}</div>
                              <p className="text-white text-xs font-bold">{badge.name}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
