export const EMOJIS = [
  '😀', '😍', '🎉', '🔥', '❤️', '👍', '🌍', '✨', 
  '💡', '🚀', '🎯', '💯', '👋', '🙌', '😎', '🤔', 
  '😂', '🥳', '😊', '💪', '🌟', '⚡', '🎊', '🏆',
  '💎', '🌈', '🎵', '📍', '🌴', '🌸', '🍕', '☕'
]

export const ACHIEVEMENT_BADGES = {
  FIRST_MESSAGE: { icon: '🎯', name: 'First Drop', description: 'Dropped your first message' },
  STREAK_3: { icon: '🔥', name: 'On Fire', description: '3-day streak' },
  STREAK_7: { icon: '💎', name: 'Dedicated', description: '7-day streak' },
  STREAK_30: { icon: '🏆', name: 'Legend', description: '30-day streak' },
  COUNTRIES_5: { icon: '🌍', name: 'Explorer', description: 'Visited 5 countries' },
  COUNTRIES_10: { icon: '✈️', name: 'Globetrotter', description: 'Visited 10 countries' },
  UPVOTES_100: { icon: '⭐', name: 'Popular', description: 'Received 100 upvotes' },
  KING: { icon: '👑', name: 'City King', description: 'Most popular in a city' }
}

export const APP_CONFIG = {
  MAX_MESSAGE_LENGTH: 500,
  MESSAGES_PER_UNLOCK: 10,
  STREAK_EXPIRY_HOURS: 48,
  LEADERBOARD_SIZE: 50,
  NEARBY_RADIUS_KM: 5
}
