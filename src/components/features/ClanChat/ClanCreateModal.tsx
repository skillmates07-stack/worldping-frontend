import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users2, Lock, Globe } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useDeviceId } from "@/hooks/useDeviceId";
import toast from "react-hot-toast";

interface ClanCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const EMOJI_OPTIONS = ['💻', '🎮', '✈️', '🎨', '🎵', '📚', '⚽', '🍕', '🌟', '🔥', '💎', '🚀'];
const COLOR_OPTIONS = [
  'from-blue-500 to-purple-500',
  'from-green-500 to-teal-500',
  'from-red-500 to-pink-500',
  'from-yellow-500 to-orange-500',
  'from-indigo-500 to-purple-500',
];

export default function ClanCreateModal({ isOpen, onClose, onCreated }: ClanCreateModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('🌟');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [creating, setCreating] = useState(false);
  const deviceId = useDeviceId();

  async function handleCreate() {
    if (!name.trim() || name.length < 3) {
      toast.error('Clan name must be at least 3 characters');
      return;
    }

    if (!deviceId) {
      toast.error('Please wait, authenticating...');
      return;
    }

    setCreating(true);
    try {
      // Create clan
      const { data: clan, error: clanError } = await supabase
        .from('clans')
        .insert({
          name: name.trim(),
          description: description.trim(),
          emoji,
          color,
          privacy,
          created_by: deviceId,
          member_count: 1
        })
        .select()
        .single();

      if (clanError) {
        if (clanError.code === '23505') {
          toast.error('A clan with this name already exists');
        } else {
          throw clanError;
        }
        return;
      }

      // Auto-join creator as owner
      const { error: memberError } = await supabase
        .from('clan_members')
        .insert({
          clan_id: clan.id,
          device_id: deviceId,
          role: 'owner'
        });

      if (memberError) throw memberError;

      toast.success(`🎉 Created ${name}!`);
      onCreated();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating clan:', error);
      toast.error('Failed to create clan');
    } finally {
      setCreating(false);
    }
  }

  function resetForm() {
    setName('');
    setDescription('');
    setEmoji('🌟');
    setColor(COLOR_OPTIONS[0]);
    setPrivacy('public');
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 rounded-2xl w-full max-w-md overflow-hidden border-2 border-purple-600"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users2 className="w-6 h-6" />
              Create Clan
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4">
            {/* Clan Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Clan Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter clan name..."
                maxLength={50}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's your clan about?"
                maxLength={200}
                rows={3}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            {/* Emoji Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Choose Emoji
              </label>
              <div className="grid grid-cols-6 gap-2">
                {EMOJI_OPTIONS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setEmoji(em)}
                    className={`p-3 text-2xl rounded-lg transition-all ${
                      emoji === em
                        ? 'bg-purple-600 scale-110'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Privacy
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPrivacy('public')}
                  className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    privacy === 'public'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => setPrivacy('private')}
                  className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    privacy === 'private'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  Private
                </button>
              </div>
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreate}
              disabled={creating || !name.trim() || name.length < 3}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all"
            >
              {creating ? 'Creating...' : 'Create Clan'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
