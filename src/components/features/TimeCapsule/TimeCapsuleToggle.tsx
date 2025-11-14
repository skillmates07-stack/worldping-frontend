'use client'

import { motion } from 'framer-motion'
import { Lock, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimeCapsuleToggleProps {
  isTimeCapsule: boolean
  onToggle: (value: boolean) => void
}

export default function TimeCapsuleToggle({ isTimeCapsule, onToggle }: TimeCapsuleToggleProps) {
  return (
    <motion.button
      type="button"
      onClick={() => onToggle(!isTimeCapsule)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3",
        isTimeCapsule
          ? "bg-purple-500/10 border-purple-500"
          : "bg-gray-800 border-gray-700 hover:border-gray-600"
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
        isTimeCapsule
          ? "bg-purple-500 text-white"
          : "bg-gray-700 text-gray-400"
      )}>
        {isTimeCapsule ? (
          <Lock className="w-6 h-6" />
        ) : (
          <Clock className="w-6 h-6" />
        )}
      </div>

      <div className="flex-1 text-left">
        <h4 className="font-semibold text-white mb-1">
          {isTimeCapsule ? '🔒 Time Capsule Mode' : '⚡ Instant Message'}
        </h4>
        <p className="text-xs text-gray-400">
          {isTimeCapsule 
            ? 'Unlocks in 24 hours. Creates mystery & anticipation!'
            : 'Visible immediately to everyone'
          }
        </p>
      </div>

      {/* Toggle Switch */}
      <div className={cn(
        "w-12 h-6 rounded-full transition-colors relative",
        isTimeCapsule ? "bg-purple-500" : "bg-gray-600"
      )}>
        <motion.div
          className="w-5 h-5 bg-white rounded-full absolute top-0.5"
          animate={{ left: isTimeCapsule ? '24px' : '2px' }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
    </motion.button>
  )
}
