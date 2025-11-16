'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Map, { NavigationControl, GeolocateControl, Marker } from 'react-map-gl/maplibre'
import { motion, AnimatePresence } from 'framer-motion'
import 'maplibre-gl/dist/maplibre-gl.css'
import MessageModal from '@/components/features/DropMessage/MessageModal'
import TeleportButton from '@/components/features/Teleport/TeleportButton'
import MoodHeatmap from '@/components/features/Mood/MoodHeatmap'
import DailyChallenges from '@/components/features/Challenges/DailyChallenges'
import LiveEventMarker from '@/components/features/Events/LiveEventMarker'
import CreateEventModal from '@/components/features/Events/CreateEventModal'
import SnapMarker from '@/components/features/Snaps/SnapMarker'
import SnapViewerModal from '@/components/features/Snaps/SnapViewerModal'
import CreateSnapModal from '@/components/features/Snaps/CreateSnapModal'
import LockedMarker from './LockedMarker'
import { useMessages } from '@/hooks/useMessages'
import { useDeviceId } from '@/hooks/useDeviceId'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Plus, MapPinned, Camera, Zap } from 'lucide-react'

// Define strict EventType union
type EventType = 'concert' | 'protest' | 'celebration' | 'emergency' | 'other'

interface LiveEvent {
  id: string
  type: EventType  // Narrowed type
  title: string
  description: string
  latitude: number
  longitude: number
  media_url?: string | null
  created_at: string
}

// Helper to normalize event type from your API
function normalizeEventType(type: string): EventType {
  const knownTypes: EventType[] = ['concert', 'protest', 'celebration', 'emergency', 'other']
  if (knownTypes.includes(type as EventType)) {
    return type as EventType
  }
  return 'other'
}

