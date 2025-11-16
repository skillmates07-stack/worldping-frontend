// src/hooks/useClanMembership.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface Clan {
  id: string;
  name: string;
  emoji?: string;
  unread?: number;
  // Add any other fields your clan objects include
}

export function useJoinedClans(): { clans: Clan[]; loading: boolean } {
  const [clans, setClans] = useState<Clan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchClans() {
      setLoading(true);
      // Example: Replace with your method to get current deviceId or userId
      const currentDeviceId =
        typeof window !== "undefined" ? localStorage.getItem("deviceId") : "";
      if (!currentDeviceId) {
        setClans([]);
        setLoading(false);
        return;
      }
      // Query all clan memberships for this user/device
      const { data: memberships, error } = await supabase
        .from("clan_members")
        .select("clan_id, clans:clan_id(id, name, emoji)")
        .eq("device_id", currentDeviceId);

      if (!mounted) return;
      if (error) {
        setClans([]);
      } else if (memberships) {
        // Flatten clan data and optionally add unread (set to 0 for now)
        setClans(
          memberships
            .filter((m: any) => m.clans)
            .map(
              (m: any) =>
                ({
                  id: m.clans.id,
                  name: m.clans.name,
                  emoji: m.clans.emoji,
                  unread: 0
                } as Clan)
            )
        );
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
