'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, X, TrendingUp, MapPin, Zap, Trophy, Camera, Minimize2, Maximize2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useDeviceId } from '@/hooks/useDeviceId'
import { formatTimeAgo } from '@/lib/utils'

interface DiscoverMessage {
  id: string
  device_id: string
  content: string
  emoji: string | null
  mood: string | null
  latitude: number
  longitude: number
  upvotes: number
  downvotes: number
  reply_count: number
  created_at: string
  expires_at: string
  distance?: number
}

interface Snap {
  id: string
  device_id: string
  caption: string
  image_url: string | null
  reactions: { fire: number, love: number, wow: number }
  view_count: number
  created_at: string
  totalReactions?: number
}

type DiscoverTab = 'nearby' | 'trending' | 'events' | 'leaderboard' | 'snaps'

export default function DiscoverPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [activeTab, setActiveTab] = useState<DiscoverTab>('nearby')
  const [messages, setMessages] = useState<DiscoverMessage[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [snaps, setSnaps] = useState<Snap[]>([])
  const [loading, setLoading] = useState(false)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const deviceId = useDeviceId()

  useEffect(() => {
    if (isOpen) {
      getUserLocation()
      fetchData()
    }
  }, [isOpen, activeTab])

  async function getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        }
      )
    }
  }

  async function fetchData() {
    setLoading(true)
    try {
      if (activeTab === 'nearby') {
        await fetchNearbyMessages()
      } else if (activeTab === 'trending') {
        await fetchTrendingMessages()
      } else if (activeTab === 'events') {
        await fetchLiveEvents()
      } else if (activeTab === 'leaderboard') {
        await fetchLeaderboard()
      } else if (activeTab === 'snaps') {
        await fetchTopSnaps()
      }
    } catch (error) {
      console.error('Error fetching discover data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchNearbyMessages() {
    if (!userLocation) {
      setMessages([])
      return
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    const nearby = (data || []).map(msg => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        msg.latitude,
        msg.longitude
      )
      return { ...msg, distance }
    }).filter(msg => msg.distance <= 5).sort((a, b) => a.distance - b.distance)

    setMessages(nearby)
  }

  async function fetchTrendingMessages() {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .order('upvotes', { ascending: false })
      .limit(20)

    if (error) throw error
    setMessages((data || []).filter(msg => msg.upvotes - msg.downvotes > 0))
  }

  async function fetchLiveEvents() {
    const { data, error } = await supabase
      .from('live_events')
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error
    setEvents(data || [])
  }

  async function fetchLeaderboard() {
    const { data, error } = await supabase
      .from('messages')
      .select('device_id, upvotes, downvotes')
      .gt('expires_at', new Date().toISOString())

    if (error) throw error

    const userScores = (data || []).reduce((acc: any, msg: any) => {
      if (!acc[msg.device_id]) {
        acc[msg.device_id] = { device_id: msg.device_id, score: 0, messages: 0 }
      }
      acc[msg.device_id].score += msg.upvotes - msg.downvotes
      acc[msg.device_id].messages += 1
      return acc
    }, {})

    const sorted = Object.values(userScores)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 10)

    setLeaderboard(sorted)
  }

  async function fetchTopSnaps() {
    const { data, error } = await supabase
      .from('snaps')
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .order('view_count', { ascending: false })
      .limit(20)

    if (error) throw error
    
    const withScores = (data || []).map(snap => ({
      ...snap,
      totalReactions: (snap.reactions.fire || 0) + (snap.reactions.love || 0) + (snap.reactions.wow || 0)
    }))
    
    setSnaps(withScores.sort((a, b) => b.totalReactions - a.totalReactions))
  }

  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 left-6 z-40 bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Compass className="w-7 h-7 group-hover:rotate-180 transition-transform duration-500" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ 
              x: 0, 
              opacity: 1,
              width: isMinimized ? '60px' : '400px'
            }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-6 bottom-6 bg-gray-900 border-2 border-orange-600 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
            style={{ height: isMinimized ? '60px' : '70vh', maxHeight: '600px' }}
          >
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Compass className="w-5 h-5" />
                    Discover
                  </h3>
                  {!isMinimized && (
                    <p className="text-white/80 text-xs mt-0.5">Explore WorldPing</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {!isMinimized && (
                <div className="grid grid-cols-5 gap-1 mt-3">
                  <button
                    onClick={() => setActiveTab('nearby')}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                      activeTab === 'nearby' ? 'bg-white text-orange-600' : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Near</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('trending')}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                      activeTab === 'trending' ? 'bg-white text-orange-600' : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Hot</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('events')}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                      activeTab === 'events' ? 'bg-white text-orange-600' : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    <span>Live</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('leaderboard')}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                      activeTab === 'leaderboard' ? 'bg-white text-orange-600' : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Top</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('snaps')}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                      activeTab === 'snaps' ? 'bg-white text-orange-600' : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    <span>Snap</span>
                  </button>
                </div>
              )}
            </div>

            {!isMinimized && (
              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-950">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <>
                    {activeTab === 'nearby' && (
                      <>
                        {messages.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center px-4">
                            <MapPin className="w-12 h-12 text-gray-700 mb-2" />
                            <p className="text-gray-400 text-sm font-medium">No messages nearby</p>
                          </div>
                        ) : (
                          messages.map(msg => (
                            <div key={msg.id} className="bg-gray-800 rounded-xl p-3 border border-gray-700">
                              <div className="flex items-start gap-2">
                                <span className="text-2xl">{msg.emoji || '💬'}</span>
                                <div className="flex-1">
                                  <p className="text-white text-sm">{msg.content}</p>
                                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                    <span>📍 {msg.distance?.toFixed(1)}km</span>
                                    <span>👍 {msg.upvotes}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </>
                    )}

                    {activeTab === 'trending' && (
                      <>
                        {messages.map((msg, i) => (
                          <div key={msg.id} className="bg-gray-800 rounded-xl p-3 border border-gray-700">
                            <div className="flex items-start gap-2">
                              <span className="text-xl font-bold text-orange-400">#{i + 1}</span>
                              <span className="text-2xl">{msg.emoji || '💬'}</span>
                              <div className="flex-1">
                                <p className="text-white text-sm">{msg.content}</p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                  <span>🔥 {msg.upvotes - msg.downvotes}</span>
                                  <span>💬 {msg.reply_count || 0}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {activeTab === 'events' && (
                      <>
                        {events.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center px-4">
                            <Zap className="w-12 h-12 text-gray-700 mb-2" />
                            <p className="text-gray-400 text-sm font-medium">No live events</p>
                          </div>
                        ) : (
                          events.map(event => (
                            <div key={event.id} className="bg-gray-800 rounded-xl p-3 border border-red-500/50">
                              <div className="flex items-start gap-2">
                                <span className="text-2xl">
                                  {event.type === 'concert' ? '🎵' : event.type === 'protest' ? '📢' : '🎉'}
                                </span>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-white text-sm font-bold">{event.title}</p>
                                    <span className="text-xs text-red-400 flex items-center gap-1">
                                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                      LIVE
                                    </span>
                                  </div>
                                  <p className="text-gray-400 text-xs">{event.description}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </>
                    )}

                    {activeTab === 'leaderboard' && (
                      <>
                        {leaderboard.map((user, i) => (
                          <div key={user.device_id} className={`bg-gray-800 rounded-xl p-3 border ${
                            i === 0 ? 'border-yellow-500' : i === 1 ? 'border-gray-400' : i === 2 ? 'border-orange-600' : 'border-gray-700'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">
                                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                </span>
                                <div>
                                  <p className="text-white text-sm font-bold">
                                    {user.device_id === deviceId ? 'You' : `User ${user.device_id.slice(0, 6)}`}
                                  </p>
                                  <p className="text-gray-500 text-xs">{user.messages} messages</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-orange-400 font-bold text-lg">{user.score}</p>
                                <p className="text-gray-500 text-xs">points</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {activeTab === 'snaps' && (
                      <>
                        {snaps.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center px-4">
                            <Camera className="w-12 h-12 text-gray-700 mb-2" />
                            <p className="text-gray-400 text-sm font-medium">No snaps yet</p>
                          </div>
                        ) : (
                          snaps.map((snap, i) => (
                            <div key={snap.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                              <div className="relative aspect-square">
                                {snap.image_url ? (
                                  <img src={snap.image_url} alt="Snap" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
                                    <Camera className="w-12 h-12 text-white/50" />
                                  </div>
                                )}
                                
                                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-white">
                                  #{i + 1}
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                  <div className="flex items-center gap-2 text-white text-xs">
                                    <span>🔥 {snap.reactions.fire}</span>
                                    <span>❤️ {snap.reactions.love}</span>
                                    <span>⚡ {snap.reactions.wow}</span>
                                    <span className="ml-auto">👁️ {snap.view_count}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {snap.caption && (
                                <div className="p-2">
                                  <p className="text-white text-sm truncate">{snap.caption}</p>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
