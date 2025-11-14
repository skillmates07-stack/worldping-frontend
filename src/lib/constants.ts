export const EMOJIS = [
  '😀', '😍', '🎉', '🔥', '❤️', '👍', '🌍', '✨', 
  '💡', '🚀', '🎯', '💯', '👋', '🙌', '😎', '🤔', 
  '😂', '🥳', '😊', '💪', '🌟', '⚡', '🎊', '🏆',
  '💎', '🌈', '🎵', '📍', '🌴', '🌸', '🍕', '☕',
  '🎮', '📱', '💻', '🎨', '🎭', '🎪', '🎬', '📸'
]

export const ACHIEVEMENT_BADGES = {
  FIRST_MESSAGE: { 
    icon: '🎯', 
    name: 'First Drop', 
    description: 'Dropped your first message',
    color: 'from-blue-500 to-cyan-500'
  },
  STREAK_3: { 
    icon: '🔥', 
    name: 'On Fire', 
    description: '3-day streak',
    color: 'from-orange-500 to-red-500'
  },
  STREAK_7: { 
    icon: '💎', 
    name: 'Dedicated', 
    description: '7-day streak',
    color: 'from-purple-500 to-pink-500'
  },
  STREAK_30: { 
    icon: '🏆', 
    name: 'Legend', 
    description: '30-day streak',
    color: 'from-yellow-500 to-orange-500'
  },
  COUNTRIES_5: { 
    icon: '🌍', 
    name: 'Explorer', 
    description: 'Visited 5 countries',
    color: 'from-green-500 to-emerald-500'
  },
  COUNTRIES_10: { 
    icon: '✈️', 
    name: 'Globetrotter', 
    description: 'Visited 10 countries',
    color: 'from-blue-500 to-indigo-500'
  },
  UPVOTES_100: { 
    icon: '⭐', 
    name: 'Popular', 
    description: 'Received 100 upvotes',
    color: 'from-yellow-400 to-amber-500'
  },
  KING: { 
    icon: '👑', 
    name: 'City King', 
    description: 'Most popular in a city',
    color: 'from-purple-600 to-pink-600'
  }
}

export const APP_CONFIG = {
  MAX_MESSAGE_LENGTH: 500,
  MESSAGES_PER_UNLOCK: 10,
  STREAK_EXPIRY_HOURS: 48,
  LEADERBOARD_SIZE: 50,
  NEARBY_RADIUS_KM: 5,
  MAX_MESSAGES_PER_DAY: 50,
  VOTE_COOLDOWN_MS: 1000
}
