'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, X, Smile, Frown, Meh, Heart, TrendingUp, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useDeviceId } from '@/hooks/useDeviceId'
import toast from 'react-hot-toast'

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

export default function MoodHeatmap() {
  const [isOpen, setIsOpen] = useState(false)
  const [moodCounts, setMoodCounts] = useState<Record<string, number>>({})
  const [userMood, setUserMood] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const deviceId = useDeviceId()

  useEffect(() => {
    if (isOpen) {
      fetchMoodData()
      checkUserMood()
    }
  }, [isOpen])

  async function fetchMoodData() {
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
  }

  async function checkUserMood() {
    if (!deviceId) return
    
    const moodKey = `user_mood_${deviceId}`
    const storedMood = localStorage.getItem(moodKey)
    if (storedMood) {
      setUserMood(storedMood)
    }
  }

  async function handleSetMood(moodId: string) {
    if (!deviceId) return

    setLoading(true)
    try {
      // Save to localStorage
      const moodKey = `user_mood_${deviceId}`
      localStorage.setItem(moodKey, moodId)
      setUserMood(moodId)

      // Update mood counts
      setMoodCounts(prev => ({
        ...prev,
        [moodId]: (prev[moodId] || 0) + 1
      }))

      const selectedMood = MOODS.find(m => m.id === moodId)
      toast.success(`${selectedMood?.emoji} Mood set to ${selectedMood?.label}!`)
    } catch (error) {
      toast.error('Failed to set mood')
    } finally {
      setLoading(false)
    }
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
          >
            <Smile className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mood Panel - COMPACT & FULLY VISIBLE */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 w-80 max-h-[70vh] bg-gray-900 border-2 border-pink-600 rounded-2xl shadow-2xl z-[40] overflow-hidden flex flex-col side-panel"
          >
            {/* Compact Header */}
            <div className="bg-gradient-to-r from-pink-600 to-rose-600 p-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Smile className="w-4 h-4" />
                  World Mood
                </h3>
                <p className="text-white/80 text-xs">{totalMoods} people shared</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Dominant Mood */}
              {dominantMoodData && (
                <div className={`bg-gradient-to-r ${dominantMoodData.color} p-3 rounded-xl`}>
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <p className="text-xs font-medium opacity-90">Dominant Mood</p>
                      <p className="text-lg font-bold">{dominantMoodData.label}</p>
                    </div>
                    <span className="text-4xl">{dominantMoodData.emoji}</span>
                  </div>
                </div>
              )}

              {/* Express Your Mood */}
              <div>
                <h4 className="text-white text-xs font-bold mb-2 flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  How are you feeling?
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {MOODS.map(mood => (
                    <motion.button
                      key={mood.id}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSetMood(mood.id)}
                      disabled={loading}
                      className={`p-2 rounded-xl border-2 transition-all ${
                        userMood === mood.id
                          ? `bg-gradient-to-r ${mood.color} border-transparent`
                          : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-2xl">{mood.emoji}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Mood Stats - COMPACT */}
              <div className="space-y-2">
                <h4 className="text-white text-xs font-bold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Live Stats
                </h4>
                {MOODS.map(mood => {
                  const count = moodCounts[mood.id] || 0
                  const percentage = totalMoods > 0 ? (count / totalMoods) * 100 : 0
                  
                  return (
                    <div key={mood.id} className="bg-gray-800 rounded-lg p-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{mood.emoji}</span>
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
