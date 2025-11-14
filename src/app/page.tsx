'use client'

import dynamic from 'next/dynamic'
import { MessageFeed } from '@/components/features/MessageFeed'

const MapContainer = dynamic(
  () => import('@/components/features/Map/MapContainer').then(mod => mod.default),
  { ssr: false, loading: () => <div className="w-full h-full bg-gray-900 animate-pulse flex items-center justify-center text-white">Loading Map...</div> }
)

export default function HomePage() {
  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Professional Header */}
      <header className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🌍</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              WorldPing
            </h1>
            <p className="text-xs text-gray-400">Drop messages anywhere on Earth</p>
          </div>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <div className="text-center">
            <p className="text-gray-400 text-xs">Active</p>
            <p className="text-white font-bold">Live</p>
          </div>
          <div className="w-px h-8 bg-gray-800"></div>
          <div className="text-center">
            <p className="text-gray-400 text-xs">Version</p>
            <p className="text-white font-bold">1.0</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Map - 70% on desktop, 100% on mobile */}
        <div className="w-full lg:w-[70%] h-full relative">
          <MapContainer />
        </div>
        
        {/* Message Feed Sidebar - hidden on mobile */}
        <aside className="hidden lg:block lg:w-[30%] h-full border-l border-gray-800 overflow-hidden">
          <MessageFeed />
        </aside>
      </main>
    </div>
  )
}
