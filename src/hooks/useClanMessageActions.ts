import { supabase } from '@/lib/supabase/client'
import { useDeviceId } from './useDeviceId'
import toast from 'react-hot-toast'

export function useClanMessageActions() {
  const deviceId = useDeviceId()

  async function deleteMessage(messageId: string, messageDeviceId: string) {
    if (messageDeviceId !== deviceId) {
      toast.error("❌ You can only delete your own messages")
      return false
    }

    try {
      const { error } = await supabase
        .from('clan_messages')
        .delete()
        .eq('id', messageId)
        .eq('device_id', deviceId)

      if (error) throw error
      
      toast.success('🗑️ Clan message deleted successfully')
      return true
    } catch (error: any) {
      toast.error('Failed to delete clan message')
      console.error('Delete error:', error)
      return false
    }
  }

  return { deleteMessage }
}
