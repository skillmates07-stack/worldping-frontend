'use client'

import { useMessages } from '@/hooks/useMessages'
import MessageCard from './MessageCard'

export default function MessageFeed() {
  const { messages, loading, error } = useMessages()

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-brand-dark">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading messages...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-brand-dark p-4">
        <div className="text-center">
          <p className="text-red-400 mb-2">⚠️ Error loading messages</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-brand-dark overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-800 bg-brand-gray">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-2xl">💬</span>
          Recent Messages
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          {messages.length} active {messages.length === 1 ? 'message' : 'messages'}
        </p>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-3">🌍</p>
            <p className="font-medium">No messages yet</p>
            <p className="text-sm mt-1">Be the first to drop a message!</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageCard key={message.id} message={message} />
          ))
        )}
      </div>
    </div>
  )
}
