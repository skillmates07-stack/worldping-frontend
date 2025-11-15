'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, X, TrendingUp, MapPin, Trophy, Star, Globe, Calendar } from 'lucide-react'
import { useDeviceId } from '@/hooks/useDeviceId'
import { useStreak } from '@/hooks/useStreak'
import { supabase } from '@/lib/supabase/client'
import Badge from '@/components/ui/Badge'
import { ACHIEVEMENT_BADGES } from '@/lib/constants'

export default function ProfilePanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalUpvotes: 0,
    totalDownvotes: 0,
    rank: 0
  })
  const [loading, setLoading] = useState(true)
  
  const deviceId = useDeviceId()
  const { streak } = useStreak()

  useEffect(() => {
    if (isOpen && deviceId) {
      fetchStats()
    }
  }, [isOpen, deviceId])

  async function fetchStats() {
    try {
      setLoading(true)
      
      // Get user's messages
      const { data: messages, error } = await supabase
        .from('messages')
        .select('upvotes, downvotes')
        .eq('device_id', deviceId)

      if (error) throw error

      const totalMessages = messages?.length || 0
      const totalUpvotes = messages?.reduce((sum, m) => sum + m.upvotes, 0) || 0
      const totalDownvotes = messages?.reduce((sum, m) => sum + m.downvotes, 0) || 0

      // Calculate rank (simplified)
      const score = totalUpvotes - totalDownvotes + totalMessages * 2
      const rank = Math.max(1, Math.floor(10000 / (score + 1)))

      setStats({ totalMessages, totalUpvotes, totalDownvotes, rank })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const earnedAchievements = Object.entries(ACHIEVEMENT_BADGES).filter(([key]) => {
    return localStorage.getItem(`achievement_${deviceId}_${key}`) === 'true'
  })

  return (
    <>
      {/* Profile Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsOpen(true)}
          className="fixed top-24 left-4 z-40 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-3 rounded-full shadow-lg hover:shadow-blue-500/50 transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <User className="w-6 h-6" />
        </motion.button>
      )}

      {/* Profile Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 h-full w-full sm:w-96 bg-gray-900 border-r border-gray-800 shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 p-4 flex items-center justify-between z-10">
              <div>
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Your Profile
                </h3>
                <p className="text-white/80 text-xs mt-1">Anonymous Explorer</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-blue-400" />
                      <span className="text-gray-400 text-sm">Messages</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.totalMessages}</p>
                  </div>

                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <span className="text-gray-400 text-sm">Upvotes</span>
                    </div>
                    <p className="text-3xl font-bold text-green-400">{stats.totalUpvotes}</p>
                  </div>

                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <span className="text-gray-400 text-sm">World Rank</span>
                    </div>
                    <p className="text-3xl font-bold text-yellow-400">#{stats.rank}</p>
                  </div>

                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-5 h-5 text-purple-400" />
                      <span className="text-gray-400 text-sm">Countries</span>
                    </div>
                    <p className="text-3xl font-bold text-purple-400">{streak.countriesVisited.length}</p>
                  </div>
                </div>

                {/* Streak Section */}
                <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-white">🔥 Current Streak</h4>
                    <Badge variant="warning" className="text-lg">
                      {streak.currentStreak} days
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Longest Streak</span>
                    <span className="text-white font-semibold">{streak.longestStreak} days</span>
                  </div>
                </div>

                {/* Achievements */}
                <div>
                  <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Achievements ({earnedAchievements.length}/{Object.keys(ACHIEVEMENT_BADGES).length})
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(ACHIEVEMENT_BADGES).map(([key, badge]) => {
                      const isEarned = earnedAchievements.some(([k]) => k === key)
                      
                      return (
                        <motion.div
                          key={key}
                          whileHover={{ scale: isEarned ? 1.05 : 1 }}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            isEarned
                              ? `bg-gradient-to-br ${badge.color} border-transparent shadow-lg`
                              : 'bg-gray-800 border-gray-700 opacity-50'
                          }`}
                        >
                          <div className="text-3xl mb-1">{badge.icon}</div>
                          <p className="text-sm font-bold text-white">{badge.name}</p>
                          <p className="text-xs text-gray-400 mt-1">{badge.description}</p>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                {/* Recent Countries */}
                <div>
                  <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-400" />
                    Countries Visited
                  </h4>
                  
                  {streak.countriesVisited.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {streak.countriesVisited.map((country, i) => (
                        <Badge key={i} variant="info" className="text-sm">
                          {country}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Drop messages in different countries to track your journey!</p>
                  )}
                </div>

                {/* Member Since */}
                <div className="pt-4 border-t border-gray-800">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Member since today</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
