import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return new Date(date).toLocaleDateString()
}

export function getCountryFromCoordinates(lat: number, lng: number): string {
  // Simple country detection based on lat/lng ranges
  // In production, use reverse geocoding API
  if (lat >= 24 && lat <= 49 && lng >= -125 && lng <= -66) return 'United States'
  if (lat >= 35 && lat <= 71 && lng >= -10 && lng <= 40) return 'Europe'
  if (lat >= -10 && lat <= 37 && lng >= -18 && lng <= 51) return 'Africa'
  if (lat >= -55 && lat <= -10 && lng >= -81 && lng <= -34) return 'South America'
  if (lat >= 5 && lat <= 37 && lng >= 60 && lng <= 150) return 'Asia'
  if (lat >= -47 && lat <= -10 && lng >= 113 && lng <= 154) return 'Australia'
  return 'Unknown'
}
