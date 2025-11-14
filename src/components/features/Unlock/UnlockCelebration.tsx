'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Gift, Star } from 'lucide-react'

interface UnlockCelebrationProps {
  count: number
  onClose: () => void
}

export default function UnlockCelebration({ count, onClose }: UnlockCelebrationProps) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
      setTimeout(onClose, 300)
    }, 3500)
    
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 20 
            }}
            className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl"
          >
            {/* Floating particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{ 
                  x: 0, 
                  y: 0, 
                  opacity: 1 
                }}
                animate={{
                  x: (Math.random() - 0.5) * 200,
                  y: (Math.random() - 0.5) * 200,
                  opacity: 0
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
                style={{
                  left: '50%',
                  top: '50%'
                }}
              >
                {i % 3 === 0 ? (
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                ) : i % 3 === 1 ? (
                  <Star className="w-3 h-3 text-white" />
                ) : (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </motion.div>
            ))}

            {/* Main content */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatDelay: 0.5
              }}
            >
              <Gift className="w-20 h-20 mx-auto mb-4 text-white" />
            </motion.div>

            <h2 className="text-4xl font-bold text-white mb-3">
              Unlocked!
            </h2>
            
            <p className="text-white text-lg mb-2">
              You discovered <span className="font-bold text-yellow-300 text-2xl">{count}</span> messages
            </p>
            
            <p className="text-white/80 text-sm mb-4">
              from around the world! 🌍
            </p>

            <div className="flex justify-center gap-3 text-3xl">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.3 }}
              >
                💬
              </motion.span>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.1 }}
              >
                ✨
              </motion.span>
              <motion.span
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.2 }}
              >
                🎉
              </motion.span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
