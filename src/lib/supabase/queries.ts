import { supabase } from './client'

export interface Message {
  id: string
  device_id: string
  content: string
  emoji?: string
  latitude: number
  longitude: number
  upvotes: number
  downvotes: number
  created_at: string
}

// Get messages within radius (in meters)
export async function getMessagesInRadius(
  lat: number, 
  lng: number, 
  radiusMeters: number = 50000
) {
  const { data, error } = await supabase.rpc('messages_in_radius', {
    lat,
    lng,
    radius_meters: radiusMeters
  })
  
  if (error) throw error
  return data as Message[]
}

// Get nearby messages (5km default for "Nearby" tab)
export async function getNearbyMessages(lat: number, lng: number) {
  return getMessagesInRadius(lat, lng, 5000)
}

// Insert new message
export async function createMessage(
  deviceId: string,
  content: string,
  lat: number,
  lng: number,
  emoji?: string
) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      device_id: deviceId,
      content,
      emoji,
      latitude: lat,
      longitude: lng,
      location: `POINT(${lng} ${lat})`
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Vote on message
export async function voteMessage(
  messageId: string,
  deviceId: string,
  voteType: 'up' | 'down'
) {
  const { error } = await supabase
    .from('votes')
    .upsert({
      message_id: messageId,
      device_id: deviceId,
      vote_type: voteType
    }, {
      onConflict: 'message_id,device_id'
    })
  
  if (error) throw error
}
