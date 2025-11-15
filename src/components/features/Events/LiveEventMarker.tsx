'use client'

import { motion } from 'framer-motion'
import { Music, Megaphone, PartyPopper, Heart, Zap } from 'lucide-react'

interface LiveEventMarkerProps {
  event: {
    id: string
    type: 'concert' | 'protest' | 'celebration' | 'emergency' | 'other'
    title: string
    description: string
  }
  onClick: () => void
}

const eventIcons = {
  concert: { icon: Music, color: 'from-purple-500 to-pink-500', emoji: '🎵' },
  protest: { icon: Megaphone, color: 'from-red-500 to-orange-500', emoji: '📢' },
  celebration: { icon: PartyPopper, color: 'from-yellow-500 to-orange-500', emoji: '🎉' },
  emergency: { icon: Zap, color: 'from-red-600 to-red-500', emoji: '⚠️' },
  other: { icon: Heart, color: 'from-blue-500 to-cyan-500', emoji: '💫' }
}

export default function LiveEventMarker({ event, onClick }: LiveEventMarkerProps) {
  const eventConfig = eventIcons[event.type]
  const Icon = eventConfig.icon

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="relative cursor-pointer group"
    >
      {/* Pulsing Background */}
      <div className="absolute inset-0 w-14 h-14">
        <div className={`absolute inset-0 bg-gradient-to-r ${eventConfig.color} rounded-full animate-ping opacity-40`}></div>
        <div className={`absolute inset-0 bg-gradient-to-r ${eventConfig.color} rounded-full animate-pulse opacity-60`}></div>
      </div>

      {/* Main Event Pin */}
      <div className={`relative w-14 h-14 bg-gradient-to-br ${eventConfig.color} rounded-full border-4 border-white shadow-2xl flex items-center justify-center z-10`}>
        <span className="text-2xl">{eventConfig.emoji}</span>
      </div>

      {/* Pin Tail */}
      <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white z-0"></div>

      {/* Live Badge */}
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-white"
      >
        LIVE
      </motion.div>

      {/* Hover Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        <div className="bg-black/95 text-white rounded-xl p-3 shadow-2xl border border-gray-700 min-w-[200px]">
          <div className="flex items-center gap-2 mb-1">
            <Icon className="w-4 h-4" />
            <span className="font-bold text-sm">{event.title}</span>
          </div>
          <p className="text-xs text-gray-300">{event.description}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-red-400">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>Happening now</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
