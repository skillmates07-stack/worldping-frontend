'use client'

import { useState } from 'react'
import Map, { NavigationControl, GeolocateControl } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import MessageModal from '@/components/features/DropMessage/MessageModal'
import MessageMarkers from '@/components/features/Map/MessageMarkers'
import { useMessages } from '@/hooks/useMessages'

export default function MapContainer() {
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

  const { messages, refetch } = useMessages()

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
    console.log('Message created successfully!')
    refetch()
  }

  return (
    <>
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        style={{ width: '100%', height: '100%' }}
        onClick={handleMapClick}
      >
        {/* Navigation Controls */}
        <NavigationControl position="top-right" />
        <GeolocateControl
          position="top-right"
          trackUserLocation
          positionOptions={{ enableHighAccuracy: true }}
          showUserLocation={true}
        />

        {/* Message Markers */}
        <MessageMarkers messages={messages} />
      </Map>

      {/* Message Creation Modal */}
      <MessageModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        latitude={modalState.lat}
        longitude={modalState.lng}
        onSuccess={handleMessageSuccess}
      />
    </>
  )
}

