import { useState } from "react";
import { Globe, Users, Plus } from "lucide-react";
import { useJoinedClans, Clan } from "@/hooks/useClanMembership";
import GlobalChatPanel from "../GlobalChat/GlobalChatPanel";
import ClanMessagesPanel from "./ClanMessagesPanel";
import ClanDiscoveryModal from "./ClanDiscoveryModal";

export default function ClanChatPanel() {
  const [activeTab, setActiveTab] = useState<"global" | string>("global");
  const [discoveryOpen, setDiscoveryOpen] = useState(false);
  const { clans } = useJoinedClans();

  const handleJoinClan = (clanId: string) => {
    setActiveTab(clanId);
    setDiscoveryOpen(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white/80 backdrop-blur rounded-2xl shadow-lg">
      <div className="flex px-3 py-2 border-b border-gray-200 gap-2 bg-gradient-to-r from-blue-400 to-teal-400">
        <button className={`tab ${activeTab === "global" ? "active" : ""}`} onClick={() => setActiveTab("global")}>
          <Globe className="w-5 h-5" /> Global
        </button>
        {clans.map((clan: Clan) => (
          <button key={clan.id}
                  className={`tab ${activeTab === clan.id ? "active" : ""}`}
                  onClick={() => setActiveTab(clan.id)}>
            <span className="mr-1 text-xl">{clan.emoji}</span>
            {clan.name}
            {clan.unread && clan.unread > 0 && <span className="badge">{clan.unread}</span>}
          </button>
        ))}
        <button className="ml-auto" aria-label="Join or create clan" onClick={() => setDiscoveryOpen(true)}>
          <Plus className="w-5 h-5" />
        </button>
      </div>
      <div className="p-4 min-h-[300px]">
        {activeTab === "global"
          ? <GlobalChatPanel />
          : <ClanMessagesPanel clanId={activeTab} />}
      </div>
      <ClanDiscoveryModal
        open={discoveryOpen}
        onClose={() => setDiscoveryOpen(false)}
        onJoin={handleJoinClan}
      />
    </div>
  );
}
