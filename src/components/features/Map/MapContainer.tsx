'use client'

import { useState } from 'react'
import Map, { NavigationControl, GeolocateControl } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'

export default function MapContainer() {
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 20,
    zoom: 2
  })

  const handleMapClick = (e: any) => {
    const { lng, lat } = e.lngLat
    console.log('Clicked:', { lng, lat })
    alert(`You clicked: ${lat.toFixed(4)}, ${lng.toFixed(4)}\n\nMessage modal will open here!`)
  }

  return (
    <Map
      {...viewState}
      onMove={evt => setViewState(evt.viewState)}
      mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
      style={{ width: '100%', height: '100%' }}
      onClick={handleMapClick}
    >
      <NavigationControl position="top-right" />
      <GeolocateControl
        position="top-right"
        trackUserLocation
        positionOptions={{ enableHighAccuracy: true }}
        showUserLocation={true}
      />
    </Map>
  )
}
