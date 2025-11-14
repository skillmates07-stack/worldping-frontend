'use client'

import dynamic from 'next/dynamic'
import { Header } from '@/components/layout/Header'
import { MessageFeed } from '@/components/features/MessageFeed'

// Dynamically import Map to avoid SSR issues with MapLibre
const MapContainer = dynamic(
  () => import('@/components/features/Map').then(mod => mod.MapContainer),
  { ssr: false, loading: () => <div className="w-full h-full bg-gray-900 animate-pulse" /> }
)

export default function HomePage() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 flex overflow-hidden">
        {/* Map takes 70% on desktop, 100% on mobile */}
        <div className="w-full lg:w-[70%] h-full relative">
          <MapContainer />
        </div>
        
        {/* Message feed sidebar - hidden on mobile, shown as modal */}
        <aside className="hidden lg:block lg:w-[30%] h-full border-l border-gray-800 overflow-y-auto">
          <MessageFeed />
        </aside>
      </main>
    </div>
  )
}
