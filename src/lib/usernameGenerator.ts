import type { SupabaseClient } from '@supabase/supabase-js'

const adjectives = [
  'happy', 'brave', 'clever', 'gentle', 'swift', 'bright', 'calm', 'bold',
  'wise', 'kind', 'fierce', 'noble', 'quick', 'proud', 'silent', 'cosmic',
  'mystic', 'radiant', 'serene', 'mighty', 'golden', 'silver', 'azure', 'crimson',
  'emerald', 'sapphire', 'jade', 'ruby', 'crystal', 'shadow'
]

const animals = [
  'wolf', 'eagle', 'fox', 'bear', 'lion', 'tiger', 'hawk', 'dragon',
  'phoenix', 'panther', 'falcon', 'raven', 'lynx', 'cobra', 'shark', 'orca',
  'leopard', 'jaguar', 'cheetah', 'puma', 'viper', 'scorpion', 'mantis', 'spider',
  'owl', 'crow', 'swan', 'deer', 'rabbit', 'dolphin'
]

function generateRandomUsername(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const animal = animals[Math.floor(Math.random() * animals.length)]
  const number = Math.floor(Math.random() * 1000)
  return `${adjective}_${animal}${number}`
}

export async function generateUniqueUsername(supabase: SupabaseClient): Promise<string> {
  let isUnique = false
  let username = ''

  while (!isUnique) {
    username = generateRandomUsername()
    
    // FIXED: query the 'username' column, NOT 'display_name'
    const { data } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle()
    
    isUnique = !data // If no row found, username is unique
  }

  return username
}
