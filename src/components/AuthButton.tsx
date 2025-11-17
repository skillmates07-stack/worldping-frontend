'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import AuthModal from '@/components/AuthModal'
import { User, LogOut } from 'lucide-react'

export default function AuthButton() {
  const { user, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  if (loading) return null

  if (user) {
    return (
      <button
        onClick={() => supabase.auth.signOut()}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
      >
        <User className="w-4 h-4" />
        <span className="text-sm">{user.email?.split('@')[0] || 'User'}</span>
        <LogOut className="w-4 h-4" />
      </button>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowAuthModal(true)}
        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg text-white font-medium transition-all"
      >
        Sign In
      </button>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  )
}
