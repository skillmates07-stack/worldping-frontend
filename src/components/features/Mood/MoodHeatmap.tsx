'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Smile, X, Heart, TrendingUp, Eye, EyeOff, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useDeviceId } from '@/hooks/useDeviceId'
import { useToast } from '@/components/ui/Toast'

const MOODS = [
  { id: 'happy', emoji: '😊', label: 'Happy', color: 'from-yellow-500 to-orange-500' },
  { id: 'excited', emoji: '🔥', label: 'Excited', color: 'from-orange-500 to-red-500' },
  { id: 'tired', emoji: '😴', label: 'Tired', color: 'from-blue-500 to-indigo-500' },
  { id: 'cool', emoji: '😎', label: 'Cool', color: 'from-cyan-500 to-blue-500' },
  { id: 'thoughtful', emoji: '🤔', label: 'Thoughtful', color: 'from-purple-500 to-pink-500' },
  { id: 'loving', emoji: '💖', label: 'Loving', color: 'from-pink-500 to-red-500' },
  { id: 'celebrating', emoji: '🎉', label: 'Celebrating', color: 'from-yellow-500 to-green-500' },
  { id: 'anxious', emoji: '😰', label: 'Anxious', color: 'from-gray-500 to-gray-600' }
]

const COOLDOWN_MINUTES = 5

