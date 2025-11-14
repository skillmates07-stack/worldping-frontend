'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { MOODS } from '@/lib/constants'
import { useMessages } from '@/hooks/useMessages'

export default function MoodHeatmap() {
  const [showMoodMap, setShowMoodMap] = useState(false)
  const { messages } = useMessages()

  // Count messages by mood
  const moodCounts = MOODS.reduce((acc, mood) => {
    acc[mood.value] = messages.filter(m => m.mood === mood.value).length
    return acc
  }, {} as Record<string, number>)

  const topMood = Object.entries(moodCounts)
    .sort(([, a], [, b]) => b - a)[0]

  const topMoodData = MOODS.find(m => m.value === topMood?.[0])

  return (
    <div className="absolute bottom-24 right-4 z-30">
      {/* Toggle Button */}
      <motion.button
        onClick={() => setShowMoodMap(!showMoodMap)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 font-medium"
      >
        {showMoodMap ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        <span>Mood Map</span>
        {topMoodData && (
          <span className="text-xl ml-1">{topMoodData.emoji}</span>
        )}
      </motion.button>

      {/* Mood Panel */}
      <AnimatePresence>
        {showMoodMap && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-full mb-4 right-0 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-2xl p-5 shadow-2xl w-80"
          >
            <h3 className="font-bold text-xl mb-4 gradient-text">
              🌍 World Mood
            </h3>

            <div className="space-y-3">
              {MOODS.map((mood) => {
                const count = moodCounts[mood.value] || 0
                const maxCount = Math.max(...Object.values(moodCounts))
                const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0

                return (
                  <div key={mood.value} className="relative">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{mood.emoji}</span>
                        <span className="text-sm font-medium text-white">{mood.name}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-400">{count}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: mood.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {topMoodData && (
              <div className="mt-5 pt-4 border-t border-gray-700">
                <p className="text-xs text-center text-gray-400">
                  <span className="text-2xl mr-1">{topMoodData.emoji}</span>
                  <span className="font-semibold" style={{ color: topMoodData.color }}>
                    {topMoodData.name}
                  </span>
                  {' '}is the dominant mood right now
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
