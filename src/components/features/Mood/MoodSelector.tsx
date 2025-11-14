'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Smile, X } from 'lucide-react'
import { MOODS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface MoodSelectorProps {
  selectedMood: string | null
  onSelectMood: (mood: string | null) => void
}

export default function MoodSelector({ selectedMood, onSelectMood }: MoodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedMoodData = MOODS.find(m => m.value === selectedMood)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl hover:border-blue-500 transition-colors w-full justify-between"
      >
        <div className="flex items-center gap-2">
          {selectedMoodData ? (
            <>
              <span className="text-2xl">{selectedMoodData.emoji}</span>
              <span className="text-white font-medium">{selectedMoodData.name}</span>
            </>
          ) : (
            <>
              <Smile className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400">How are you feeling?</span>
            </>
          )}
        </div>
        
        {selectedMood && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onSelectMood(null)
            }}
            className="p-1 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-10 overflow-hidden"
          >
            <div className="p-2 max-h-80 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {MOODS.map((mood) => (
                  <motion.button
                    key={mood.value}
                    type="button"
                    onClick={() => {
                      onSelectMood(mood.value)
                      setIsOpen(false)
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-all",
                      selectedMood === mood.value
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    )}
                    style={{
                      borderLeft: selectedMood === mood.value ? `4px solid ${mood.color}` : 'none'
                    }}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                    <span className="text-sm font-medium">{mood.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
