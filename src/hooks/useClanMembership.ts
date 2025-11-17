import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export interface Clan {
  id: string;
  name: string;
  emoji?: string;
  unread?: number;
}

export function useJoinedClans(): { clans: Clan[]; loading: boolean } {
  const [clans, setClans] = useState<Clan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    async function fetchClans() {
      setLoading(true);
      
      // Get device ID
      const currentDeviceId =
        typeof window !== "undefined" ? localStorage.getItem("deviceId") : "";
      
      console.log("Current device ID:", currentDeviceId); // Debug log
      
      if (!currentDeviceId) {
        console.warn("No device ID found");
        setClans([]);
        setLoading(false);
        return;
      }

      // Query clan memberships
      const { data: memberships, error } = await supabase
        .from("clan_members")
        .select("clan_id, clans:clan_id(id, name, emoji)")
        .eq("device_id", currentDeviceId);

      console.log("Fetched memberships:", memberships, "Error:", error); // Debug log

      if (!mounted) return;
      
      if (error) {
        console.error("Error fetching clans:", error);
        setClans([]);
      } else if (memberships) {
        const clanList = memberships
          .filter((m: any) => m.clans)
          .map((m: any) => ({
            id: m.clans.id,
            name: m.clans.name,
            emoji: m.clans.emoji,
            unread: 0
          } as Clan));
        
        console.log("Parsed clans:", clanList); // Debug log
        setClans(clanList);
      }
      setLoading(false);
    }
    
    fetchClans();
    
    return () => {
      mounted = false;
    };
  }, []);

  return { clans, loading };
}
