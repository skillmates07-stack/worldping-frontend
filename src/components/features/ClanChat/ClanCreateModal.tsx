import { useState } from "react";
import { Shield, Palette } from "lucide-react";

// Explicit interface for Clan discovery results
interface Clan {
  id: string;
  name?: string;
  emoji?: string;
  member_count?: number;
  privacy?: string;
}

// Type your component props
interface ClanCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  clans: Clan[];
}

export default function ClanCreateModal({
  open,
  onClose,
  onCreated,
  clans, // Array of discovered clans, passed in to modal
}: ClanCreateModalProps) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [emoji, setEmoji] = useState("⚡");
  const [color, setColor] = useState("from-blue-500 to-purple-500");
  const [privacy, setPrivacy] = useState<"public" | "private">("public");
  const [loading, setLoading] = useState(false);

  // If you need your own local state for clans, initialize it with type:
  // const [clans, setClans] = useState<Clan[]>([]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // API call logic goes here
    setLoading(false);
    onCreated();
  }

  return open ? (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <form
        className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4"
        onSubmit={handleCreate}
      >
        <div className="text-lg font-bold mb-2">Create new clan</div>
        <div>
          <label className="block text-xs font-semibold">Clan Name</label>
          <input
            className="w-full rounded-md border p-2 text-lg"
            value={name}
            maxLength={50}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold">Description (optional)</label>
          <input
            className="w-full rounded-md border p-2"
            value={desc}
            maxLength={200}
            onChange={e => setDesc(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl cursor-pointer">{emoji}</span>
          <select value={color} onChange={e => setColor(e.target.value)} className="rounded p-1">
            <option value="from-blue-500 to-purple-500">Blue→Purple</option>
            <option value="from-pink-500 to-yellow-400">Pink→Yellow</option>
            <option value="from-green-500 to-cyan-400">Green→Cyan</option>
          </select>
          <Palette className="w-5 h-5 text-gray-500" />
        </div>
        <div className="flex items-center gap-3">
          <label>
            <input
              type="radio"
              name="privacy"
              value="public"
              checked={privacy === "public"}
              onChange={() => setPrivacy("public")}
            /> Public
          </label>
          <label>
            <input
              type="radio"
              name="privacy"
              value="private"
              checked={privacy === "private"}
              onChange={() => setPrivacy("private")}
            />
            Private <Shield className="inline w-4 h-4 text-purple-500" />
          </label>
        </div>
        <button
          disabled={loading || !name}
          className="w-full bg-blue-500 text-white rounded-md py-2 mt-2"
        >
          {loading ? "Creating..." : "Create Clan"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2 mt-2 rounded-xl bg-gray-100"
        >
          Cancel
        </button>
        {/* Render the list of discovered clans, with typing */}
        <div className="mt-4">
          {clans.length === 0
            ? <div className="text-gray-400">No clans found</div>
            : clans.map((clan: Clan) => (
                <div key={clan.id} className="flex items-center gap-3 justify-between px-3 py-2 rounded-lg bg-gradient-to-r from-blue-200 to-purple-100 shadow">
                  <span className="text-2xl">{clan.emoji}</span>
                  <div>
                    <span className="font-bold">{clan.name}</span>
                    <span className="ml-3 text-xs text-gray-500">{clan.member_count} members</span>
                    {clan.privacy === "private" && <Shield className="inline w-4 h-4 text-purple-500" />}
                  </div>
                  <button className="px-3 py-1 bg-blue-500 rounded-md text-white">
                    Join
                  </button>
                </div>
              ))}
        </div>
      </form>
    </div>
  ) : null;
}
