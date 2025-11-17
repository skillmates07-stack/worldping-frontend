import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Shield, Search, TrendingUp, Grid } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useDeviceId } from "@/hooks/useDeviceId";
import toast from "react-hot-toast";

interface Clan {
  id: string;
  name: string;
  emoji?: string;
  description?: string;
  member_count: number;
  privacy: string;
  message_count?: number;
  created_at?: string;
}

interface ClanBrowseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoined: () => void;
}

export default function ClanBrowseModal({ isOpen, onClose, onJoined }: ClanBrowseModalProps) {
  const [clans, setClans] = useState<Clan[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<'all' | 'trending'>('all');
  const deviceId = useDeviceId();

  useEffect(() => {
    if (isOpen) {
      fetchClans();
    }
  }, [isOpen, search, view]);

  async function fetchClans() {
    setLoading(true);
    try {
      let query = supabase
        .from("clans")
        .select("*");

      // Filter by search
      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      // Sort and limit based on view
      if (view === 'trending') {
        query = query.order('member_count', { ascending: false }).limit(10);
      } else {
        query = query.order('created_at', { ascending: false }).limit(20);
      }

      const { data, error } = await query;
      if (error) throw error;
      setClans(data || []);
    } catch (error) {
      console.error("Error fetching clans:", error);
    } finally {
      setLoading(false);
    }
  }

  async function joinClan(clanId: string, clanName: string) {
    if (!deviceId) {
      toast.error("Please wait, authenticating...");
      return;
    }

    try {
      const { error } = await supabase
        .from("clan_members")
        .insert({
          clan_id: clanId,
          device_id: deviceId,
          role: "member"
        });

      if (error) {
        if (error.code === "23505") {
          toast.error("You're already in this clan!");
        } else {
          throw error;
        }
        return;
      }

      toast.success(`Joined ${clanName}! 🎉`);
      onJoined();
      onClose();
    } catch (error) {
      console.error("Error joining clan:", error);
      toast.error("Failed to join clan");
    }
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
          className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col border-2 border-purple-600"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6" />
              Discover Clans
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search clans..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-800 px-4 pb-2 pt-2">
            <button
              onClick={() => setView('all')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                view === 'all' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Grid className="w-4 h-4" />
              All Clans
            </button>
            <button
              onClick={() => setView('trending')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                view === 'trending' 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              🔥 Trending
            </button>
          </div>

          {/* Clans List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : clans.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                <p className="font-medium">No clans found</p>
                <p className="text-sm mt-1">Try a different search</p>
              </div>
            ) : (
              clans.map((clan, index) => (
                <motion.div
                  key={clan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition-colors border border-gray-700 hover:border-purple-500"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-3xl">{clan.emoji || "🌟"}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white">{clan.name}</h3>
                          {clan.privacy === "private" && (
                            <Shield className="w-4 h-4 text-purple-400" />
                          )}
                          {view === 'trending' && index < 3 && (
                            <span className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded-full font-bold">
                              #{index + 1}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          {clan.description || "No description"}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {clan.member_count} members
                          </span>
                          {view === 'trending' && clan.message_count !== undefined && (
                            <span className="flex items-center gap-1">
                              💬 {clan.message_count} messages
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => joinClan(clan.id, clan.name)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-medium transition-all whitespace-nowrap"
                    >
                      Join
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
