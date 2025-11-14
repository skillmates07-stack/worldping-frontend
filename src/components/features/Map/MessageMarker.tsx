'use client'

import { Marker, Popup } from 'react-map-gl/maplibre'
import { useState } from 'react'
import type { Message } from '@/lib/supabase/client'

interface MessageMarkersProps {
  messages: Message[]
  onMessageClick?: (message: Message) => void
}

export default function MessageMarkers({ messages, onMessageClick }: MessageMarkersProps) {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  return (
    <>
      {messages.map((message) => (
        <Marker
          key={message.id}
          longitude={message.longitude}
          latitude={message.latitude}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation()
            setSelectedMessage(message)
            onMessageClick?.(message)
          }}
        >
          <div className="group cursor-pointer">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full border-3 border-white shadow-lg group-hover:scale-110 transition-transform duration-200 flex items-center justify-center">
                <span className="text-xl">
                  {message.emoji || '💬'}
                </span>
              </div>
              
              <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white"></div>
              
              <div className="absolute inset-0 w-10 h-10 bg-blue-400 rounded-full animate-ping opacity-20"></div>
              
              {(message.upvotes - message.downvotes) > 0 && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                  {message.upvotes - message.downvotes}
                </div>
              )}
            </div>
          </div>
        </Marker>
      ))}

      {selectedMessage && (
        <Popup
          longitude={selectedMessage.longitude}
          latitude={selectedMessage.latitude}
          anchor="top"
          onClose={() => setSelectedMessage(null)}
          closeOnClick={false}
          className="message-popup"
        >
          <div className="p-3 min-w-[200px] max-w-[300px]">
            <div className="flex items-start gap-2 mb-2">
              {selectedMessage.emoji && (
                <span className="text-2xl">{selectedMessage.emoji}</span>
              )}
              <p className="text-sm text-gray-800 flex-1">{selectedMessage.content}</p>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
              <span>{new Date(selectedMessage.created_at).toLocaleDateString()}</span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  👍 {selectedMessage.upvotes}
                </span>
                <span className="flex items-center gap-1">
                  👎 {selectedMessage.downvotes}
                </span>
              </div>
            </div>
          </div>
        </Popup>
      )}
    </>
  )
}
