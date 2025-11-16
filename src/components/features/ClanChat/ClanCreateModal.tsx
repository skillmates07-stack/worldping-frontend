import { useState } from "react";
import { Shield, Palette } from "lucide-react";

export default function ClanCreateModal({ open, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [emoji, setEmoji] = useState("⚡");
  const [color, setColor] = useState("from-blue-500 to-purple-500");
  const [privacy, setPrivacy] = useState("public");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    setLoading(true);
    // Call your API here: createClan({ name, desc, emoji, color, privacy });
    // On success call: onCreated();
    setLoading(false);
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
          {/* You could add an emoji picker here */}
          <select value={color} onChange={e=>setColor(e.target.value)} className="rounded p-1">
            <option value="from-blue-500 to-purple-500">Blue→Purple</option>
            <option value="from-pink-500 to-yellow-400">Pink→Yellow</option>
            <option value="from-green-500 to-cyan-400">Green→Cyan</option>
            {/* Add more */}
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
      </form>
    </div>
  ) : null;
}
