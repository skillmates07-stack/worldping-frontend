'use client'

import { useStreak } from '@/hooks/useStreak'
import { useState } from 'react'

export default function StreakBadge() {
  const { streak } = useStreak()
  const [isExpanded, setIsExpanded] = useState(false)

  if (streak.currentStreak === 0) return null

  return (
    <div className="fixed top-20 right-4 z-40">
      {/* Collapsed Badge */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center gap-2 font-bold"
      >
        🔥 {streak.currentStreak}
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="absolute top-12 right-0 bg-brand-gray border border-gray-700 rounded-xl p-4 shadow-2xl w-64 animate-slideDown">
          <h3 className="font-bold text-lg mb-3 text-white">Your Streak</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Current Streak</span>
              <span className="text-orange-400 font-bold text-xl">
                🔥 {streak.currentStreak} days
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Longest Streak</span>
              <span className="text-yellow-400 font-bold">
                🏆 {streak.longestStreak} days
              </span>
            </div>

            <div className="pt-2 border-t border-gray-700">
              <span className="text-gray-400 text-sm block mb-2">Countries Visited</span>
              <div className="flex flex-wrap gap-1">
                {streak.countriesVisited.slice(0, 10).map((country, i) => (
                  <span key={i} className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded">
                    🌍 {country}
                  </span>
                ))}
                {streak.countriesVisited.length > 10 && (
                  <span className="text-gray-500 text-xs px-2 py-1">
                    +{streak.countriesVisited.length - 10} more
                  </span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-500">
                💡 Drop a message every day to maintain your streak!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
