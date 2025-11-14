'use client'

import dynamic from 'next/dynamic'

const MapContainer = dynamic(
  () => import('@/components/features/Map/MapContainer').then(mod => mod.default),
  { ssr: false, loading: () => <div className="w-full h-full bg-gray-900 animate-pulse flex items-center justify-center text-white">Loading Map...</div> }
)

export default function HomePage() {
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-brand-gray border-b border-gray-800 px-6 py-4">
        <h1 className="text-2xl font-bold text-brand-accent">🌍 WorldPing</h1>
        <p className="text-sm text-gray-400">Tap anywhere on Earth to drop a message</p>
      </header>
      <main className="flex-1 w-full h-full overflow-hidden">
        <MapContainer />
      </main>
    </div>
  )
}
