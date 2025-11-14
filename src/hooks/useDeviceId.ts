'use client'

import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

export function useDeviceId() {
  const [deviceId, setDeviceId] = useState<string>('')

  useEffect(() => {
    // Get or create device ID from localStorage
    let id = localStorage.getItem('worldping_device_id')
    
    if (!id) {
      id = uuidv4()
      localStorage.setItem('worldping_device_id', id)
    }
    
    setDeviceId(id)
  }, [])

  return deviceId
}
