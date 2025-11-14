'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shuffle, Loader2, Sparkles } from 'lucide-react'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface TeleportButtonProps {
  onTeleport: (lat: number, lng: number, cityName: string) => void
}

const FAMOUS_CITIES = [
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { name: 'New York', lat: 40.7128, lng: -74.0060 },
  { name: 'Paris', lat: 48.8566, lng: 2.3522 },
  { name: 'London', lat: 51.5074, lng: -0.1278 },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { name: 'Rio', lat: -22.9068, lng: -43.1729 },
  { name: 'Barcelona', lat: 41.3851, lng: 2.1734 },
  { name: 'Seoul', lat: 37.5665, lng: 126.9780 },
  { name: 'Bangkok', lat: 13.7563, lng: 100.5018 },
  { name: 'Istanbul', lat: 41.0082, lng: 28.9784 },
  { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
  { name: 'Berlin', lat: 52.5200, lng: 13.4050 },
  { name: 'Toronto', lat: 43.6532, lng: -79.3832 },
  { name: 'Mexico City', lat: 19.4326, lng: -99.1332 },
  { name: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
  { name: 'Cairo', lat: 30.0444, lng: 31.2357 },
  { name: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
  { name: 'Rome', lat: 41.9028, lng: 12.4964 },
  { name: 'Madrid', lat: 40.4168, lng: -3.7038 },
  { name: 'San Francisco', lat: 37.7749, lng: -122.4194 },
  { name: 'Miami', lat: 25.7617, lng: -80.1918 },
  { name: 'Lagos', lat: 6.5244, lng: 3.3792 },
  { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816 },
  { name: 'Stockholm', lat: 59.3293, lng: 18.0686 },
  { name: 'Copenhagen', lat: 55.6761, lng: 12.5683 },
  { name: 'Lisbon', lat: 38.7223, lng: -9.1393 },
  { name: 'Prague', lat: 50.0755, lng: 14.4378 },
]

export default function TeleportButton({ onTeleport }: TeleportButtonProps) {
  const [isTeleporting, setIsTeleporting] = useState(false)

  const handleTeleport = async () => {
    setIsTeleporting(true)

    // Pick random city
    const randomCity = FAMOUS_CITIES[Math.floor(Math.random() * FAMOUS_CITIES.length)]

    // Dramatic pause for effect
    await new Promise(resolve => setTimeout(resolve, 800))

    // Teleport with celebration
    toast.success(`🌍 Teleported to ${randomCity.name}!`, {
      icon: '✨',
      duration: 3000
    })

    onTeleport(randomCity.lat, randomCity.lng, randomCity.name)
    setIsTeleporting(false)
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        onClick={handleTeleport}
        disabled={isTeleporting}
        className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-500 hover:via-pink-500 hover:to-red-500 shadow-lg shadow-purple-500/50 relative overflow-hidden group"
      >
        {isTeleporting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Teleporting...
          </>
        ) : (
          <>
            <Shuffle className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
            Random Teleport
            <Sparkles className="w-4 h-4 ml-2 animate-pulse" />
          </>
        )}

        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </Button>
    </motion.div>
  )
}
