'use client'

import { useEffect, useRef, useState } from 'react'
import Map, { Marker, NavigationControl, GeolocateControl } from 'react-map-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export function MapContainer() {
  const mapRef = useRef(null)
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 20,
    zoom: 2
  })

  return (
    <Map
      {...viewState}
      onMove={evt => setViewState(evt.viewState)}
      mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
      style={{ width: '100%', height: '100%' }}
      ref={mapRef}
      onClick={(e) => {
        console.log('Clicked:', e.lngLat)
        // Open message modal here
      }}
    >
      <NavigationControl position="top-right" />
      <GeolocateControl
        position="top-right"
        trackUserLocation
        showUserHeading
      />
      
      {/* Render message markers here */}
    </Map>
  )
}