function MoodHeatmap() {
  const toast = useToast()
  const deviceId = useDeviceId()
  
  const [isOpen, setIsOpen] = useState(false)
  const [showGlobalStats, setShowGlobalStats] = useState(false)
  const [moodCounts, setMoodCounts] = useState<Record<string, number>>({})
  const [userMood, setUserMood] = useState<string | null>(null)
  const [lastMoodChange, setLastMoodChange] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0)

  useEffect(() => {
    if (isOpen) {
      fetchMoodData()
      checkUserMood()
      loadLastMoodTimestamp()
    }
  }, [isOpen])

  // Cooldown timer
  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setInterval(() => {
        setCooldownRemaining(prev => Math.max(0, prev - 1))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [cooldownRemaining])

  const loadLastMoodTimestamp = useCallback(() => {
    if (!deviceId) return
    
    const timestampKey = `user_mood_timestamp_${deviceId}`
    const timestamp = localStorage.getItem(timestampKey)
    
    if (timestamp) {
      const lastChange = parseInt(timestamp)
      const now = Date.now()
      const timePassed = now - lastChange
      const cooldownMs = COOLDOWN_MINUTES * 60 * 1000
      
      if (timePassed < cooldownMs) {
        const remainingMs = cooldownMs - timePassed
        setCooldownRemaining(Math.ceil(remainingMs / 1000))
      }
      
      setLastMoodChange(lastChange)
    }
  }, [deviceId])

  const fetchMoodData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('mood')
        .not('mood', 'is', null)
        .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      if (error) throw error

      const counts: Record<string, number> = {}
      data?.forEach(msg => {
        if (msg.mood) counts[msg.mood] = (counts[msg.mood] || 0) + 1
      })
      setMoodCounts(counts)
    } catch (error) {
      console.error('Error fetching moods:', error)
    }
  }, [])

  const checkUserMood = useCallback(() => {
    if (!deviceId) return
    
    const moodKey = `user_mood_${deviceId}`
    const storedMood = localStorage.getItem(moodKey)
    if (storedMood) {
      setUserMood(storedMood)
    }
  }, [deviceId])

  const handleSetMood = useCallback(async (moodId: string) => {
    if (!deviceId) return
    
    // Check cooldown
    const now = Date.now()
    const cooldownMs = COOLDOWN_MINUTES * 60 * 1000
    
    if (now - lastMoodChange < cooldownMs && userMood) {
      const minutesLeft = Math.ceil((cooldownMs - (now - lastMoodChange)) / 60000)
      toast(`Wait ${minutesLeft} min before changing mood`, 'error')
      return
    }

    setLoading(true)
    try {
      // If changing from previous mood, decrement old count
      if (userMood && userMood !== moodId) {
        setMoodCounts(prev => ({
          ...prev,
          [userMood]: Math.max(0, (prev[userMood] || 0) - 1)
        }))
      }

      // Save to localStorage
      const moodKey = `user_mood_${deviceId}`
      const timestampKey = `user_mood_timestamp_${deviceId}`
      
      localStorage.setItem(moodKey, moodId)
      localStorage.setItem(timestampKey, now.toString())
      
      setUserMood(moodId)
      setLastMoodChange(now)
      
      // Start cooldown
      setCooldownRemaining(COOLDOWN_MINUTES * 60)

      // Update mood counts
      setMoodCounts(prev => ({
        ...prev,
        [moodId]: (prev[moodId] || 0) + 1
      }))

      const selectedMood = MOODS.find(m => m.id === moodId)
      toast(`${selectedMood?.emoji} Mood set to ${selectedMood?.label}!`, 'success')
    } catch (error) {
      console.error('Mood error:', error)
      toast('Failed to set mood', 'error')
    } finally {
      setLoading(false)
    }
  }, [deviceId, userMood, lastMoodChange, toast])

  const formatCooldown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const totalMoods = Object.values(moodCounts).reduce((a, b) => a + b, 0)
  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]
  const dominantMoodData = MOODS.find(m => m.id === dominantMood?.[0])

  return (
    <>
      {/* Floating Mood Button - COMPACT */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-24 z-[40] bg-gradient-to-r from-pink-600 to-rose-600 text-white p-3 rounded-full shadow-xl hover:shadow-pink-500/50 transition-all side-panel"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Open mood panel"
          >
            <Smile className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mood Panel - COMPACT & FULLY VISIBLE */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 w-80 max-h-[70vh] bg-gray-900 border-2 border-pink-600 rounded-2xl shadow-2xl z-[40] overflow-hidden flex flex-col side-panel"
          >
            {/* Header */}
            <header className="bg-gradient-to-r from-pink-600 to-rose-600 p-3 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-white text-base flex items-center gap-2">
                  <Smile className="w-5 h-5" />
                  World Mood
                </h2>
                <p className="text-white/80 text-xs">{totalMoods} people shared</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Close mood panel"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Dominant Mood */}
              {dominantMoodData && showGlobalStats && (
                <div className={`bg-gradient-to-r ${dominantMoodData.color} p-3 rounded-xl`}>
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <p className="text-xs font-medium opacity-90">Dominant Mood</p>
                      <p className="text-lg font-bold">{dominantMoodData.label}</p>
                    </div>
                    <span className="text-4xl" aria-hidden="true">{dominantMoodData.emoji}</span>
                  </div>
                </div>
              )}

              {/* Express Your Mood */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white text-sm font-bold flex items-center gap-1">
                    <Heart className="w-4 h-4" aria-hidden="true" />
                    How are you feeling?
                  </h3>
                  {cooldownRemaining > 0 && (
                    <div className="flex items-center gap-1 text-xs text-orange-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatCooldown(cooldownRemaining)}</span>
                    </div>
                  )}
                </div>

                {/* Current Mood Display */}
                {userMood && (
                  <div className="mb-2 p-2 bg-gray-800 rounded-lg border border-gray-700">
                    <p className="text-gray-400 text-xs mb-1">Your current mood:</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {MOODS.find(m => m.id === userMood)?.emoji}
                      </span>
                      <span className="text-white text-sm font-bold">
                        {MOODS.find(m => m.id === userMood)?.label}
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2">
                  {MOODS.map(mood => (
                    <motion.button
                      key={mood.id}
                      whileHover={{ scale: userMood === mood.id || cooldownRemaining > 0 ? 1 : 1.1 }}
                      whileTap={{ scale: userMood === mood.id || cooldownRemaining > 0 ? 1 : 0.95 }}
                      onClick={() => handleSetMood(mood.id)}
                      disabled={loading || cooldownRemaining > 0}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        userMood === mood.id
                          ? `bg-gradient-to-r ${mood.color} border-transparent shadow-lg`
                          : cooldownRemaining > 0
                          ? 'bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed'
                          : 'bg-gray-800 border-gray-700 hover:border-gray-600 hover:bg-gray-750'
                      }`}
                      title={mood.label}
                      aria-label={`Set mood to ${mood.label}`}
                    >
                      <div className="text-2xl" aria-hidden="true">{mood.emoji}</div>
                    </motion.button>
                  ))}
                </div>

                {cooldownRemaining > 0 && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    You can change your mood again in {formatCooldown(cooldownRemaining)}
                  </p>
                )}
              </div>

              {/* Toggle Global Stats */}
              <button
                onClick={() => setShowGlobalStats(!showGlobalStats)}
                className="w-full flex items-center justify-center gap-2 p-2 bg-gray-800 hover:bg-gray-750 rounded-lg transition-colors text-gray-400 hover:text-white text-sm"
              >
                {showGlobalStats ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showGlobalStats ? 'Hide' : 'Show'} Global Stats
              </button>

              {/* Mood Stats - COMPACT (Hidden by default) */}
              {showGlobalStats && (
                <div className="space-y-2">
                  <h3 className="text-white text-sm font-bold flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" aria-hidden="true" />
                    Live Stats (24h)
                  </h3>
                  {MOODS.map(mood => {
                    const count = moodCounts[mood.id] || 0
                    const percentage = totalMoods > 0 ? (count / totalMoods) * 100 : 0
                    
                    return (
                      <div key={mood.id} className="bg-gray-800 rounded-lg p-2">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg" aria-hidden="true">{mood.emoji}</span>
                            <span className="text-white text-xs font-medium">{mood.label}</span>
                          </div>
                          <span className="text-gray-400 text-xs">{count}</span>
                        </div>
                        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            className={`h-full bg-gradient-to-r ${mood.color}`}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}

export default memo(MoodHeatmap)
