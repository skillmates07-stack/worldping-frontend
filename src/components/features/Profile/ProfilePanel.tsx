'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, X, TrendingUp, MapPin, Trophy, Globe, Award, Minimize2, Maximize2, Edit2 } from 'lucide-react'
import { useDeviceId } from '@/hooks/useDeviceId'
import { useStreak } from '@/hooks/useStreak'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase/client'
import { ACHIEVEMENT_BADGES } from '@/lib/constants'

// Reddit-style username generator
const ADJECTIVES = ['Happy', 'Swift', 'Bold', 'Wise', 'Cool', 'Brave', 'Clever', 'Bright', 'Noble', 'Quiet']
const NOUNS = ['Panda', 'Tiger', 'Eagle', 'Wolf', 'Fox', 'Lion', 'Bear', 'Hawk', 'Dragon', 'Phoenix']

function generateUsername(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  const num = Math.floor(Math.random() * 9999)
  return `${adj}${noun}${num}`
}

function ProfilePanel() {
  const toast = useToast()
  const deviceId = useDeviceId()
  const { streak } = useStreak()
  
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [username, setUsername] = useState<string>('')
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalSnaps: 0,
    totalUpvotes: 0,
    totalDownvotes: 0,
    rank: 0
  })
  const [loading, setLoading] = useState(true)
  const [earnedAchievements, setEarnedAchievements] = useState<Array<[string, any]>>([])

  useEffect(() => {
    if (isOpen && deviceId) {
      loadOrCreateUsername()
      fetchStats()
      loadAchievements()
    }
  }, [isOpen, deviceId])

  const loadOrCreateUsername = useCallback(async () => {
    if (!deviceId) return

    try {
      // Check if user profile exists in database
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('device_id', deviceId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (profile?.username) {
        setUsername(profile.username)
      } else {
        // Generate new username and save to database
        const generatedUsername = generateUsername()
        
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            device_id: deviceId,
            username: generatedUsername,
            created_at: new Date().toISOString()
          })

        if (insertError) throw insertError
        
        setUsername(generatedUsername)
        toast(`Welcome ${generatedUsername}!`, 'success')
      }
    } catch (error) {
      console.error('Username error:', error)
      // Fallback to localStorage if database fails
      const stored = localStorage.getItem(`username_${deviceId}`)
      if (stored) {
        setUsername(stored)
      } else {
        const generated = generateUsername()
        localStorage.setItem(`username_${deviceId}`, generated)
        setUsername(generated)
      }
    }
  }, [deviceId, toast])

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch messages
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('upvotes, downvotes')
        .eq('device_id', deviceId)

      if (msgError) throw msgError

      // Fetch snaps
      const { data: snaps, error: snapError } = await supabase
        .from('snaps')
        .select('id')
        .eq('device_id', deviceId)

      if (snapError) throw snapError

      const totalMessages = messages?.length || 0
      const totalSnaps = snaps?.length || 0
      const totalUpvotes = messages?.reduce((sum, m) => sum + m.upvotes, 0) || 0
      const totalDownvotes = messages?.reduce((sum, m) => sum + m.downvotes, 0) || 0

      const score = totalUpvotes - totalDownvotes + totalMessages * 2
      const rank = Math.max(1, Math.floor(10000 / (score + 1)))

      setStats({ totalMessages, totalSnaps, totalUpvotes, totalDownvotes, rank })
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast('Failed to load stats', 'error')
    } finally {
      setLoading(false)
    }
  }, [deviceId, toast])

  const loadAchievements = useCallback(() => {
    if (typeof window !== 'undefined' && deviceId) {
      const earned = Object.entries(ACHIEVEMENT_BADGES).filter(([key]) => {
        return localStorage.getItem(`achievement_${deviceId}_${key}`) === 'true'
      })
      setEarnedAchievements(earned)
    }
  }, [deviceId])

  const handleUpdateUsername = useCallback(async () => {
    if (!newUsername.trim() || newUsername.length < 3) {
      toast('Username must be at least 3 characters', 'error')
      return
    }

    if (newUsername.length > 20) {
      toast('Username must be less than 20 characters', 'error')
      return
    }

    try {
      // Check if username is already taken
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('username', newUsername)
        .single()

      if (existing) {
        toast('Username already taken', 'error')
        return
      }

      // Update username
      const { error } = await supabase
        .from('user_profiles')
        .update({ username: newUsername })
        .eq('device_id', deviceId)

      if (error) throw error

      setUsername(newUsername)
      setIsEditingUsername(false)
      setNewUsername('')
      toast('Username updated!', 'success')
      
      // Also update localStorage backup
      localStorage.setItem(`username_${deviceId}`, newUsername)
    } catch (error) {
      console.error('Username update error:', error)
      toast('Failed to update username', 'error')
    }
  }, [newUsername, deviceId, toast])

  return (
    <>
      {/* Profile Button - BOTTOM LEFT */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 left-6 z-[40] bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-3 rounded-full shadow-xl hover:shadow-blue-500/50 transition-all side-panel"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Open profile"
          >
            <User className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Profile Panel - PROFESSIONAL */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -400, opacity: 0 }}
            animate={{ 
              x: 0, 
              opacity: 1,
              width: isMinimized ? '60px' : '340px'
            }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 h-full bg-gray-900 border-r-2 border-blue-600 shadow-2xl z-[55] overflow-hidden flex flex-col profile-panel"
          >
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {!isMinimized && (
                    <>
                      <h2 className="font-bold text-white text-base flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Your Profile
                      </h2>
                      <p className="text-white/90 text-xs font-medium mt-0.5">{username}</p>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    aria-label={isMinimized ? 'Maximize' : 'Minimize'}
                  >
                    {isMinimized ? <Maximize2 className="w-4 h-4 text-white" /> : <Minimize2 className="w-4 h-4 text-white" />}
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)} 
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    aria-label="Close profile"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </header>

            {!isMinimized && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <>
                    {/* Username Edit */}
                    <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
                      {isEditingUsername ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="Enter new username"
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            maxLength={20}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleUpdateUsername}
                              className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setIsEditingUsername(false)
                                setNewUsername('')
                              }}
                              className="flex-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm font-bold">{username}</p>
                            <p className="text-gray-500 text-xs">Anonymous Explorer</p>
                          </div>
                          <button
                            onClick={() => setIsEditingUsername(true)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            aria-label="Edit username"
                          >
                            <Edit2 className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Stats Grid - COMPACT */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                        <MapPin className="w-4 h-4 text-blue-400 mb-1" aria-hidden="true" />
                        <p className="text-2xl font-bold text-white">{stats.totalMessages}</p>
                        <p className="text-gray-400 text-xs">Messages</p>
                      </div>

                      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                        <TrendingUp className="w-4 h-4 text-green-400 mb-1" aria-hidden="true" />
                        <p className="text-2xl font-bold text-green-400">{stats.totalUpvotes}</p>
                        <p className="text-gray-400 text-xs">Upvotes</p>
                      </div>

                      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                        <Trophy className="w-4 h-4 text-yellow-400 mb-1" aria-hidden="true" />
                        <p className="text-2xl font-bold text-yellow-400">#{stats.rank}</p>
                        <p className="text-gray-400 text-xs">Rank</p>
                      </div>

                      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                        <Globe className="w-4 h-4 text-purple-400 mb-1" aria-hidden="true" />
                        <p className="text-2xl font-bold text-purple-400">{streak.countriesVisited.length}</p>
                        <p className="text-gray-400 text-xs">Countries</p>
                      </div>
                    </div>

                    {/* Snaps Count */}
                    {stats.totalSnaps > 0 && (
                      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">📸</span>
                          <div>
                            <p className="text-white text-sm font-bold">{stats.totalSnaps} Snaps Posted</p>
                            <p className="text-gray-400 text-xs">Keep sharing moments!</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Streak - COMPACT */}
                    <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm font-bold">🔥 {streak.currentStreak} Day Streak</p>
                          <p className="text-gray-400 text-xs">Longest: {streak.longestStreak} days</p>
                        </div>
                      </div>
                    </div>

                    {/* Achievements - COMPACT */}
                    <div>
                      <h3 className="text-white text-sm font-bold mb-2 flex items-center gap-1">
                        <Award className="w-4 h-4" aria-hidden="true" />
                        Achievements ({earnedAchievements.length}/{Object.keys(ACHIEVEMENT_BADGES).length})
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(ACHIEVEMENT_BADGES).slice(0, 6).map(([key, badge]) => {
                          const isEarned = earnedAchievements.some(([k]) => k === key)
                          
                          return (
                            <div
                              key={key}
                              className={`p-2 rounded-lg border transition-all ${
                                isEarned
                                  ? `bg-gradient-to-br ${badge.color} border-transparent`
                                  : 'bg-gray-800 border-gray-700 opacity-40'
                              }`}
                              title={badge.description}
                            >
                              <div className="text-2xl mb-1" aria-hidden="true">{badge.icon}</div>
                              <p className="text-white text-xs font-bold truncate">{badge.name}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Privacy Notice */}
                    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                      <p className="text-gray-400 text-xs leading-relaxed">
                        🔒 Your privacy matters. Only your username is visible to others. Device ID is stored securely for admin monitoring.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}

export default memo(ProfilePanel)
