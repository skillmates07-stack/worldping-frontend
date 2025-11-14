'use client'

import { motion } from 'framer-motion'
import { MessageSquare } from 'lucide-react'

interface CityChatButtonProps {
  onClick: () => void
}

export default function CityChatButton({ onClick }: CityChatButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 font-medium hover:shadow-xl transition-all"
    >
      <MessageSquare className="w-5 h-5" />
      <span>City Chat</span>
    </motion.button>
  )
}
