'use client'

import { motion } from 'framer-motion'
import { Lock, Sparkles } from 'lucide-react'

interface LockedMarkerProps {
  onClick?: () => void
}

export default function LockedMarker({ onClick }: LockedMarkerProps) {
  return (
    <motion.div 
      onClick={onClick}
      className="relative group cursor-pointer"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Blurred Message Pin */}
      <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full border-2 border-gray-600 shadow-lg flex items-center justify-center backdrop-blur-sm opacity-70 group-hover:opacity-90 transition-opacity">
        <span className="text-xl blur-sm">💬</span>
      </div>

      {/* Lock Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center border border-gray-700 shadow-md">
          <Lock className="w-3 h-3 text-gray-400" />
        </div>
      </div>

      {/* Animated Pulse */}
      <div className="absolute inset-0 w-10 h-10 bg-gray-500 rounded-full animate-ping opacity-20"></div>

      {/* Sparkle Effect */}
      <motion.div
        className="absolute -top-1 -right-1"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Sparkles className="w-3 h-3 text-yellow-400" />
      </motion.div>

      {/* Hover Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        <div className="bg-black/90 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap border border-gray-700 shadow-xl">
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span>Drop a message to unlock</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
