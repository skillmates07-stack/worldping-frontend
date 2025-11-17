import { User as UserIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface UserDisplayProps {
  displayName: string
  avatarUrl?: string
  size?: 'sm' | 'md' | 'lg'
  showBadge?: boolean
}

export function UserDisplay({ 
  displayName, 
  avatarUrl, 
  size = 'md',
  showBadge 
}: UserDisplayProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base'
  }

  return (
    <div className="flex items-center gap-2">
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden`}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
        ) : (
          <UserIcon className="w-1/2 h-1/2 text-white" />
        )}
      </motion.div>
      <span className="font-medium text-gray-200">{displayName}</span>
      {showBadge && (
        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
          Verified
        </span>
      )}
    </div>
  )
}
