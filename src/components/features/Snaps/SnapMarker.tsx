'use client'

import { motion } from 'framer-motion'
import { Camera } from 'lucide-react'

interface SnapMarkerProps {
  hasViewed?: boolean
  onClick: () => void
}

export default function SnapMarker({ hasViewed = false, onClick }: SnapMarkerProps) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative cursor-pointer group"
    >
      {/* Story Ring (gradient border) */}
      <div className={`w-16 h-16 rounded-full p-1 ${
        hasViewed 
          ? 'bg-gray-600' 
          : 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 animate-pulse'
      }`}>
        <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center border-2 border-gray-900">
          <Camera className={`w-7 h-7 ${hasViewed ? 'text-gray-500' : 'text-white'}`} />
        </div>
      </div>

      {/* Pulsing effect for new snaps */}
      {!hasViewed && (
        <div className="absolute inset-0 w-16 h-16 rounded-full bg-purple-500/30 animate-ping"></div>
      )}

      {/* Pin tail */}
      <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white z-0"></div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        <div className="bg-black/95 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap border border-gray-700 shadow-xl">
          📸 View Snap
        </div>
      </div>
    </motion.div>
  )
}
