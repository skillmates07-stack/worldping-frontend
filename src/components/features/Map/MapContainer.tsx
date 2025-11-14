'use client'

import { useState, useRef } from 'react'
import Map, { NavigationControl, GeolocateControl, Marker } from 'react-map-gl/maplibre'
import { motion } from 'framer-motion'
import 'maplibre-gl/dist/maplibre-gl.css'
import MessageModal from '@/components/features/DropMessage/MessageModal'
import TeleportButton from '@/components/features/Teleport/TeleportButton'
import LockedMarker from './LockedMarker'
import { useMessages } from '@/hooks/useMessages'
import { useDeviceId } from '@/hooks/useDeviceId'
import toast from 'react-hot-toast'

export default function MapContainer() {
  const mapRef = useRef<any>(null)
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 20,
    zoom: 2
  })

  const [modalState, setModalState] = useState<{
    isOpen: boolean
    lat: number
    lng: number
  }>({
    isOpen: false,
    lat: 0,
    lng: 0
  })

  const { messages, refetch, isMessageUnlocked, userMessageCount } = useMessages()
  const deviceId = useDeviceId()

  const handleMapClick = (e: any) => {
    const { lng, lat } = e.lngLat
    setModalState({
      isOpen: true,
      lat,
      lng
    })
  }

  const handleCloseModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }))
  }

  const handleMessageSuccess = () => {
    refetch()
  }

  const handleTeleport = (lat: number, lng: number, cityName: string) => {
    // Smooth fly animation to random city
    setViewState({
      longitude: lng,
      latitude: lat,
      zoom: 12
    })
  }

  const handleLockedMarkerClick = (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (message) {
      toast((t) => (
        <div className="flex flex-col gap-2">
          <p className="font-semibold">🔒 Message Locked</p>
          <p className="text-sm text-gray-300">
            Drop your first message to unlock messages worldwide!
          </p>
          <button
            onClick={() => {
              toast.dismiss(t.id)
              setModalState({
                isOpen: true,
                lat: message.latitude,
                lng: message.longitude
              })
            }}
            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
          >
            Drop Message Here
          </button>
        </div>
      ), {
        duration: 5000,
        style: { maxWidth: '320px' }
      })
    }
  }

  return (
    <>
      <Map
        {...viewState}
        ref={mapRef}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        style={{ width: '100%', height: '100%' }}
        onClick={handleMapClick}
        attributionControl={false}
      >
        {/* Navigation Controls */}
        <NavigationControl position="top-right" showCompass={false} />
        <GeolocateControl
          position="top-right"
          trackUserLocation
          positionOptions={{ enableHighAccuracy: true }}
          showUserLocation={true}
        />

        {/* Message Markers */}
        {messages.map((message) => {
          const isUnlocked = isMessageUnlocked(message.id)
          const isOwnMessage = message.device_id === deviceId

          return (
            <Marker
              key={message.id}
              longitude={message.longitude}
              latitude={message.latitude}
              anchor="bottom"
            >
              {isUnlocked || isOwnMessage ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative cursor-pointer group"
                >
                  {/* Message Pin */}
                  <div className={`w-10 h-10 ${
                    isOwnMessage 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                      : 'bg-gradient-to-br from-blue-500 to-blue-600'
                  } rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xl transition-all duration-200`}>
                    {message.emoji || '💬'}
                  </div>

                  {/* Pin Tail */}
                  <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-white"></div>

                  {/* Vote Score Badge */}
                  {(message.upvotes - message.downvotes) > 0 && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-md min-w-[20px] text-center">
                      {message.upvotes - message.downvotes}
                    </div>
                  )}

                  {/* Own Message Indicator */}
                  {isOwnMessage && (
                    <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-0.5 shadow-md">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  {/* Pulse for new messages */}
                  {new Date(message.created_at).getTime() > Date.now() - 60000 && (
                    <div className="absolute inset-0 w-10 h-10 bg-blue-400 rounded-full animate-ping opacity-30"></div>
                  )}

                  {/* Quick Preview on Hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    <div className="bg-black/95 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap max-w-[200px] truncate border border-gray-700 shadow-xl">
                      {message.content}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <LockedMarker onClick={() => handleLockedMarkerClick(message.id)} />
              )}
            </Marker>
          )
        })}
      </Map>

      {/* Random Teleport Button - Top Left */}
      <div className="absolute top-4 left-4 z-30">
        <TeleportButton onTeleport={handleTeleport} />
      </div>

      {/* Message Creation Modal */}
      <MessageModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        latitude={modalState.lat}
        longitude={modalState.lng}
        onSuccess={handleMessageSuccess}
      />

      {/* Floating Hint for First-Time Users */}
      {userMessageCount === 0 && messages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 z-30"
        >
          <span className="text-2xl">👆</span>
          <p className="text-sm font-medium">
            Tap the map to drop your first message!
          </p>
        </motion.div>
      )}
    </>
  )
}
