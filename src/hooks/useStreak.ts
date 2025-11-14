'use client'

import { useEffect, useState } from 'react'
import { useDeviceId } from './useDeviceId'
import { APP_CONFIG } from '@/lib/constants'
import toast from 'react-hot-toast'

interface StreakData {
  currentStreak: number
  longestStreak: number
  countriesVisited: string[]
  lastPostDate: string | null
  totalMessages: number
  totalUpvotes: number
}

export function useStreak() {
  const deviceId = useDeviceId()
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    countriesVisited: [],
    lastPostDate: null,
    totalMessages: 0,
    totalUpvotes: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (deviceId) {
      fetchStreak()
      checkStreakExpiry()
    }
  }, [deviceId])

  async function fetchStreak() {
    try {
      setLoading(true)
      const storedStreak = localStorage.getItem(`streak_${deviceId}`)
      
      if (storedStreak) {
        const data = JSON.parse(storedStreak)
        setStreak(data)
      }
    } catch (error) {
      console.error('Error fetching streak:', error)
    } finally {
      setLoading(false)
    }
  }

  function checkStreakExpiry() {
    const storedStreak = localStorage.getItem(`streak_${deviceId}`)
    if (!storedStreak) return

    const data = JSON.parse(storedStreak)
    if (data.lastPostDate) {
      const hoursSince = (Date.now() - new Date(data.lastPostDate).getTime()) / (1000 * 60 * 60)
      
      if (hoursSince > APP_CONFIG.STREAK_EXPIRY_HOURS) {
        // Streak expired
        const updatedStreak = { ...data, currentStreak: 0 }
        localStorage.setItem(`streak_${deviceId}`, JSON.stringify(updatedStreak))
        setStreak(updatedStreak)
        
        if (data.currentStreak > 0) {
          toast.error(`💔 Your ${data.currentStreak}-day streak expired!`)
        }
      }
    }
  }

  async function updateStreakAfterPost(country: string, upvotes: number = 0) {
    const now = new Date().toISOString()
    const today = new Date().toDateString()
    const lastPostDate = streak.lastPostDate ? new Date(streak.lastPostDate).toDateString() : null

    // Check if already posted today
    if (lastPostDate === today) {
      // Just update countries and stats
      const updatedStreak = {
        ...streak,
        countriesVisited: Array.from(new Set([...streak.countriesVisited, country])),
        totalMessages: streak.totalMessages + 1,
        totalUpvotes: streak.totalUpvotes + upvotes
      }
      setStreak(updatedStreak)
      localStorage.setItem(`streak_${deviceId}`, JSON.stringify(updatedStreak))
      return
    }

    // New day! Increment streak
    const newStreak: StreakData = {
      currentStreak: streak.currentStreak + 1,
      longestStreak: Math.max(streak.longestStreak, streak.currentStreak + 1),
      countriesVisited: Array.from(new Set([...streak.countriesVisited, country])),
      lastPostDate: now,
      totalMessages: streak.totalMessages + 1,
      totalUpvotes: streak.totalUpvotes + upvotes
    }

    setStreak(newStreak)
    localStorage.setItem(`streak_${deviceId}`, JSON.stringify(newStreak))

    // Show celebration
    if (newStreak.currentStreak % 7 === 0) {
      toast.success(`🔥 ${newStreak.currentStreak} Day Streak! You're on fire! 🔥`, {
        duration: 5000,
        icon: '🎉'
      })
    } else if (newStreak.currentStreak > 1) {
      toast.success(`🔥 Day ${newStreak.currentStreak} Streak!`)
    }

    // Check for achievements
    checkAchievements(newStreak)
  }

  function checkAchievements(streakData: StreakData) {
    const achievements = []

    if (streakData.currentStreak === 3) achievements.push('STREAK_3')
    if (streakData.currentStreak === 7) achievements.push('STREAK_7')
    if (streakData.currentStreak === 30) achievements.push('STREAK_30')
    if (streakData.countriesVisited.length === 5) achievements.push('COUNTRIES_5')
    if (streakData.countriesVisited.length === 10) achievements.push('COUNTRIES_10')
    if (streakData.totalUpvotes >= 100) achievements.push('UPVOTES_100')

    achievements.forEach(badge => {
      const existing = localStorage.getItem(`achievement_${deviceId}_${badge}`)
      if (!existing) {
        localStorage.setItem(`achievement_${deviceId}_${badge}`, 'true')
        toast.success(`🏆 Achievement Unlocked: ${badge}!`, { duration: 7000 })
      }
    })
  }

  return { streak, loading, updateStreakAfterPost, refetch: fetchStreak }
}
