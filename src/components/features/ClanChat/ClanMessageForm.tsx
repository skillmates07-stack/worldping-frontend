import { useState } from 'react'
import { Smile, Send } from 'lucide-react'
import { useClanMessages } from '@/hooks/useClanMessages' // Connects to your clan message sending
import EmojiPicker from '@/components/ui/EmojiPicker' // If you want emoji picker

export default function ClanMessageForm({ clanId }) {
  const { sendMessage } = useClanMessages(clanId)
  const [content, setContent] = useState('')
  const [emoji, setEmoji] = useState('')
  const [sending, setSending] = useState(false)

  async function handleSend(e) {
    e.preventDefault()
    if (!content && !emoji) return
    setSending(true)
    try {
      await sendMessage(content, emoji)
      setContent('')
      setEmoji('')
    } finally {
      setSending(false)
    }
  }

  return (
    <form className="flex items-center gap-2 mt-2" onSubmit={handleSend}>
      <button
        type="button"
        tabIndex={0}
        aria-label="Pick emoji"
        className="px-2 py-1 rounded-xl bg-gray-200 hover:bg-gray-300"
        onClick={() => {/* open emoji picker */}}
      >
        <Smile className="w-5 h-5" />
      </button>
      {/* (EmojiPicker can be plugged in here) */}
      <input
        className="flex-1 p-2 rounded-lg border bg-white/80"
        placeholder="Type your clan message..."
        value={content}
        onChange={e => setContent(e.target.value)}
        maxLength={500}
        disabled={sending}
        required={emoji === ''}
      />
      <button
        type="submit"
        tabIndex={0}
        aria-label="Send"
        className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition disabled:opacity-50"
        disabled={sending || (!content && !emoji)}
      >
        <Send className="w-6 h-6" />
      </button>
    </form>
  )
}
