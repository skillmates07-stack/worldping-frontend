import { useState } from "react";
import { useClanDiscovery } from "@/hooks/useClanDiscovery";
import { Shield } from "lucide-react";

interface Clan {
  id: string;
  name: string;
  emoji?: string;
  member_count?: number;
  privacy?: string;
}

interface ClanDiscoveryModalProps {
  open: boolean;
  onClose: () => void;
  onJoin: (clanId: string) => void;
}

export default function ClanDiscoveryModal({
  open,
  onClose,
  onJoin,
}: ClanDiscoveryModalProps) {
  const [query, setQuery] = useState("");
  const { clans, loading } = useClanDiscovery(query);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <input
            className="w-full rounded-xl border px-3 py-1"
            placeholder="Search clans..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="space-y-3">
          {loading ? (
            <div>Loading...</div>
          ) : clans.length === 0 ? (
            <div>No clans found</div>
          ) : (
            clans.map((clan: Clan) => (
              <div
                key={clan.id}
                className="flex items-center gap-3 justify-between px-3 py-2 rounded-lg bg-gradient-to-r from-blue-200 to-purple-100 shadow"
              >
                {clan.emoji && <span className="text-2xl">{clan.emoji}</span>}
                <div>
                  <span className="font-bold">{clan.name}</span>
                  {typeof clan.member_count === "number" && (
                    <span className="ml-3 text-xs text-gray-500">
                      {clan.member_count} members
                    </span>
                  )}
                  {clan.privacy === "private" && (
                    <Shield className="inline w-4 h-4 text-purple-500" />
                  )}
                </div>
                <button
                  className="px-3 py-1 bg-blue-500 rounded-md text-white"
                  onClick={() => onJoin(clan.id)}
                >
                  Join
                </button>
              </div>
            ))
          )}
        </div>
        <button
          className="mt-6 w-full py-2 rounded-xl bg-gray-100"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
