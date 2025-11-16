'use client'

import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Twitter, Share2, Copy, Send } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  shareTitle: string
  shareText: string
  shareUrl: string
}

export default function ShareModal({ isOpen, onClose, shareTitle, shareText, shareUrl }: ShareModalProps) {
  const toast = useToast()
  const urlRef = useRef<HTMLInputElement>(null)

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    toast('Link copied!', 'success')
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
        .catch(() => {})
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
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center modal-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 modal-content flex flex-col gap-4 border-2 border-gray-800"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-lg text-white flex items-center gap-2">
              <Share2 className="w-5 h-5" /> Share
            </span>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <p className="text-gray-300 text-sm mb-1">{shareText}</p>

          <div className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3">
            <input 
              ref={urlRef}
              value={shareUrl}
              readOnly
              className="bg-transparent text-white flex-1 py-2 outline-none text-sm"
              onClick={() => urlRef.current?.select()}
            />
            <button 
              type="button" 
              onClick={handleCopy} 
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              <Copy className="w-5 h-5 text-gray-300" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2">
            <button
              onClick={shareToTwitter}
              className="p-3 rounded-xl flex flex-col items-center bg-gray-800 hover:bg-blue-500 transition text-blue-400 hover:text-white"
            >
              <Twitter className="w-6 h-6" />
              <span className="text-xs font-bold mt-1">Twitter</span>
            </button>

            <button
              onClick={shareToWhatsApp}
              className="p-3 rounded-xl flex flex-col items-center bg-gray-800 hover:bg-green-500 transition text-green-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span className="text-xs font-bold mt-1">WhatsApp</span>
            </button>

            <button
              onClick={shareSystem}
              className="p-3 rounded-xl flex flex-col items-center bg-gray-800 hover:bg-gray-700 transition text-gray-300"
            >
              <Send className="w-6 h-6" />
              <span className="text-xs font-bold mt-1">Share</span>
            </button>

            <button
              onClick={handleCopy}
              className="p-3 rounded-xl flex flex-col items-center bg-gray-800 hover:bg-gray-700 transition text-gray-300"
            >
              <Copy className="w-6 h-6" />
              <span className="text-xs font-bold mt-1">Copy</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
