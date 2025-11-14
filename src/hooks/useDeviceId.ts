'use client'

import { useEffect, useState } from 'react'

// Generate UUID v4 using browser's crypto API (no dependencies needed!)
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export function useDeviceId() {
  const [deviceId, setDeviceId] = useState<string>('')

  useEffect(() => {
    // Get or create device ID from localStorage
    let id = localStorage.getItem('worldping_device_id')
    
    if (!id) {
      id = generateUUID()
      localStorage.setItem('worldping_device_id', id)
    }
    
    setDeviceId(id)
  }, [])

  return deviceId
}
