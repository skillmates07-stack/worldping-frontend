'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useDeviceId } from './useDeviceId'

interface StreakData {
  currentStreak: number
  longestStreak: number
  countriesVisited: string[]
  lastPostDate: string | null
}

export function useStreak() {
  const deviceId = useDeviceId()
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    countriesVisited: [],
    lastPostDate: null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (deviceId) {
      fetchStreak()
    }
  }, [deviceId])

  async function fetchStreak() {
    try {
      setLoading(true)
      
      // Get user's streak data from localStorage (or Supabase if you add a user_stats table)
      const storedStreak = localStorage.getItem(`streak_${deviceId}`)
      if (storedStreak) {
        const data = JSON.parse(storedStreak)
        
        // Check if streak is broken (last post was more than 24 hours ago)
        if (data.lastPostDate) {
          const lastPost = new Date(data.lastPostDate)
          const hoursSinceLastPost = (Date.now() - lastPost.getTime()) / (1000 * 60 * 60)
          
          if (hoursSinceLastPost > 48) {
            // Streak broken! Reset to 0
            data.currentStreak = 0
          }
        }
        
        setStreak(data)
      }
    } catch (error) {
      console.error('Error fetching streak:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateStreakAfterPost(country: string) {
    const now = new Date().toISOString()
    const today = new Date().toDateString()
    
    // Check if already posted today
    const lastPostDate = streak.lastPostDate ? new Date(streak.lastPostDate).toDateString() : null
    
    if (lastPostDate === today) {
      // Already posted today, just update country list if new
      if (!streak.countriesVisited.includes(country)) {
        const updatedStreak = {
          ...streak,
          countriesVisited: [...streak.countriesVisited, country]
        }
        setStreak(updatedStreak)
        localStorage.setItem(`streak_${deviceId}`, JSON.stringify(updatedStreak))
      }
      return
    }
    
    // New day! Increment streak
    const newStreak: StreakData = {
      currentStreak: streak.currentStreak + 1,
      longestStreak: Math.max(streak.longestStreak, streak.currentStreak + 1),
      countriesVisited: [...new Set([...streak.countriesVisited, country])],
      lastPostDate: now
    }
    
    setStreak(newStreak)
    localStorage.setItem(`streak_${deviceId}`, JSON.stringify(newStreak))
    
    // Show celebration notification
    if (newStreak.currentStreak > 0) {
      showStreakNotification(newStreak.currentStreak)
    }
  }

  function showStreakNotification(streakCount: number) {
    // Browser notification (if permission granted)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`🔥 ${streakCount} Day Streak!`, {
        body: `You're on fire! Keep it up!`,
        icon: '/favicon.ico'
      })
    }
  }

  return { streak, loading, updateStreakAfterPost, refetch: fetchStreak }
}
