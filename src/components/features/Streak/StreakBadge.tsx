'use client'

import { useStreak } from '@/hooks/useStreak'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Trophy, Globe, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

export default function StreakBadge() {
  const { streak, loading } = useStreak()
  const [isExpanded, setIsExpanded] = useState(false)

  if (loading || streak.currentStreak === 0) return null

  return (
    <div className="fixed top-20 right-4 z-40">
      {/* Collapsed Badge */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-bold group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Flame className="w-5 h-5 group-hover:animate-pulse" />
        <span>{streak.currentStreak}</span>
      </motion.button>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-14 right-0 w-80 glass-dark rounded-xl p-5 shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-xl mb-4 flex items-center gap-2 gradient-text">
              <Flame className="w-6 h-6" />
              Your Streak
            </h3>
            
            {/* Stats Grid */}
            <div className="space-y-3">
              {/* Current Streak */}
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Current Streak</span>
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-400" />
                    <span className="text-orange-400 font-bold text-2xl">
                      {streak.currentStreak}
                    </span>
                  </div>
                </div>
              </div>

              {/* Longest Streak */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Longest Streak</span>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 font-bold text-xl">
                      {streak.longestStreak}
                    </span>
                  </div>
                </div>
              </div>

              {/* Countries */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-sm flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Countries Visited
                  </span>
                  <Badge variant="info">{streak.countriesVisited.length}</Badge>
                </div>
                
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {streak.countriesVisited.slice(0, 8).map((country, i) => (
                    <span 
                      key={i} 
                      className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-md"
                    >
                      {country}
                    </span>
                  ))}
                  {streak.countriesVisited.length > 8 && (
                    <span className="text-gray-500 text-xs px-2 py-1">
                      +{streak.countriesVisited.length - 8} more
                    </span>
                  )}
                </div>
              </div>

              {/* Messages Count */}
              <div className="flex justify-between text-sm pt-2 border-t border-gray-700">
                <span className="text-gray-400">Total Messages</span>
                <span className="text-white font-semibold">{streak.totalMessages}</span>
              </div>
            </div>

            {/* Motivational Message */}
            <div className="mt-4 pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-400 text-center">
                💡 Drop a message every day to keep your streak alive!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