export default function MapContainer() {
  const mapRef = useRef<any>(null)
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 20,
    zoom: 2
  })

  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

  const [modalState, setModalState] = useState<{ isOpen: boolean; lat: number; lng: number }>({ isOpen: false, lat: 0, lng: 0 })
  const [eventModalState, setEventModalState] = useState<{ isOpen: boolean; lat: number; lng: number }>({ isOpen: false, lat: 0, lng: 0 })

  const [snapModalOpen, setSnapModalOpen] = useState(false)
  const [selectedSnap, setSelectedSnap] = useState<any>(null)
  const [snaps, setSnaps] = useState<any[]>([])
  const [selectedEvent, setSelectedEvent] = useState<LiveEvent | null>(null)
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([])

  const { messages, refetch, isMessageUnlocked, userMessageCount } = useMessages()
  const deviceId = useDeviceId()

  useEffect(() => {
    getUserLocation()
  }, [])

  useEffect(() => {
    fetchLiveEvents()
    const unsubscribeLiveEvents = subscribeToLiveEvents()
    return unsubscribeLiveEvents
  }, [])

  useEffect(() => {
    fetchSnaps()
    const unsubscribeSnaps = subscribeToSnaps()
    return unsubscribeSnaps
  }, [])

  async function getUserLocation() {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported')
      toast.error('📍 Location not supported on this device')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setViewState({ longitude, latitude, zoom: 12 })
        toast.success('📍 Location detected!', { duration: 2000 })
      },
      (error) => {
        console.error('Location error:', error)
        setLocationError(error.message)
        toast.error('📍 Please enable location access')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  async function fetchLiveEvents() {
    try {
      const { data, error } = await supabase
        .from('live_events')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      setLiveEvents(data?.map(evt => ({
        ...evt,
        type: normalizeEventType(evt.type) // normalize type here
      })) || [])
    } catch (error) {
      console.error('Error fetching live events:', error)
    }
  }

  function subscribeToLiveEvents() {
    const channel = supabase
      .channel('live-events')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_events' }, (payload) => {
        const normalizedEvent = { ...payload.new as LiveEvent, type: normalizeEventType(payload.new.type) }
        setLiveEvents(prev => [normalizedEvent, ...prev])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }

  async function fetchSnaps() {
    try {
      const { data, error } = await supabase
        .from('snaps')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
      if (error) throw error
      setSnaps(data || [])
    } catch (error) {
      console.error('Error fetching snaps:', error)
    }
  }

  function subscribeToSnaps() {
    const channel = supabase
      .channel('snaps-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'snaps' }, (payload) =>
        setSnaps(prev => [payload.new as any, ...prev])
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }

  const handleMessageClick = (message: any) => {
    const isUnlocked = isMessageUnlocked(message.id)
    const isOwnMessage = message.device_id === deviceId

    if (isUnlocked || isOwnMessage) {
      toast((t) => (
        <div className="flex flex-col gap-2 max-w-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{message.emoji || '💬'}</span>
            <p className="font-bold text-white">{message.content}</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>👍 {message.upvotes}</span>
            <span>💬 {message.reply_count || 0} replies</span>
          </div>
          {isOwnMessage && <span className="text-xs text-green-400">✓ Your message</span>}
        </div>
      ), { duration: 5000 })
    }
  }

  const handlePostAtMyLocation = () => {
    if (!userLocation) {
      toast.error('📍 Location not available. Please enable GPS.')
      getUserLocation()
      return
    }
    setModalState({ isOpen: true, lat: userLocation.lat, lng: userLocation.lng })
  }

  const handlePostSnapAtMyLocation = () => {
    if (!userLocation) {
      toast.error('📍 Enable location to post snaps')
      getUserLocation()
      return
    }
    setSnapModalOpen(true)
  }

  const handleCloseModal = () => setModalState(prev => ({ ...prev, isOpen: false }))
  const handleMessageSuccess = () => refetch()

  const handleTeleport = (lat: number, lng: number, cityName: string) => {
    setViewState({ longitude: lng, latitude: lat, zoom: 12 })
  }

  const handleEventMarkerClick = (event: LiveEvent) => {
    setSelectedEvent(event)
    toast((t) => (
      <div className="flex flex-col gap-2 max-w-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">
            {event.type === 'concert' ? '🎵'
              : event.type === 'protest' ? '📢'
              : event.type === 'celebration' ? '🎉'
              : event.type === 'emergency' ? '⚠️'
              : '💫'}
          </span>
          <p className="font-bold text-white">{event.title}</p>
        </div>
        <p className="text-sm text-gray-300">{event.description}</p>
        {event.media_url && (
          <div className="mt-2 rounded overflow-hidden">
            <img src={event.media_url} alt="Event media" className="max-h-32 object-cover rounded" />
          </div>
        )}
        <div className="flex items-center gap-1 text-xs text-red-400">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span>LIVE NOW</span>
        </div>
      </div>
    ), { duration: 8000, style: { maxWidth: '400px' } })
  }

  const handleLockedMarkerClick = (messageId: string) => toast.error('🔒 Drop your first message to unlock!')

  return (
    <main className="relative w-full h-full">
      <Map
        {...viewState}
        ref={mapRef}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        <NavigationControl position="top-right" showCompass={false} />
        <GeolocateControl
          position="top-right"
          trackUserLocation
          positionOptions={{ enableHighAccuracy: true }}
          showUserLocation={true}
          onGeolocate={(e) => setUserLocation({ lat: e.coords.latitude, lng: e.coords.longitude })}
        />
        {userLocation && (
          <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="relative">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full absolute inset-0 animate-ping"></div>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center border-4 border-white shadow-2xl">
                <MapPinned className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded whitespace-nowrap">
                You are here
              </div>
            </motion.div>
          </Marker>
        )}
        {messages.map((message) => {
          const isUnlocked = isMessageUnlocked(message.id)
          const isOwnMessage = message.device_id === deviceId
          return (
            <Marker key={message.id} longitude={message.longitude} latitude={message.latitude} anchor="bottom">
              {isUnlocked || isOwnMessage ? (
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }}
                  onClick={() => handleMessageClick(message)}
                  className="relative cursor-pointer group"
                >
                  <div className={`w-10 h-10 ${isOwnMessage
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                      : 'bg-gradient-to-br from-blue-500 to-blue-600'
                    } rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xl transition-all duration-200`}>
                    {message.emoji || '💬'}
                  </div>
                  <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-white"></div>
                  {(message.upvotes - message.downvotes) > 0 && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-md min-w-[20px] text-center">
                      {message.upvotes - message.downvotes}
                    </div>
                  )}
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
        {liveEvents.map((event) => (
          <Marker key={event.id} longitude={event.longitude} latitude={event.latitude} anchor="bottom">
            <LiveEventMarker event={event} onClick={() => handleEventMarkerClick(event)} />
          </Marker>
        ))}
        {snaps.map((snap) => (
          <Marker key={snap.id} longitude={snap.longitude} latitude={snap.latitude} anchor="bottom">
            <SnapMarker onClick={() => setSelectedSnap(snap)} />
          </Marker>
        ))}
      </Map>

      {/* Left: Random Teleport Button */}
      <div className="absolute top-4 left-4 z-30">
        <TeleportButton onTeleport={handleTeleport} />
      </div>

      {/* Center: Post Message/Snap Buttons */}
      <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={handlePostAtMyLocation}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 font-bold text-lg hover:shadow-blue-500/50 transition-all"
        >
          <Plus className="w-6 h-6" />
          Post Here
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={handlePostSnapAtMyLocation}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all"
        >
          <Camera className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Bottom Right: Create Event Fab */}
      <motion.button
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => {
          setEventModalState({
            isOpen: true,
            lat: userLocation?.lat || viewState.latitude,
            lng: userLocation?.lng || viewState.longitude
          })
        }}
        className="fixed bottom-24 right-8 z-[31] bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-full shadow-2xl hover:shadow-orange-500/50 flex items-center gap-2"
        aria-label="Create New Event"
      >
        <Zap className="w-6 h-6" />
      </motion.button>

      {/* Right: MoodHeatmap */}
      <MoodHeatmap />
      {/* Top Right: DailyChallenges */}
      <DailyChallenges />

      {/* Modals and popups */}
      <MessageModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        latitude={modalState.lat}
        longitude={modalState.lng}
        onSuccess={handleMessageSuccess}
      />
      <CreateEventModal
        isOpen={eventModalState.isOpen}
        onClose={() => setEventModalState(prev => ({ ...prev, isOpen: false }))}
        latitude={eventModalState.lat}
        longitude={eventModalState.lng}
        onSuccess={() => {
          fetchLiveEvents()
          setEventModalState(prev => ({ ...prev, isOpen: false }))
        }}
        allowMedia
        categories={[
          { id: 'party', label: 'Party 🎉' },
          { id: 'study', label: 'Study Session 📚' },
          { id: 'sports', label: 'Sports/Workout 🏋️' },
          { id: 'music', label: 'Music 🎵' },
          { id: 'meetup', label: 'Meetup 💬' },
          { id: 'food', label: 'Food 🍔' },
          { id: 'other', label: 'Other …' }
        ]}
      />
      <SnapViewerModal
        snap={selectedSnap}
        isOpen={!!selectedSnap}
        onClose={() => setSelectedSnap(null)}
      />
      <CreateSnapModal
        isOpen={snapModalOpen}
        onClose={() => setSnapModalOpen(false)}
        latitude={userLocation?.lat || 0}
        longitude={userLocation?.lng || 0}
        onSuccess={fetchSnaps}
      />

      {/* Location Permission Hint */}
      {!userLocation && !locationError && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 z-30"
        >
          <MapPinned className="w-5 h-5 animate-pulse" />
          <p className="text-sm font-medium">
            Enable location to post messages!
          </p>
        </motion.div>
      )}
    </main>
  )
}
