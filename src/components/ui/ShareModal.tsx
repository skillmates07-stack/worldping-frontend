// UI share modal: Next.js/React (add to src/components/ui/ShareModal.tsx)
'use client'

import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Twitter, Share2, Copy, Send, MessageCircle, Whatsapp } from 'lucide-react'
import toast from 'react-hot-toast'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  shareTitle: string
  shareText: string
  shareUrl: string
}

export default function ShareModal({ isOpen, onClose, shareTitle, shareText, shareUrl }: ShareModalProps) {
  const urlRef = useRef<HTMLInputElement>(null)

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    toast.success('Link copied!')
    urlRef.current?.select()
  }
  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank')
  }
  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
  }
  const shareSystem = () => {
    if (navigator.share) {
      navigator.share({ title: shareTitle, text: shareText, url: shareUrl })
        .catch(() => { })
    } else {
      handleCopy()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center modal-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 modal-content flex flex-col gap-4"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-lg text-white flex items-center gap-2">
              <Share2 className="w-5 h-5" /> Share
            </span>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <p className="text-gray-300 text-sm mb-1">{shareText}</p>
          <div className="flex items-center gap-2 rounded border border-gray-700 bg-gray-800 px-3">
            <input ref={urlRef}
              value={shareUrl}
              readOnly
              className="bg-transparent text-white flex-1 py-2 outline-none"
              onClick={() => urlRef.current?.select()}
            />
            <button type="button" onClick={handleCopy} className="p-1 hover:bg-gray-700 rounded">
              <Copy className="w-5 h-5 text-gray-300" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2 pt-2">
            <button
              onClick={shareToTwitter}
              className="p-3 rounded-xl flex flex-col items-center hover:bg-blue-500 transition text-blue-500 hover:text-white"
            >
              <Twitter className="w-5 h-5" />
              <span className="text-xs font-bold">Twitter</span>
            </button>
            <button
              onClick={shareToWhatsApp}
              className="p-3 rounded-xl flex flex-col items-center hover:bg-green-500 transition text-green-500 hover:text-white"
            >
              <Whatsapp className="w-5 h-5" />
              <span className="text-xs font-bold">WhatsApp</span>
            </button>
            <button
              onClick={shareSystem}
              className="p-3 rounded-xl flex flex-col items-center hover:bg-gray-700 transition text-gray-300"
            >
              <Send className="w-5 h-5" />
              <span className="text-xs font-bold">Share</span>
            </button>
            <button
              onClick={handleCopy}
              className="p-3 rounded-xl flex flex-col items-center hover:bg-gray-700 transition text-gray-300"
            >
              <Copy className="w-5 h-5" />
              <span className="text-xs font-bold">Copy</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
