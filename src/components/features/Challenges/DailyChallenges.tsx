'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Target, CheckCircle2, Circle, X } from 'lucide-react'
import { useDeviceId } from '@/hooks/useDeviceId'

interface Challenge {
  id: string
  title: string
  description: string
  icon: string
  progress: number
  target: number
  completed: boolean
}

export default function DailyChallenges() {
  const [isOpen, setIsOpen] = useState(false)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const deviceId = useDeviceId()

  useEffect(() => {
    if (deviceId) {
      loadChallenges()
    }
  }, [deviceId])

  function loadChallenges() {
    const today = new Date().toDateString()
    const stored = localStorage.getItem(`challenges_${deviceId}_${today}`)
    
    if (stored) {
      setChallenges(JSON.parse(stored))
    } else {
      const defaultChallenges: Challenge[] = [
        {
          id: '1',
          title: 'World Explorer',
          description: 'Drop messages in 3 different countries',
          icon: '🌍',
          progress: 0,
          target: 3,
          completed: false
        },
        {
          id: '2',
          title: 'Social Butterfly',
          description: 'Receive 5 upvotes on your messages',
          icon: '👍',
          progress: 0,
          target: 5,
          completed: false
        },
        {
          id: '3',
          title: 'Time Traveler',
          description: 'Create 1 time capsule',
          icon: '⏰',
          progress: 0,
          target: 1,
          completed: false
        },
        {
          id: '4',
          title: 'Mood Master',
          description: 'Post messages with 3 different moods',
          icon: '🎭',
          progress: 0,
          target: 3,
          completed: false
        },
        {
          id: '5',
          title: 'Teleporter',
          description: 'Use Random Teleport 5 times',
          icon: '✨',
          progress: 0,
          target: 5,
          completed: false
        }
      ]
      setChallenges(defaultChallenges)
      localStorage.setItem(`challenges_${deviceId}_${today}`, JSON.stringify(defaultChallenges))
    }
  }

  const completedCount = challenges.filter(c => c.completed).length
  const totalCount = challenges.length

  return (
    <>
      {/* Floating Button */}
      <div className="absolute top-24 right-4 z-30">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 font-medium relative"
        >
          <Trophy className="w-5 h-5" />
          <span className="hidden sm:inline">Challenges</span>
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {completedCount}/{totalCount}
          </span>
        </motion.button>
      </div>

      {/* Challenges Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-gray-900 border-l border-gray-800 shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-yellow-600 to-orange-600 p-4 flex items-center justify-between z-10">
              <div>
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Daily Challenges
                </h3>
                <p className="text-white/80 text-xs mt-1">
                  Complete all for bonus rewards!
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="p-4 bg-gray-800/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Daily Progress</span>
                <span className="text-sm font-bold text-white">
                  {completedCount}/{totalCount}
                </span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedCount / totalCount) * 100}%` }}
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                />
              </div>
            </div>

            {/* Challenges List */}
            <div className="p-4 space-y-3">
              {challenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    challenge.completed
                      ? 'bg-green-500/10 border-green-500'
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{challenge.icon}</div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white">{challenge.title}</h4>
                        {challenge.completed && (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mb-3">
                        {challenge.description}
                      </p>

                      {/* Progress */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                            className={`h-full ${
                              challenge.completed
                                ? 'bg-green-500'
                                : 'bg-gradient-to-r from-blue-500 to-purple-500'
                            }`}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-400">
                          {challenge.progress}/{challenge.target}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Completion Bonus */}
            {completedCount === totalCount && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="m-4 p-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl text-center"
              >
                <Trophy className="w-12 h-12 mx-auto mb-2 text-white" />
                <h4 className="font-bold text-white text-lg mb-1">
                  All Challenges Complete!
                </h4>
                <p className="text-white/90 text-sm">
                  🎉 You're a WorldPing Champion!
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
